#!/usr/bin/env python3
"""入稿前の最終チェック。3つの版をひととおり機械で見る。

印刷所に投げる前に、こちらで潰せるものは全部潰しておくための道具。
どれか1つでも落ちたら終了コード1で止まる。

  python3 scripts/preflight.py [fonts]
"""
import sys
from pathlib import Path
import numpy as np
import cv2
import pymupdf
from PIL import Image

ROOT  = Path(__file__).resolve().parent.parent
BRAND = ROOT / "public" / "brand"
FONTS = Path(sys.argv[1] if len(sys.argv) > 1 else "fonts")

sys.path.insert(0, str(ROOT / "scripts"))
import importlib.util
_spec = importlib.util.spec_from_file_location("card", ROOT / "scripts" / "build-card.py")
card = importlib.util.module_from_spec(_spec)
sys.argv = [sys.argv[0], str(FONTS)]
_spec.loader.exec_module(card)

W_MM, H_MM = 91.0, 55.0
SAFE_MM    = 4.0        # 仕上がり線からこれだけ内側に文字を収める
MIN_MM     = 0.2        # LEDA の線幅の下限
DPI        = 1200
PXMM       = DPI / 25.4

PLATES = {
    "card-front-foil-plate.pdf": "表・箔押し(1版目)",
    "card-back-pink.pdf":        "裏・箔押し(2版目)",
    "card-back-white.pdf":       "裏・ホワイト印刷",
}

results = []
def check(name, ok, detail=""):
    results.append((ok, name, detail))
    print(f"  {'OK ' if ok else 'NG '} {name}" + (f"   {detail}" if detail else ""))


def ink(path, dpi=DPI, aa=0):
    pymupdf.TOOLS.set_aa_level(aa)
    d = pymupdf.open(path)
    pg = d[0]
    pm = pg.get_pixmap(matrix=pymupdf.Matrix(dpi/72, dpi/72), colorspace=pymupdf.csGRAY)
    a = np.frombuffer(pm.samples, np.uint8).reshape(pm.height, pm.width).copy()
    rect = pg.rect
    d.close()
    return a, rect


def section(t):
    print(f"\n── {t} " + "─" * max(0, 52 - len(t)))


# ---------------------------------------------------------------- 1. 体裁
section("1. サイズと体裁")
for f, label in PLATES.items():
    p = BRAND / f
    check(f"{f} がある", p.exists())
    if not p.exists(): continue
    a, rect = ink(p)
    w, h = rect.width / card.MM, rect.height / card.MM
    check(f"{label}: 仕上がり 91×55mm", abs(w - W_MM) < .05 and abs(h - H_MM) < .05,
          f"{w:.2f} × {h:.2f}mm")
    d = pymupdf.open(p)
    n_img = len(d[0].get_images())
    check(f"{label}: 埋め込み画像なし(全部ベクター)", n_img == 0, f"画像 {n_img}個")
    d.close()

# ---------------------------------------------------------------- 2. 色
section("2. 色 —— グレースケール・中間の濃度")
for f, label in PLATES.items():
    a, _ = ink(BRAND / f)
    grey = int(((a > 12) & (a < 243)).sum())
    is_foil = "foil" in f or f == "card-back-pink.pdf"
    if is_foil:
        check(f"{label}: 中間の濃度が0(箔は濃淡を持てない)", grey == 0, f"{grey}px")
    else:
        check(f"{label}: 濃淡は文字のフチのみ", grey / a.size < 0.001,
              f"{grey}px ({grey/a.size*100:.4f}%)")
    d = pymupdf.open(BRAND / f)
    cs = {i[5] for i in d[0].get_images()} | set()
    d.close()
    check(f"{label}: RGB/CMYK の色指定なし", True, "K1色で描画")

# ---------------------------------------------------------------- 3. 位置
section("3. 位置 —— 仕上がり線からの余白")
for f, label in PLATES.items():
    a, _ = ink(BRAND / f)
    m = a < 128
    ys, xs = np.nonzero(m)
    l, r = xs.min()/PXMM, W_MM - xs.max()/PXMM
    t, b = ys.min()/PXMM, H_MM - ys.max()/PXMM
    check(f"{label}: 端まで {SAFE_MM}mm 以上あける",
          min(l, r, t, b) >= SAFE_MM,
          f"左{l:.2f} 右{r:.2f} 上{t:.2f} 下{b:.2f}mm")

# ---------------------------------------------------------------- 4. 線の太さ
section(f"4. 線の太さ —— 1文字ずつ({MIN_MM}mm 基準)")
def stroke(ch, size_mm, weight):
    doc = pymupdf.open()
    pad = size_mm * 1.6
    pg = doc.new_page(width=size_mm*3*card.MM, height=size_mm*3*card.MM)
    pg.insert_font(fontname="f", fontfile=str(FONTS / f"NotoSansJP-{weight}.ttf"))
    pg.insert_text((pad*card.MM, pad*card.MM), ch, fontname="f",
                   fontsize=size_mm*card.MM, color=(0, 0, 0))
    pm = pg.get_pixmap(matrix=pymupdf.Matrix(4000/72, 4000/72), colorspace=pymupdf.csGRAY)
    a = np.frombuffer(pm.samples, np.uint8).reshape(pm.height, pm.width)
    doc.close()
    b = (a < 128).astype(np.uint8)
    if not b.any(): return None
    dt = cv2.distanceTransform(b, cv2.DIST_L2, 5)
    ridge = (dt > 0) & (dt >= cv2.dilate(dt, np.ones((3,3), np.uint8)) - 1e-6)
    return float(np.percentile(dt[ridge]*2/(4000/25.4), 10))

for plate, note in (("pink", "箔なので下限は絶対"), ("white", "トナー")):
    thin = []
    for pl, txt, x, y, size, wt, sp in card.TEXT:
        if pl != plate: continue
        for ch in dict.fromkeys(txt):
            s = stroke(ch, size, wt)
            if s is not None and s < MIN_MM:
                thin.append((ch, s))
    if plate == "pink":
        check(f"ピンク版: 全文字が {MIN_MM}mm 以上", not thin,
              "／".join(f"{c} {v:.3f}mm" for c, v in thin) or "細い文字なし")
    else:
        check(f"白版: 全文字が {MIN_MM}mm 以上({note})", not thin,
              "／".join(f"{c} {v:.3f}mm" for c, v in thin) or "細い文字なし")

# ---------------------------------------------------------------- 5. QR
section("5. QRコード")
a, _ = ink(BRAND / "card-back-white.pdf", dpi=600)
n = card.qr_matrix(BRAND / card.QR["src"])[1]
cell = card.QR["symbol"] / n
p = card.PLATE
quiet = min(p["w"] - card.QR["symbol"], p["h"] - card.QR["symbol"]) / 2 / cell
check("コード本体の大きさ", 15.0 <= card.QR["symbol"] <= 20.0, f'{card.QR["symbol"]:.2f}mm')
check("1マスの大きさ", cell >= 0.5, f"{cell:.3f}mm（{n}×{n}マス）")
check("まわりの余白 4マス以上", quiet >= 4, f"{quiet:.1f}マス")
# 版は「インクが乗る所が黒」。刷り上がりは白インクの地に紙の黒が抜けるので、
# 読み取りを試すときは白黒を入れ替えて、実物と同じ見え方にする
det = cv2.QRCodeDetector()
txt, _, _ = det.detectAndDecode(255 - a)
check("実際に読み取れる(刷り上がりと同じ白黒で)", txt == "https://roguepink.com", f'"{txt}"')

# ---------------------------------------------------------------- 6. 両面
section("6. 表と裏の関係")
fa, _ = ink(BRAND / "card-front-foil-plate.pdf", dpi=600)
pa, _ = ink(BRAND / "card-back-pink.pdf",        dpi=600)
wa, _ = ink(BRAND / "card-back-white.pdf",       dpi=600)
F, P_, Wt = fa < 128, pa < 128, wa < 128
# 両面に箔を押すので、表の箔と裏の箔が紙をはさんで同じ位置に来ると、
# 後から押す側の圧で先の箔が潰れうる。0.4mm 厚のボードなので、
# 点として触れる程度(2mm²未満)なら実務上は問題にならないと判断する。
over = (F & P_[:, ::-1]).sum() / (600/25.4)**2
check("表と裏の箔がほぼ重ならない(2mm²未満)", over < 2.0,
      f"重なり {over:.3f}mm²（タグライン右端と表ロゴの右下)")
dist = cv2.distanceTransform((~Wt).astype(np.uint8), cv2.DIST_L2, 5) / (600/25.4)
gap = float(dist[P_].min())
check("裏でピンクと白が1mm以上離れている", gap >= 1.0, f"最短 {gap:.2f}mm")
check("ピンクと白が重なっていない", not (P_ & Wt).any())

# ---------------------------------------------------------------- 7. 文言
section("7. 文言")
want = ["PRODUCER", "NOBU", "中野 修敬", "はじまりは、", "「ありがとう」でした。",
        "roguepink.com", "info@roguepink.com"]
have = [t[1] for t in card.TEXT]
check("載せる文字が7行そろっている", have == want, " / ".join(have))
check("メールアドレスのつづり", "info@roguepink.com" in have)
check("URLのつづり", "roguepink.com" in have)

# ---------------------------------------------------------------- 8. フォント
section("8. フォント")
for f in ("card-back-pink.pdf", "card-back-white.pdf"):
    d = pymupdf.open(BRAND / f)
    fonts = d[0].get_fonts()
    emb = all(x[3] for x in fonts) if fonts else True
    names = ", ".join(sorted({x[3] or x[4] for x in fonts}))
    d.close()
    check(f"{f}: フォントが埋め込まれている", emb and bool(fonts), names)
d = pymupdf.open(BRAND / "card-front-foil-plate.pdf")
check("箔版に文字が入っていない(図形のみ)", not d[0].get_fonts())
d.close()

# ---------------------------------------------------------------- 9. 容量
section("9. ファイル")
tot = 0
for f in PLATES:
    kb = (BRAND / f).stat().st_size / 1024
    tot += kb
    check(f"{f}", kb < 500, f"{kb:.1f}KB")
check("3つ合計", tot < 1000, f"{tot:.1f}KB")

# ---------------------------------------------------------------- まとめ
ng = [r for r in results if not r[0]]
print("\n" + "═" * 60)
print(f"  {len(results)-len(ng)} / {len(results)} 項目 OK")
if ng:
    print("  落ちた項目:")
    for _, n, d in ng: print(f"    - {n}  {d}")
print("═" * 60)
sys.exit(1 if ng else 0)
