#!/usr/bin/env python3
"""QRの読み取りを実物で確かめるための、A4のテスト用紙を作る。

家のプリンタで刷って、実際にスマホで読めるかを試すためのもの。入稿データではない。
使い方: python3 scripts/build-test-sheet.py <フォントの置き場>
"""
import sys, importlib.util
from pathlib import Path
import numpy as np
import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("bc", ROOT / "scripts" / "build-card.py")
bc = importlib.util.module_from_spec(spec); spec.loader.exec_module(bc)

MM = bc.MM
def mm(v): return v * MM
FONT = Path(sys.argv[1] if len(sys.argv) > 1 else "fonts")
GREY, FAINT, RED = (0.42,0.42,0.46), (0.70,0.70,0.74), (0.84,0,0.43)

def card_image(dpi=1200):
    """白インクとネオンピンクを重ねて、刷り上がりの見た目を作る"""
    def ink(p):
        x = pymupdf.open(p)[0].get_pixmap(dpi=dpi)
        return np.array(Image.frombytes("RGB",(x.width,x.height),x.samples).convert("L")) < 128
    w = ink(ROOT/"public/brand/card-back-white.pdf"); k = ink(ROOT/"public/brand/card-back-pink.pdf")
    h, wd = w.shape
    a = np.zeros((h,wd,3), np.uint8); a[:,:] = (26,24,31)
    a[w] = (255,255,255); a[k] = (255,45,135)
    return Image.fromarray(a)

def draw_qr(page, x, y, size):
    grid, n = bc.qr_matrix(ROOT/"public/brand"/bc.QR["src"])
    cell = size/n
    for r,row in enumerate(grid):
        for c,on in enumerate(row):
            if on:
                page.draw_rect(pymupdf.Rect(mm(x+c*cell), mm(y+r*cell),
                                            mm(x+(c+1)*cell), mm(y+(r+1)*cell)),
                               color=None, fill=(0,0,0))

def main():
    doc = pymupdf.open(); page = doc.new_page(width=mm(210), height=mm(297))
    for w in (400,700):
        page.insert_font(fontname=f"n{w}", fontfile=str(FONT/f"NotoSansJP-{w}.ttf"))
    def T(x,y,s,size=3.2,w=400,col=(0,0,0)):
        page.insert_text((mm(x),mm(y)), s, fontname=f"n{w}", fontsize=mm(size), color=col)

    M = 16
    T(M, 19, "QRの読み取りテスト", 6.6, 700)
    T(M, 25, "この紙を印刷して、実際にスマホでQRを読んでみてください。", 3.1, 400, GREY)
    T(M, 29.6, "印刷は「実際のサイズ」「100%」「拡大縮小なし」で。", 3.1, 700, RED)

    # 1. 縮尺の確認
    y = 39
    T(M, y, "1.  まず、この線が定規でちょうど 100mm あるか確かめてください", 3.0, 700)
    ly = y + 5
    page.draw_line(pymupdf.Point(mm(M),mm(ly)), pymupdf.Point(mm(M+100),mm(ly)), color=(0,0,0), width=0.8)
    for i in range(11):
        hh = 2.8 if i%5==0 else 1.6
        page.draw_line(pymupdf.Point(mm(M+i*10),mm(ly)), pymupdf.Point(mm(M+i*10),mm(ly-hh)), color=(0,0,0), width=0.7)
        if i%5==0: T(M+i*10-2.6, ly+4, f"{i*10}", 2.5, 400, GREY)
    T(M+104, ly+0.9, "ここまでが 100mm", 2.9, 700, GREY)

    # 2. 実物どおり(切り取れる)
    y = 56
    T(M, y, "2.  実物どおり(紙の黒・白インク・ネオンピンク)", 3.5, 700)
    T(M, y+4.2, "本番と同じ見え方。切り取って、手に持った状態で試すのがいちばんあてになります。", 2.8, 400, GREY)
    cy = y + 12
    page.insert_image(pymupdf.Rect(mm(M),mm(cy),mm(M+91),mm(cy+55)),
                      pixmap=pymupdf.Pixmap(bc._png(card_image())))
    # 切り取り線の目印(四隅)
    for sx, X in ((-1, M), (1, M+91)):
        for sy, Y in ((-1, cy), (1, cy+55)):
            page.draw_line(pymupdf.Point(mm(X+sx*2),mm(Y)), pymupdf.Point(mm(X+sx*5.5),mm(Y)), color=GREY, width=0.4)
            page.draw_line(pymupdf.Point(mm(X),mm(Y+sy*2)), pymupdf.Point(mm(X),mm(Y+sy*5.5)), color=GREY, width=0.4)
    T(M, cy+62, "91 × 55mm(実物大)。角の印にそって切ると、名刺の大きさになります", 2.6, 400, FAINT)

    # 3. QRだけ(インク節約)
    y = cy + 70
    T(M, y, "3.  QRだけ(インク節約版)", 3.5, 700)
    T(M, y+4.2, "大きさは本番と同じ。まわりが白いぶん、本番よりわずかに読みやすくなります。", 2.8, 400, GREY)
    p_, sym = bc.PLATE, bc.QR["symbol"]
    qy = y + 8
    page.draw_rect(pymupdf.Rect(mm(M),mm(qy),mm(M+p_["w"]),mm(qy+p_["h"])), color=FAINT, width=0.4)
    draw_qr(page, M+(p_["w"]-sym)/2, qy+(p_["h"]-sym)/2, sym)

    # 4. 確かめること
    y = qy + p_["h"] + 12
    T(M, y, "4.  確かめること", 3.6, 700)
    for i, s2 in enumerate([
        "上の線が定規で 100mm ちょうどか(ずれていたら印刷設定を直してやり直す)",
        "2 のQRをスマホのカメラで読む。roguepink.com が開けば成功",
        "切り取って手に持ち、腕を伸ばした距離でも読めるか",
        "少し斜めから、うす暗い所でも読めるか",
        "3 でも同じように読めるか",
    ]):
        yy = y + 7 + i*6.2
        page.draw_rect(pymupdf.Rect(mm(M),mm(yy-3.2),mm(M+3.8),mm(yy+0.6)), color=(0,0,0), width=0.5)
        T(M+6.4, yy, s2, 3.0, 400)

    T(M, 288, "QR: 本体 15.80mm / 1マス 0.632mm / まわりの余白 4.0マス ・ 中身 https://roguepink.com",
      2.5, 400, FAINT)
    out = ROOT/"public"/"brand"/"qr-test-sheet-a4.pdf"
    doc.save(str(out), garbage=4, deflate=True)
    print(f"{out.name}: {doc[0].rect.width/MM:.0f} × {doc[0].rect.height/MM:.0f}mm")
    doc.close()

if __name__ == "__main__":
    main()
