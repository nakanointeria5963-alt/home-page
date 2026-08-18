#!/usr/bin/env python3
"""名刺の入稿データを作る。

黒い紙(ディープマット)に、白インクとネオンピンクの2版で刷る前提。
紙が黒いので背景は刷らない ―― 端まで色が乗らないので塗り足しもトンボも要らず、
仕上がりサイズ(91×55mm)でそのまま入稿できる。

出力は3つ。すべてグレースケール(黒1色)で、黒い所にインクが乗る。
  card-front-foil-plate.pdf  表・箔押しの版
  card-back-white.pdf        裏・ホワイトインク
  card-back-pink.pdf         裏・ネオンピンク
"""
import io, sys
from pathlib import Path
import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / "public" / "brand"
FONTS = Path(sys.argv[1] if len(sys.argv) > 1 else "fonts")

MM = 72 / 25.4                      # 1mm を PDF のポイントに
W, H = 91 * MM, 55 * MM             # 仕上がりサイズ。塗り足しなし
INK, PAPER = 0, 1                   # 黒=インクが乗る / 白=乗らない

def mm(v): return v * MM

# --- 版ごとの中身。位置は仕上がり 91×55mm の左上から測った mm ---
# LEDA の推奨(線は 0.2mm 以上)に合わせて、細かった日本語は太さと級数を上げてある
TEXT = [
    # (版,     文字,                 x,   ベースラインy, 級数mm, ウェイト, 字間em)
    ("pink",  "PRODUCER",           7.0, 13.67, 2.15, 700, 0.34),
    ("white", "NOBU",               7.0, 21.34, 6.80, 700, 0.14),
    ("white", "中野 修敬",            7.0, 28.22, 2.60, 500, 0.22),
    ("pink",  "はじまりは、",          7.0, 34.04, 2.55, 500, 0.02),
    ("pink",  "「ありがとう」でした。",    7.0, 38.30, 2.55, 500, 0.02),
    ("white", "roguepink.com",      7.0, 44.10, 2.95, 700, 0.0),
    ("white", "info@roguepink.com", 7.0, 47.54, 2.35, 500, 0.0),
]
WORDMARK = dict(plate="pink", src="logo-wordmark.png", x=7.05, y=7.05, w=24.87, h=2.65)
RULE     = dict(plate="pink", x=7.05, y=23.99, w=10.85, h=0.53)
PLATE    = dict(x=62.88, y=17.11, w=21.17, h=20.90, r=1.20)   # QRの白い下地
QR       = dict(size=17.0, src="qr-roguepink.png")
# 表・箔押しの版。ロゴは仕上がりの中央に置く
FOIL     = dict(src="logo-transparent.png", x=27.43, y=11.29, w=35.98, h=32.54)

def qr_matrix(png):
    """QRのPNGから、25×25のマス目を読み取る(余白4マスは除く)"""
    g = Image.open(png).convert("L")
    w = g.size[0]; px = g.load()
    quiet = next(y for y in range(w) if any(px[x, y] < 128 for x in range(w)))
    module = quiet / 4.0                      # 余白はどのQRでも4マス
    n = round((w - 2 * quiet) / module)
    return [[px[int(quiet + (c + .5) * module), int(quiet + (r + .5) * module)] < 128
             for c in range(n)] for r in range(n)], n

def flatten(png):
    """透明を白地に落として、インクの形だけを黒で残す"""
    im = Image.open(png).convert("RGBA")
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
    a = im.split()[3]
    out = Image.new("L", im.size, 255)
    out.paste(0, (0, 0), a)                   # 不透明な所を黒(=インク)にする
    return out

def build(plate):
    doc = pymupdf.open()
    page = doc.new_page(width=W, height=H)
    page.draw_rect(page.rect, color=None, fill=(PAPER,)*3)

    fonts = {}
    for _, _, _, _, _, wt, _ in TEXT:
        if wt not in fonts:
            f = FONTS / f"NotoSansJP-{wt}.ttf"
            page.insert_font(fontname=f"n{wt}", fontfile=str(f))
            fonts[wt] = pymupdf.Font(fontfile=str(f))

    for pl, txt, x, y, size, wt, sp in TEXT:
        if pl != plate: continue
        cx = mm(x)
        for ch in txt:
            page.insert_text((cx, mm(y)), ch, fontname=f"n{wt}",
                             fontsize=mm(size), color=(INK,)*3)
            cx += fonts[wt].text_length(ch, fontsize=mm(size)) + mm(size) * sp

    if plate == "pink":
        w = WORDMARK
        page.insert_image(pymupdf.Rect(mm(w["x"]), mm(w["y"]),
                                       mm(w["x"]+w["w"]), mm(w["y"]+w["h"])),
                          pixmap=pymupdf.Pixmap(_png(flatten(BRAND / w["src"]))))
        r = RULE
        page.draw_rect(pymupdf.Rect(mm(r["x"]), mm(r["y"]),
                                    mm(r["x"]+r["w"]), mm(r["y"]+r["h"])),
                       color=None, fill=(INK,)*3)

    if plate == "white":
        p = PLATE
        page.draw_rect(pymupdf.Rect(mm(p["x"]), mm(p["y"]),
                                    mm(p["x"]+p["w"]), mm(p["y"]+p["h"])),
                       radius=p["r"]/min(p["w"], p["h"]), color=None, fill=(INK,)*3)
        # QRは白インクのベタ地に、紙の黒を抜いて作る ―― 黒いマスをインク無しにする
        grid, n = qr_matrix(BRAND / QR["src"])
        cell = QR["size"] / (n + 8)                       # 余白4マスぶんを含めた1マス
        x0 = p["x"] + (p["w"] - QR["size"]) / 2 + cell * 4
        y0 = p["y"] + (p["h"] - QR["size"]) / 2 + cell * 4
        for r_i, row in enumerate(grid):
            for c_i, on in enumerate(row):
                if not on: continue
                page.draw_rect(pymupdf.Rect(mm(x0 + c_i*cell), mm(y0 + r_i*cell),
                                            mm(x0 + (c_i+1)*cell), mm(y0 + (r_i+1)*cell)),
                               color=None, fill=(PAPER,)*3)
    return doc

def _png(pil):
    b = io.BytesIO(); pil.save(b, format="PNG"); return b.getvalue()

def build_foil():
    """表の箔版。ロゴの形だけを黒1色で置く(箔は濃淡を表現できないため)"""
    doc = pymupdf.open()
    page = doc.new_page(width=W, height=H)
    page.draw_rect(page.rect, color=None, fill=(PAPER,)*3)
    f = FOIL
    page.insert_image(pymupdf.Rect(mm(f["x"]), mm(f["y"]),
                                   mm(f["x"]+f["w"]), mm(f["y"]+f["h"])),
                      pixmap=pymupdf.Pixmap(_png(flatten(BRAND / f["src"]))))
    return doc

if __name__ == "__main__":
    out = ROOT / "public" / "brand"
    d = build_foil()
    d.save(str(out / "card-front-foil-plate.pdf"), garbage=4, deflate=True)
    print(f"card-front-foil-plate.pdf: {d[0].rect.width/MM:.1f} × {d[0].rect.height/MM:.1f}mm")
    d.close()
    for plate in ("white", "pink"):
        d = build(plate)
        path = out / f"card-back-{plate}.pdf"
        d.save(str(path), garbage=4, deflate=True)
        print(f"{path.name}: {d[0].rect.width/MM:.1f} × {d[0].rect.height/MM:.1f}mm")
        d.close()
