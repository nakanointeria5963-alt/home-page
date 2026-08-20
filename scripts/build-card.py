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

sys.path.insert(0, str(Path(__file__).resolve().parent))
from outline import draw_text

ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / "public" / "brand"
FONTS = Path(sys.argv[1] if len(sys.argv) > 1 else "fonts")

MM = 72 / 25.4                      # 1mm を PDF のポイントに
W, H = 91 * MM, 55 * MM             # 仕上がりサイズ。塗り足しなし
INK, PAPER = 0, 1                   # 黒=インクが乗る / 白=乗らない
# 色は必ず1つの数字で渡す。3つ組で渡すと PDF に DeviceRGB として書かれてしまい、
# 「グレースケール(黒1色)」という申告と中身が食い違う

def mm(v): return v * MM

# 裏面のピンクを「メタリックピンク箔」で押すか、「ネオンピンクのトナー」で刷るか。
#
# 箔は転写するかしないかの二択で、トナーのように薄く乗ることができない。
# LEDA の下限 0.2mm を全文字で満たす必要があるため、タグラインだけ設定が変わる。
#   トナー: 級数 2.55 / ウェイト 600 → 句点 0.165mm・濁点 0.185mm(下限未満だが薄く出る)
#   箔:     級数 2.85 / ウェイト 700 → 句点 0.203mm・濁点 0.231mm(全文字が下限以上)
FOIL_BACK = True

_TAG = (2.85, 700) if FOIL_BACK else (2.55, 600)
_TAG_Y = (33.95, 38.45) if FOIL_BACK else (34.04, 38.30)

# --- 版ごとの中身。位置は仕上がり 91×55mm の左上から測った mm ---
# LEDA の推奨(線は 0.2mm 以上)に合わせて、細かった日本語は太さと級数を上げてある
TEXT = [
    # (版,     文字,                 x,   ベースラインy, 級数mm, ウェイト, 字間em)
    ("pink",  "PRODUCER",           7.0, 13.67, 2.15, 700, 0.34),
    ("white", "NOBU",               7.0, 21.34, 6.80, 700, 0.14),
    ("white", "中野 修敬",            7.0, 28.22, 2.60, 600, 0.22),
    ("pink",  "はじまりは、",          7.0, _TAG_Y[0], _TAG[0], _TAG[1], 0.02),
    ("pink",  "「ありがとう」でした。",    7.0, _TAG_Y[1], _TAG[0], _TAG[1], 0.02),
    ("white", "roguepink.com",      7.0, 44.10, 2.95, 700, 0.0),
    ("white", "info@roguepink.com", 7.0, 47.60, 2.45, 600, 0.0),
]
# 裏のワードマークも箔になったので、表と同じ輪郭データを使う(scripts/trace-logo.py)
# 高さは Montserrat Bold の字面から決まる。以前は画像を 2.65mm の枠に押し込んでいて、
# 横に 4.7% 伸びていた。文字で組み直したので、いまは書体そのままの比率
WORDMARK = dict(plate="pink", src="logo-wordmark-foil.pdf", x=7.05, y=7.05, w=24.87, h=2.7138)
RULE     = dict(plate="pink", x=7.05, y=23.99, w=10.85, h=0.53)
PLATE    = dict(x=62.88, y=17.11, w=21.17, h=20.90, r=1.20)   # QRの白い下地
# QRは「コード本体」の大きさで指定する。まわりに必要な余白(4マス)は
# 白いプレートがそのまま兼ねるので、本体を余白ぶん縮める必要はない
QR       = dict(symbol=15.8, src="qr-roguepink.png")
# 表・箔押しの版。ロゴは仕上がりの中央に置く
FOIL     = dict(src="logo-foil.pdf", x=27.43, y=11.29, w=35.98, h=32.54)

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
    page.draw_rect(page.rect, color=None, fill=(PAPER,))

    # 文字は「文字」ではなく「図形」として置く。入稿データは印刷の型紙なので、
    # フォントを埋め込むより、形そのものを渡すほうが確実(scripts/outline.py)
    shape = page.new_shape()
    for pl, txt, x, y, size, wt, sp in TEXT:
        if pl != plate: continue
        draw_text(shape, str(FONTS / f"NotoSansJP-{wt}.ttf"), txt,
                  mm(x), mm(y), mm(size), sp)
    # フォントの輪郭は「非ゼロ」で塗る。奇偶にすると接合部が抜け落ちる
    shape.finish(color=None, fill=(INK,), even_odd=False, closePath=True)
    shape.commit()

    if plate == "pink":
        w = WORDMARK
        mark = pymupdf.open(BRAND / w["src"])
        page.show_pdf_page(pymupdf.Rect(mm(w["x"]), mm(w["y"]),
                                        mm(w["x"]+w["w"]), mm(w["y"]+w["h"])), mark, 0)
        mark.close()
        r = RULE
        page.draw_rect(pymupdf.Rect(mm(r["x"]), mm(r["y"]),
                                    mm(r["x"]+r["w"]), mm(r["y"]+r["h"])),
                       color=None, fill=(INK,))

    if plate == "white":
        p = PLATE
        # QRは白インクのベタ地に、紙の黒を抜いて作る ―― 黒いマスをインク無しにする。
        #
        # ★ 白を上から塗るのではなく「1本の道」として穴をあける。
        # マスを1つずつ別々に塗ると、隣り合う四角のつなぎ目に中間色が残り、
        # 印刷機がそれを拾うと暗いマスの中に細いスジが走る(実測 19,670画素)。
        # 外枠と穴をまとめて1回で塗れば、つなぎ目そのものが存在しなくなる。
        grid, n = qr_matrix(BRAND / QR["src"])
        cell = QR["symbol"] / n
        x0 = p["x"] + (p["w"] - QR["symbol"]) / 2
        y0 = p["y"] + (p["h"] - QR["symbol"]) / 2
        quiet = min(p["w"] - QR["symbol"], p["h"] - QR["symbol"]) / 2 / cell
        assert quiet >= 4, f"QRのまわりの余白が{quiet:.1f}マスしかない(4マス必要)"

        shape = page.new_shape()
        shape.draw_rect(pymupdf.Rect(mm(p["x"]), mm(p["y"]),
                                     mm(p["x"]+p["w"]), mm(p["y"]+p["h"])),
                        radius=p["r"]/min(p["w"], p["h"]))
        for r_i, row in enumerate(grid):
            c_i = 0
            while c_i < n:                      # 横に続くマスは1つの長方形にまとめる
                if not row[c_i]:
                    c_i += 1; continue
                run = c_i
                while run < n and row[run]: run += 1
                shape.draw_rect(pymupdf.Rect(mm(x0 + c_i*cell), mm(y0 + r_i*cell),
                                             mm(x0 + run*cell), mm(y0 + (r_i+1)*cell)))
                c_i = run
        # 奇偶ルール: 外枠の中にある四角は「穴」になる
        shape.finish(color=None, fill=(INK,), even_odd=True, closePath=True)
        shape.commit()
    return doc

def _png(pil):
    b = io.BytesIO(); pil.save(b, format="PNG"); return b.getvalue()

def preview(dpi=600):
    """刷り上がりの見た目を作る。入稿データと同じ元から作るので、絵と実物がズレない"""
    import numpy as np
    def ink(path):
        x = pymupdf.open(path)[0].get_pixmap(dpi=dpi)
        return np.array(Image.frombytes("RGB", (x.width, x.height), x.samples).convert("L")) < 128
    out = ROOT / "public" / "brand"
    w = ink(out / "card-back-white.pdf")
    k = ink(out / "card-back-pink.pdf")
    f = ink(out / "card-front-foil-plate.pdf")
    h, wd = w.shape
    PAPER, WHITE, PINK, FOIL = (26,24,31), (255,255,255), (255,45,135), (255,86,158)
    def compose(*layers):
        a = np.zeros((h, wd, 3), np.uint8); a[:, :] = PAPER
        for m, c in layers: a[m] = c
        return Image.fromarray(a)
    # 裏のピンクを箔にする決定なら、裏も表と同じ光り方で描く
    back, front = compose((w, WHITE), (k, FOIL if FOIL_BACK else PINK)), compose((f, FOIL))
    back.save(out / "card-back.png"); front.save(out / "card-front.png")

    # 表裏を並べた1枚。どちらが何のインクかを書いておく(印刷所に見せる用)
    from PIL import ImageDraw, ImageFont
    def font(px):
        try: return ImageFont.truetype(str(FONTS / "NotoSansJP-700.ttf"), px)
        except Exception: return ImageFont.load_default(px)
    def font_r(px):
        try: return ImageFont.truetype(str(FONTS / "NotoSansJP-400.ttf"), px)
        except Exception: return ImageFont.load_default(px)
    pad = int(wd * 0.045)
    lbl = int(wd * 0.075)
    BG, INK2, SUB = (250, 247, 249), (26, 22, 32), (120, 110, 128)
    sheet = Image.new("RGB", (wd + pad*2, pad + (h + lbl + pad)*2), BG)
    dr = ImageDraw.Draw(sheet)
    fb, fs = font(int(wd*0.030)), font_r(int(wd*0.021))
    back_note = ("ホワイト印刷 + メタリックピンク箔(箔2版目)" if FOIL_BACK
                 else "ホワイト印刷 + ネオンピンク(スペシャルトナー2色)")
    rows = ((front, "表", "ディープマット ブラック + メタリックピンク箔(箔1版目)"),
            (back,  "裏", back_note))
    for i, (img, t, note) in enumerate(rows):
        y = pad + i * (h + lbl + pad)
        dr.text((pad, y), t, font=fb, fill=INK2)
        dr.text((pad + int(wd*0.055), y + int(wd*0.009)), note, font=fs, fill=SUB)
        sheet.paste(img, (pad, y + lbl))
    sheet.save(out / "card-option-black-paper.png")
    print("プレビュー3枚を作り直した(card-front / card-back / card-option-black-paper)")

def build_foil():
    """表の箔版。ロゴの形だけを黒1色で置く(箔は濃淡を表現できないため)

    中身は scripts/trace-logo.py が作った輪郭データ(logo-foil.pdf)。
    もとの PNG をそのまま貼ると縁に半透明の画素が残り、LEDA から
    「文字の下部(R)が若干擦れている」と指摘された。輪郭に置き換えて解消してある。
    """
    src = BRAND / FOIL["src"]
    if not src.exists():
        sys.exit(f"{src.name} が無い。先に scripts/trace-logo.py を実行する")
    doc = pymupdf.open()
    page = doc.new_page(width=W, height=H)
    page.draw_rect(page.rect, color=None, fill=(PAPER,))
    f = FOIL
    logo = pymupdf.open(src)
    page.show_pdf_page(pymupdf.Rect(mm(f["x"]), mm(f["y"]),
                                    mm(f["x"]+f["w"]), mm(f["y"]+f["h"])), logo, 0)
    logo.close()
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
        d.subset_fonts()          # 実際に使った文字だけ残す
        d.save(str(path), garbage=4, deflate=True)
        print(f"{path.name}: {d[0].rect.width/MM:.1f} × {d[0].rect.height/MM:.1f}mm")
        d.close()
    preview()
