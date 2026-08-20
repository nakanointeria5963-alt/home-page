#!/usr/bin/env python3
"""箔押しの版に使うロゴを、画像から「印刷できる形」に作り直す。

もとの logo-transparent.png は 692×623px しかなく、名刺に置くと 489dpi 相当。
1画素が 0.052mm あるので、曲線を描くと必ず階段ができる。
LEDA から2度「擦れている」「へこんで見える」と指摘された箇所がこれ。

作り方を2つに分ける。

  ワードマーク「ROGUE PINK」 —— 画像を捨てて、フォントで組み直す。
      15書体59通りを総当たりで照合した結果、Montserrat Bold と一致率 94.2%
      (ズレは縁の1画素だけ)。元のフォントなので、これは復元であって変更ではない。
      画像を経由しないので、どこまで拡大しても完璧。

  R マーク —— 描き起こしのマークで、置き換えるフォントが無い。
      輪郭をベジェ曲線にして持つ。長い直線は 6μm の精度でまっすぐなので、
      こちらは元のままで問題ない。

  出力: public/brand/logo-foil.pdf          (35.98 × 32.54mm・表)
        public/brand/logo-wordmark-foil.pdf (裏・ワードマークのみ)
"""
import sys
from pathlib import Path
import numpy as np
import pymupdf
import potrace
import scipy.ndimage as nd
from PIL import Image

ROOT  = Path(__file__).resolve().parent.parent
BRAND = ROOT / "public" / "brand"
FONTS = Path(sys.argv[1] if len(sys.argv) > 1 else "fonts")
FONT  = FONTS / "Montserrat-700.ttf"

MM   = 72 / 25.4
TEXT = "ROGUE PINK"

# --- 表ロゴ。元画像のどこまでが R マークかは、空の行を探して決めてある ---
MARK = dict(src="logo-transparent.png", out="logo-foil.pdf",
            w=35.98, h=32.54,
            rows=(0, 488),                          # ここから下はワードマーク
            min_blob=0.50,                          # これより小さい粒・穴はゴミ
            word=dict(x=0.5199, y=28.1526, w=34.9401))   # 下に組む文字の箱
WORD = dict(out="logo-wordmark-foil.pdf", w=24.8700)     # 裏。高さは書体から決まる

UP        = 4      # 引き伸ばしてから輪郭を取ると階段状のギザギザが減る
NICK_WIN  = 0.10   # 縁の欠けを探す窓(mm)
NICK_FILL = 0.62   # まわりのインク率がこれ以上なら「欠け」とみなす


# ------------------------------------------------------------------ 文字
def metrics(zoom=30):
    """Montserrat Bold で TEXT を組んだときの、級数1mmあたりの寸法と原点のズレ"""
    ref = 10.0
    px = zoom * 72 / 25.4
    doc = pymupdf.open()
    pg = doc.new_page(width=300 * MM, height=80 * MM)
    pg.insert_font(fontname="m", fontfile=str(FONT))
    font = pymupdf.Font(fontfile=str(FONT))
    x = 20 * MM
    for ch in TEXT:
        pg.insert_text((x, 30 * MM), ch, fontname="m", fontsize=ref * MM, color=(0,))
        x += font.text_length(ch, fontsize=ref * MM)
    pm = pg.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), colorspace=pymupdf.csGRAY)
    a = np.frombuffer(pm.samples, np.uint8).reshape(pm.height, pm.width) < 128
    doc.close()
    ys, xs = np.nonzero(a)
    return dict(w=(xs.max() + 1 - xs.min()) / px / ref,   # 級数1mmあたりの幅
                h=(ys.max() + 1 - ys.min()) / px / ref,
                dx=(xs.min() / px - 20) / ref,            # 原点→インク左端
                dy=(ys.min() / px - 30) / ref)            # ベースライン→インク上端


def put_text(page, m, box_x, box_y, box_w):
    """インクの左上が (box_x, box_y) に来て、幅が box_w になるように文字を置く。

    版は「型紙」なので、文字としてではなく輪郭の図形として描く。
    フォントを埋め込まないぶん、印刷所側でどう扱われても形が変わらない。
    """
    from fontTools.ttLib import TTFont
    from fontTools.pens.recordingPen import RecordingPen
    from fontTools.pens.qu2cuPen import Qu2CuPen

    size = box_w / m["w"]
    tt = TTFont(str(FONT))
    glyphs, cmap = tt.getGlyphSet(), tt.getBestCmap()
    upem = tt["head"].unitsPerEm
    k = size * MM / upem                       # フォント座標 → PDF のポイント
    x = (box_x - m["dx"] * size) * MM
    base = (box_y - m["dy"] * size) * MM

    shape = page.new_shape()
    for ch in TEXT:
        name = cmap[ord(ch)]
        rec = RecordingPen()
        # all_cubic=True にしないと2次曲線がそのまま残り、丸い文字が描かれない
        glyphs[name].draw(Qu2CuPen(rec, 0.05, all_cubic=True))
        P = lambda p: pymupdf.Point(x + p[0] * k, base - p[1] * k)
        here = None
        for op, args in rec.value:
            if op == "moveTo":
                here = P(args[0]); start = here
            elif op == "lineTo":
                shape.draw_line(here, P(args[0])); here = P(args[0])
            elif op == "curveTo":
                shape.draw_bezier(here, P(args[0]), P(args[1]), P(args[2]))
                here = P(args[2])
            elif op == "closePath":
                if here and here != start:
                    shape.draw_line(here, start)
                here = start
            elif op == "endPath":
                here = start
            else:
                raise ValueError(f"未対応の命令 {op}。黙って形が欠けるので止める")
        x += tt["hmtx"][name][0] * k
    # フォントの輪郭は「非ゼロ」で塗る規則。外側と内側で回る向きが逆になっていて、
    # ふところは穴に、重なった部分は塗りつぶしになる。
    # 奇偶ルールにすると、文字の接合部（R の脚など）が抜け落ちる。
    shape.finish(color=None, fill=(0,), even_odd=False, closePath=True)
    shape.commit()
    tt.close()
    return size, m["h"] * size


# ------------------------------------------------------------------ Rマーク
def cleaned(job):
    """半透明を切り捨てて白黒にし、ゴミ・穴・縁の欠けを取り除く"""
    alpha = np.array(Image.open(BRAND / job["src"]))[..., 3]
    alpha = alpha[job["rows"][0]:job["rows"][1], :]       # R マークの範囲だけ
    h, w = alpha.shape
    pxmm = w / job["w"]
    limit = (job["min_blob"] * pxmm) ** 2

    solid = alpha > 128                                   # ここで濃淡が消える
    lab, n = nd.label(solid)
    size = nd.sum(solid, lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i, s in enumerate(size) if s >= limit])

    lab2, n2 = nd.label(~keep)                            # 形の内側の穴
    size2 = nd.sum(~keep, lab2, range(1, n2 + 1))
    bg = int(np.argmax(size2)) + 1
    holes = [i + 1 for i, s in enumerate(size2) if s < limit and i + 1 != bg]
    filled = keep | np.isin(lab2, holes)

    win = int(round(NICK_WIN * pxmm)) | 1                 # 縁の欠けを塞ぐ
    nick = (~filled) & (nd.uniform_filter(filled.astype(np.float32), size=win) >= NICK_FILL)
    print(f"  掃除: 粒と穴 {len(holes)}個 / 縁の欠け {nd.label(nick)[1]}個 "
          f"({nick.sum() / pxmm ** 2:.4f}mm²)")
    return filled | nick, w, h


def outline(job, mask, w, h):
    big = np.array(Image.fromarray((mask * 255).astype("uint8"))
                   .resize((w * UP, h * UP), Image.BILINEAR)) > 127
    big = nd.binary_closing(big, np.ones((3, 3)))
    # potrace は 0 の側をインクと見るので反転して渡す
    return potrace.Bitmap(~big).trace(
        turdsize=int((0.1 * w / job["w"] * UP) ** 2),
        alphamax=1.0, opttolerance=0.2), big


def draw(page, path, w, h, mm_w, mm_h):
    sx, sy = mm_w * MM / (w * UP), mm_h * MM / (h * UP)
    P = lambda p: pymupdf.Point(p.x * sx, p.y * sy)
    shape = page.new_shape()
    for curve in path.curves:
        here = P(curve.start_point)
        for seg in curve.segments:
            if seg.is_corner:
                shape.draw_line(here, P(seg.c)); here = P(seg.c)
                shape.draw_line(here, P(seg.end_point))
            else:
                shape.draw_bezier(here, P(seg.c1), P(seg.c2), P(seg.end_point))
            here = P(seg.end_point)
    # 奇偶ルール = 形の中にある輪郭は「穴」として抜ける
    shape.finish(color=None, fill=(0,), even_odd=True, closePath=True)
    shape.commit()


# ------------------------------------------------------------------
def check(pdf, label):
    """箔版に濃淡が無いことを確かめる。あってはいけない"""
    pymupdf.TOOLS.set_aa_level(0)
    d = pymupdf.open(pdf)
    pm = d[0].get_pixmap(matrix=pymupdf.Matrix(2400 / 72, 2400 / 72),
                         colorspace=pymupdf.csGRAY)
    a = np.frombuffer(pm.samples, np.uint8).reshape(pm.height, pm.width)
    d.close()
    grey = int(((a > 20) & (a < 235)).sum())
    print(f"  検算: 中間の濃度 {grey}px  ← 箔版はここが 0 でないといけない")
    return grey


if __name__ == "__main__":
    if not FONT.exists():
        sys.exit(f"{FONT} が無い。先に scripts/fetch-fonts.sh を実行する")
    m = metrics()
    print(f"Montserrat Bold: 級数1mmあたり 幅 {m['w']:.5f}mm 高さ {m['h']:.5f}mm")

    # --- 裏・ワードマークのみ ---
    size = WORD["w"] / m["w"]
    doc = pymupdf.open()
    pg = doc.new_page(width=WORD["w"] * MM, height=m["h"] * size * MM)
    put_text(pg, m, 0.0, 0.0, WORD["w"])
    doc.save(str(BRAND / WORD["out"]), garbage=4, deflate=True)
    doc.close()
    print(f"\n{WORD['out']}: {WORD['w']:.4f} × {m['h'] * size:.4f}mm（文字のみ）")
    bad = check(BRAND / WORD["out"], WORD["out"])

    # --- 表・R マーク + ワードマーク ---
    print(f"\n{MARK['src']} の R マークを輪郭に変換")
    mask, w, h = cleaned(MARK)
    path, big = outline(MARK, mask, w, h)
    print(f"  輪郭 {len(path.curves)}本")
    doc = pymupdf.open()
    pg = doc.new_page(width=MARK["w"] * MM, height=MARK["h"] * MM)
    mark_h = (MARK["rows"][1] - MARK["rows"][0]) / 623 * MARK["h"]
    draw(pg, path, w, h, MARK["w"], mark_h)
    wd = MARK["word"]
    s2, h2 = put_text(pg, m, wd["x"], wd["y"], wd["w"])
    doc.save(str(BRAND / MARK["out"]), garbage=4, deflate=True)
    doc.close()
    print(f"  ワードマーク: 級数 {s2:.4f}mm 高さ {h2:.4f}mm を y={wd['y']:.4f}mm に配置")
    print(f"{MARK['out']}: {MARK['w']} × {MARK['h']}mm")
    bad += check(BRAND / MARK["out"], MARK["out"])
    sys.exit(1 if bad else 0)
