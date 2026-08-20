"""文字を「文字」ではなく「図形」として置くための道具。

入稿データは印刷の型紙なので、文字はアウトライン化して渡すのが確実。
フォントを埋め込む形だと、印刷所側の環境しだいで別の書体に置き換わる
余地が残る。図形にしてしまえば、開いた場所がどこであれ形は変わらない。

  from outline import draw_text
  draw_text(shape, "fonts/Montserrat-700.ttf", "ROGUE", x_pt, baseline_pt, size_pt)
"""
from functools import lru_cache

import pymupdf
from fontTools.pens.qu2cuPen import Qu2CuPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.ttLib import TTFont


@lru_cache(maxsize=8)
def _font(path):
    tt = TTFont(path)
    return tt, tt.getGlyphSet(), tt.getBestCmap(), tt["head"].unitsPerEm


@lru_cache(maxsize=4096)
def _contours(path, ch):
    """1文字ぶんの輪郭を、3次ベジェの命令列にして返す"""
    tt, glyphs, cmap, upem = _font(path)
    name = cmap.get(ord(ch))
    if name is None:
        raise ValueError(f"{path} に {ch!r} が入っていない")
    rec = RecordingPen()
    # all_cubic=True を落とすと2次曲線が残り、丸い文字が描かれない
    glyphs[name].draw(Qu2CuPen(rec, 0.05, all_cubic=True))
    return tuple(rec.value), tt["hmtx"][name][0] / upem


def draw_text(shape, path, text, x, baseline, size, tracking=0.0):
    """shape に文字を図形として置く。座標も級数も PDF のポイント。

    tracking は級数に対する割合(em)。返り値は次の文字の x 位置。
    塗りは呼び出し側が finish() で指定する。フォントの輪郭は
    「非ゼロ」で塗ること —— 奇偶にすると R の脚などが抜け落ちる。
    """
    _, _, _, upem = _font(path)
    for ch in text:
        ops, advance = _contours(path, ch)
        k = size / upem
        P = lambda p: pymupdf.Point(x + p[0] * k, baseline - p[1] * k)
        here = start = None
        for op, args in ops:
            if op == "moveTo":
                here = start = P(args[0])
            elif op == "lineTo":
                shape.draw_line(here, P(args[0])); here = P(args[0])
            elif op == "curveTo":
                shape.draw_bezier(here, P(args[0]), P(args[1]), P(args[2]))
                here = P(args[2])
            elif op == "closePath":
                if here and start and here != start:
                    shape.draw_line(here, start)
                here = start
            elif op == "endPath":
                here = start
            else:
                raise ValueError(f"未対応の命令 {op}。黙って形が欠けるので止める")
        x += advance * size + size * tracking
    return x
