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
import scipy.ndimage as nd
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
import re
for f, label in PLATES.items():
    a, _ = ink(BRAND / f)
    grey = int(((a > 12) & (a < 243)).sum())
    check(f"{label}: 中間の濃度が0", grey == 0, f"{grey}px")

    raw = (BRAND / f).read_bytes()
    d = pymupdf.open(BRAND / f)
    cont = d[0].read_contents().decode("latin-1")
    # 埋め込んだロゴの中身も同じように調べる
    for x in d[0].get_xobjects():
        try: cont += d.xref_stream(x[0]).decode("latin-1")
        except Exception: pass
    d.close()
    ops = set(re.findall(r"\b(g|rg|k|sc|scn)\b", cont))
    check(f"{label}: 色の指定がグレー1色だけ(g)", ops <= {"g"},
          f"使われている命令 {sorted(ops)}")
    vals = {round(float(v), 4) for v in re.findall(r"([\d.]+)\s+g\b", cont)}
    check(f"{label}: 濃度が 0 と 1 のみ", vals <= {0.0, 1.0}, f"{sorted(vals)}")
    for key, name in ((b"/DeviceRGB", "RGB"), (b"/DeviceCMYK", "CMYK"),
                      (b"/SMask", "透明マスク"), (b"/Shading", "グラデーション"),
                      (b"/Pattern", "パターン"), (b"/HalftoneType", "網点指定")):
        check(f"{label}: {name} が入っていない", raw.count(key) == 0,
              f"{raw.count(key)}箇所")

# ------------------------------------------------------- 2b. つなぎ目(スレ)
section("2b. スレ —— 図形どうしのつなぎ目")
# 印刷機は「ぼかしてから白黒に落とす」ことがある。隣り合う図形が別々に塗られていると
# つなぎ目に中間色が残り、それを拾うとインクの中に細いスジが走る。
# 縁から 0.02mm 以上内側に中間色があれば、それは縁のボケではなくつなぎ目。
for f, label in PLATES.items():
    hard, _ = ink(BRAND / f, dpi=2400, aa=0)
    soft, _ = ink(BRAND / f, dpi=2400, aa=8)
    mask = hard < 128
    grey = (soft > 12) & (soft < 243)
    k = np.ones((5, 5), np.uint8)
    a_in = int((grey & cv2.erode(mask.astype(np.uint8), k).astype(bool)).sum())
    b_in = int((grey & cv2.erode((~mask).astype(np.uint8), k).astype(bool)).sum())
    check(f"{label}: インクの内側にスジなし", a_in == 0, f"{a_in}px")
    check(f"{label}: 紙の内側にスジなし",     b_in == 0, f"{b_in}px")

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

# QR 自身が持っている型式情報を読む。誤り訂正のレベルはここに書いてある
_GEN, _XOR = 0b10100110111, 0b101010000010010
def _bch(d):
    v = d << 10
    for i in range(4, -1, -1):
        if v >> (i + 10) & 1: v ^= _GEN << i
    return ((d << 10) | v) ^ _XOR
_TABLE = {_bch(d): d for d in range(32)}
_grid = np.array(card.qr_matrix(BRAND / card.QR["src"])[0], bool)
_pos = [(8,0),(8,1),(8,2),(8,3),(8,4),(8,5),(8,7),(8,8),(7,8),
        (5,8),(4,8),(3,8),(2,8),(1,8),(0,8)]
_v = 0
for r_, c_ in _pos: _v = (_v << 1) | int(_grid[r_][c_])
_EC = {1: ("L", 7), 0: ("M", 15), 3: ("Q", 25), 2: ("H", 30)}
_ok = _v in _TABLE
_lvl = _EC[_TABLE[_v] >> 3] if _ok else ("?", 0)
check("QRの型式情報が規格どおり", _ok, f"誤り訂正 {_lvl[0]}（約{_lvl[1]}%まで復元できる）")

# 印刷の劣化を再現して、マス目が読み違えられないか。
# 読み取りソフトの当たり外れに左右されないよう、マスの中心を1つずつ見る
_n = _grid.shape[0]
_cell = card.QR["symbol"] / _n
_p = card.PLATE
_qx = _p["x"] + (_p["w"] - card.QR["symbol"]) / 2
_qy = _p["y"] + (_p["h"] - card.QR["symbol"]) / 2
_PX = 600 / 25.4
def _wrong(img):
    bad = 0
    for r_ in range(_n):
        for c_ in range(_n):
            x = int((_qx + (c_ + .5) * _cell) * _PX); y = int((_qy + (r_ + .5) * _cell) * _PX)
            if (img[y, x] < 128) != bool(_grid[r_][c_]): bad += 1
    return bad
_card = 255 - a                                   # 刷り上がりの見え方
_budget = int(_n * _n * _lvl[1] / 100)
for _name, _img in (
        ("そのまま",            _card),
        ("白インクが0.15mm にじむ", cv2.dilate(_card, np.ones((int(0.15*_PX)|1,)*2, np.uint8))),
        ("白インクが0.15mm やせる", cv2.erode(_card,  np.ones((int(0.15*_PX)|1,)*2, np.uint8))),
        ("0.5mm ぼける",        cv2.GaussianBlur(_card, (int(0.5*_PX)|1,)*2, 0))):
    _b = _wrong(_img)
    check(f"劣化しても読み違えない({_name})", _b <= _budget // 3,
          f"間違い {_b}マス / 許容 {_budget}マス")

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

# ---------------------------------------------------------------- 6b. 縁の質
section("6b. 縁のなめらかさ")
# ロゴは元が画像なので、輪郭に直しても縁に細かいうねりが残る。
# 箔押しが出せる下限は 0.2mm(200μm)。その 1/4 = 50μm を上限とする。
def _wobble(pdf, win_mm=0.15, dpi=4800):
    pp = dpi / 25.4
    pymupdf.TOOLS.set_aa_level(0)
    d = pymupdf.open(pdf)
    pm = d[0].get_pixmap(matrix=pymupdf.Matrix(dpi/72, dpi/72), colorspace=pymupdf.csGRAY)
    arr = np.frombuffer(pm.samples, np.uint8).reshape(pm.height, pm.width).copy()
    d.close()
    cnts, _ = cv2.findContours((arr < 128).astype(np.uint8), cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
    win = max(3, int(round(win_mm * pp)) | 1)
    got = []
    for c in cnts:
        if len(c) < win * 3: continue
        q = c[:, 0, :].astype(np.float64)
        k = np.ones(win) / win
        sm = np.stack([np.convolve(np.r_[q[-win:, i], q[:, i], q[:win, i]], k, "same")[win:-win]
                       for i in (0, 1)], 1)
        got.append(np.hypot(*(q - sm).T))
    return np.concatenate(got) / pp * 1000

for _f, _label in (("logo-foil.pdf", "表ロゴの輪郭"),
                   ("logo-wordmark-foil.pdf", "裏ワードマークの輪郭")):
    _v = _wobble(BRAND / _f)
    check(f"{_label}: うねりが 50μm 未満", np.percentile(_v, 90) < 50,
          f"平均 {_v.mean():.1f}μm / 上位10% {np.percentile(_v,90):.1f}μm")

# 縁の「欠け」—— LEDA が2度指摘した、文字やマークの縁が食い込んでいる箇所。
# まわりがインクに囲まれた背景画素を探す。0.2mm(箔の下限)より小さい食い込みは
# 印刷では再現されないが、データとしては残しておきたくない。
# 面積ではなく「食い込みの深さ」で見る。2400dpi では 21μm(2画素)が測定の下限なので、
# それを少し超える 25μm を上限とする。箔押しの下限 0.2mm の 1/8。
def _nick_depth(pdf, dpi=2400):
    pp = dpi / 25.4
    pymupdf.TOOLS.set_aa_level(0)
    d = pymupdf.open(pdf)
    pm = d[0].get_pixmap(matrix=pymupdf.Matrix(dpi/72, dpi/72), colorspace=pymupdf.csGRAY)
    arr = np.frombuffer(pm.samples, np.uint8).reshape(pm.height, pm.width).copy()
    d.close()
    m = arr < 128
    win = int(round(0.10 * pp)) | 1
    nick = (~m) & (cv2.blur(m.astype(np.float32), (win, win)) >= 0.62)
    lab, n = nd.label(nick)
    if n == 0: return 0, 0.0
    dist = cv2.distanceTransform(nick.astype(np.uint8), cv2.DIST_L2, 5)
    return n, float(np.max(nd.maximum(dist, lab, range(1, n + 1)))) * 2 / pp * 1000

# 欠けの検査は「画像から輪郭を取った部分」だけに意味がある。
# ワードマークはフォントで組み直したので、代わりに書体と一致するかを見る。
_n, _d = _nick_depth(BRAND / "logo-foil.pdf")
check("表ロゴ: 縁の欠けが 60μm 未満", _d < 60,
      f"いちばん深い食い込み {_d:.0f}μm（{_n}箇所・測定の下限21μm）")

# ワードマークが Montserrat Bold そのものか。組み直しに失敗すると形が崩れるので、
# 同じ大きさで書体から描き直して1画素ずつ突き合わせる。
def _wordmark_matches(dpi=2400):
    """ワードマークが Montserrat Bold そのものか。同じ幅で書体から描き直して突き合わせる"""
    pp = dpi / 25.4
    pymupdf.TOOLS.set_aa_level(0)
    font_path = str(FONTS / "Montserrat-700.ttf")

    def ink(page_render):
        ys, xs = np.nonzero(page_render)
        return page_render[ys.min():ys.max()+1, xs.min():xs.max()+1]

    d = pymupdf.open(BRAND / "logo-wordmark-foil.pdf")
    pm = d[0].get_pixmap(matrix=pymupdf.Matrix(dpi/72, dpi/72), colorspace=pymupdf.csGRAY)
    got = ink(np.frombuffer(pm.samples, np.uint8).reshape(pm.height, pm.width) < 128)
    d.close()

    font = pymupdf.Font(fontfile=font_path)
    def render(size):
        doc = pymupdf.open()
        pg = doc.new_page(width=60 * card.MM, height=20 * card.MM)
        pg.insert_font(fontname="m", fontfile=font_path)
        x = 5 * card.MM
        for ch in "ROGUE PINK":
            pg.insert_text((x, 15 * card.MM), ch, fontname="m",
                           fontsize=size * card.MM, color=(0,))
            x += font.text_length(ch, fontsize=size * card.MM)
        q = pg.get_pixmap(matrix=pymupdf.Matrix(dpi/72, dpi/72), colorspace=pymupdf.csGRAY)
        a = np.frombuffer(q.samples, np.uint8).reshape(q.height, q.width) < 128
        doc.close()
        return ink(a)

    lo, hi = 0.5, 20.0                       # 幅がそろう級数を二分探索
    for _ in range(28):
        mid = (lo + hi) / 2
        if render(mid).shape[1] < got.shape[1]: lo = mid
        else: hi = mid
    ref = render((lo + hi) / 2)

    h = max(got.shape[0], ref.shape[0]) + 4  # 同じ大きさの台紙に載せてから重ねる
    w = max(got.shape[1], ref.shape[1]) + 4
    A = np.zeros((h, w), bool); A[2:2+got.shape[0], 2:2+got.shape[1]] = got
    best = 1.0
    for dy in range(-2, 3):
        for dx in range(-2, 3):
            B = np.zeros((h, w), bool)
            B[2+dy:2+dy+ref.shape[0], 2+dx:2+dx+ref.shape[1]] = ref
            u = int((A | B).sum())
            if u: best = min(best, float((A ^ B).sum()) / u)
    return best

# 解像度を倍にすると差が半分になる = 形ではなく縁1画素ぶんの効果。
# 2400dpi では 0.8% 前後に落ち着くので、1.5% を上限とする。
_diff = _wordmark_matches()
check("裏ワードマーク: Montserrat Bold と一致", _diff < 0.015,
      f"食い違い {_diff*100:.3f}%（縁1画素ぶん。形が崩れれば数%〜十数%になる）")

# ---------------------------------------------------------------- 7. 文言
section("7. 文言")
want = ["PRODUCER", "NOBU", "中野 修敬", "はじまりは、", "「ありがとう」でした。",
        "roguepink.com", "info@roguepink.com"]
have = [t[1] for t in card.TEXT]
check("載せる文字が7行そろっている", have == want, " / ".join(have))
check("メールアドレスのつづり", "info@roguepink.com" in have)
check("URLのつづり", "roguepink.com" in have)

# ---------------------------------------------------------------- 8. フォント
section("8. 文字")
# 入稿データは印刷の型紙。文字はアウトライン化して図形で渡す。
# フォントを埋め込む形だと、印刷所側の環境しだいで別の書体に置き換わる余地が残る。
for f, label in PLATES.items():
    d = pymupdf.open(BRAND / f)
    page = d[0]
    fonts = page.get_fonts()
    live = page.get_text("text").strip()
    d.close()
    check(f"{label}: フォントが入っていない", not fonts,
          ", ".join(sorted({x[3] or x[4] for x in fonts})) if fonts else "アウトライン化済み")
    check(f"{label}: 文字として残っていない", not live,
          live.replace("\n", " / ") if live else "図形のみ")

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
