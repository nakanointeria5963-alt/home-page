#!/usr/bin/env python3
"""ロゴを「画像」から「輪郭の数式」に作り直す。

もとの logo-transparent.png は 692×623px しかなく、名刺に置くと 489dpi 相当。
縁に半透明の画素が残っていて、箔版にすると LEDA から
「文字の下部(R)が若干擦れている」と指摘された部分になる。

箔押しは型を紙に押しつける加工なので、版は濃淡を持てない。
黒か白のどちらかしかない。だから輪郭を数式にして、
どこまで拡大しても縁がなめらかで、中間の灰色が1画素も無い版を作る。

  出力: public/brand/logo-foil.pdf  (35.98 × 32.54mm・ベクター)
"""
import sys
from pathlib import Path
import numpy as np
import pymupdf
import potrace
import scipy.ndimage as nd
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / "public" / "brand"

SRC        = BRAND / "logo-transparent.png"
OUT        = BRAND / "logo-foil.pdf"
PLACED_W   = 35.98            # 名刺に置くときの横幅(mm)
PLACED_H   = 32.54
MIN_BLOB   = 0.5              # これより小さいカタマリ・穴はゴミとして消す(mm)
UP         = 4                # 引き伸ばしてから輪郭を取ると階段状のギザギザが減る
MM         = 72 / 25.4


def cleaned():
    """半透明を切り捨てて白黒にし、ゴミと穴を取り除く"""
    alpha = np.array(Image.open(SRC))[..., 3]
    h, w = alpha.shape
    limit = (MIN_BLOB * w / PLACED_W) ** 2      # 面積のしきい値(画素)

    solid = alpha > 128                          # ここで濃淡が消える
    lab, n = nd.label(solid)
    size = nd.sum(solid, lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i, s in enumerate(size) if s >= limit])

    lab2, n2 = nd.label(~keep)                   # 形の内側の穴を探す
    size2 = nd.sum(~keep, lab2, range(1, n2 + 1))
    background = int(np.argmax(size2)) + 1       # いちばん大きい=外側
    holes = [i + 1 for i, s in enumerate(size2)
             if s < limit and i + 1 != background]
    filled = keep | np.isin(lab2, holes)

    changed = int((filled ^ solid).sum())
    print(f"  掃除: 消した粒と埋めた穴 {n - int(keep.any()) + len(holes)}個 "
          f"/ 動いた画素 {changed}")
    return filled, w, h


def outline(mask, w, h):
    """白黒の形から輪郭のベジェ曲線を取り出す"""
    big = np.array(Image.fromarray((mask * 255).astype("uint8"))
                   .resize((w * UP, h * UP), Image.BILINEAR)) > 127
    big = nd.binary_closing(big, np.ones((3, 3)))       # 縁の毛羽立ちをならす
    # potrace は 0 の側をインクと見るので反転して渡す
    path = potrace.Bitmap(~big).trace(
        turdsize=int((0.2 * w / PLACED_W * UP) ** 2),   # 0.2mm 未満は拾わない
        alphamax=1.0, opttolerance=0.2)
    return path, big


def write(path, w, h):
    doc = pymupdf.open()
    page = doc.new_page(width=PLACED_W * MM, height=PLACED_H * MM)
    sx, sy = PLACED_W * MM / (w * UP), PLACED_H * MM / (h * UP)
    P = lambda p: pymupdf.Point(p.x * sx, p.y * sy)

    shape = page.new_shape()
    for curve in path.curves:
        here = P(curve.start_point)
        for seg in curve.segments:
            if seg.is_corner:
                shape.draw_line(here, P(seg.c))
                here = P(seg.c)
                shape.draw_line(here, P(seg.end_point))
            else:
                shape.draw_bezier(here, P(seg.c1), P(seg.c2), P(seg.end_point))
            here = P(seg.end_point)
    # 奇偶ルール = 形の中にある輪郭は「穴」として抜ける
    shape.finish(color=None, fill=(0, 0, 0), even_odd=True, closePath=True)
    shape.commit()
    doc.save(str(OUT), garbage=4, deflate=True)
    doc.close()


def verify(mask, w, h):
    """書き出したPDFを描き直して、元の形とどれだけ違うか測る"""
    pymupdf.TOOLS.set_aa_level(0)      # 縁のぼかしを切る。版に灰色があってはいけない
    doc = pymupdf.open(OUT)
    page = doc[0]
    zoom = pymupdf.Matrix(w * UP / page.rect.width, h * UP / page.rect.height)
    pm = page.get_pixmap(matrix=zoom, colorspace=pymupdf.csGRAY)
    got = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)
    doc.close()

    grey = int(((got > 20) & (got < 235)).sum())   # ぼかし無しなので、出れば本物の濃淡
    diff = int(((got < 128) ^ mask).sum())
    px_um = PLACED_W / (w * UP) * 1000
    print(f"  検算: 元の形との差 {diff}px ({diff / mask.size * 100:.3f}%) "
          f"／1画素 = {px_um:.0f}μm")
    print(f"  検算: 中間の灰色 {grey}px  ← 箔版はここが 0 でないといけない")
    return grey


if __name__ == "__main__":
    print(f"{SRC.name} を輪郭に変換")
    mask, w, h = cleaned()
    path, big = outline(mask, w, h)
    print(f"  輪郭 {len(path.curves)}本")
    write(path, w, h)
    grey = verify(big, w, h)
    print(f"→ {OUT.relative_to(ROOT)}  {OUT.stat().st_size / 1024:.1f}KB")
    sys.exit(1 if grey else 0)
