#!/bin/sh
# 入稿データ作成に使う Noto Sans JP を取ってくる。
# fonts/ は git に入れていない(9MB あり、いつでも取り直せるため)。
# コンテナを作り直したら、build-card.py の前にこれを一度走らせる。
set -e
cd "$(dirname "$0")/.."
tmp=$(mktemp -d)
( cd "$tmp" && npm pack @fontsource/noto-sans-jp >/dev/null 2>&1 && tar xzf fontsource-noto-sans-jp-*.tgz && mv package jp
  npm pack @fontsource/montserrat >/dev/null 2>&1 && tar xzf fontsource-montserrat-*.tgz && mv package ms )
mkdir -p fonts
python3 - "$tmp" <<'PY'
from fontTools.ttLib import TTFont
import glob, sys, os
tmp = sys.argv[1]
for wt in (400, 500, 600, 700):
    src = glob.glob(f"{tmp}/jp/files/*japanese-{wt}-normal.woff2")[0]
    f = TTFont(src); f.flavor = None          # woff2 の圧縮を外して ttf にする
    out = f"fonts/NotoSansJP-{wt}.ttf"; f.save(out)
    print(f"{out}  {os.path.getsize(out)/1024:.0f}KB")

# ワードマーク「ROGUE PINK」の書体。照合の結果 Montserrat Bold と判明している
src = glob.glob(f"{tmp}/ms/files/*latin-700-normal.woff2")[0]
f = TTFont(src); f.flavor = None
f.save("fonts/Montserrat-700.ttf")
print(f"fonts/Montserrat-700.ttf  {os.path.getsize('fonts/Montserrat-700.ttf')/1024:.0f}KB")
PY
rm -rf "$tmp"
