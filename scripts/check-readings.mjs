// 読み間違えそうな言葉を、自動で洗い出す。
//
// 使い方:  node scripts/check-readings.mjs
//
// サイトに載っている文章を全部読んで、「読み上げの辞書にも、
// 確認済みの一覧にも入っていない言葉」だけを並べる。
// ノブさんに確認してもらうためのものではない。こちら(書記)が
// 新しい文章を出すたびに走らせて、読みを決めて登録するためのもの。
import { readFileSync } from "node:fs";

const SOURCES = [
  "src/app/writing/entries.ts",
  "src/app/journal/entries.ts",
  "src/app/apps/entries.ts",
  "src/app/music/entries.ts",
];

// 辞書ファイルから、登録済みの言葉と「ふつうに読めるので登録不要」を抜き出す
const dict = readFileSync("src/lib/reading.ts", "utf8");
const known = new Set();
for (const m of dict.matchAll(/^\s*\["([^"]+)",\s*"[^"]*"\]/gm)) known.add(m[1]);
const checkedBlock = dict.match(/CHECKED_WORDS[^=]*=\s*\[([\s\S]*?)\];/);
if (checkedBlock) {
  for (const m of checkedBlock[1].matchAll(/"([^"]+)"/g)) known.add(m[1]);
}

// 文章だけを集める(コードやコメントは混ぜない)
let text = "";
for (const file of SOURCES) {
  let body;
  try {
    body = readFileSync(file, "utf8");
  } catch {
    continue; // まだ無いファイルは飛ばす
  }
  for (const m of body.matchAll(/"((?:[^"\\]|\\.)*)"/g)) {
    const s = m[1];
    // 日本語が1文字も入っていない行(slug や URL)は文章ではない
    if (/[ぁ-んァ-ヶ一-龥]/.test(s)) text += s + "\n";
  }
}

// 怪しい候補を拾う
//  1. 漢字が2文字以上つづくもの(熟語・固有名詞)
//  2. アルファベットが2文字以上つづくもの
//  3. 数字 + 単位(3分半、10億円 など)
const candidates = new Map();
const add = (word) => {
  if (known.has(word)) return;
  candidates.set(word, (candidates.get(word) ?? 0) + 1);
};
for (const m of text.matchAll(/[一-龥]{2,}/g)) add(m[0]);
for (const m of text.matchAll(/[A-Za-z][A-Za-z ]*[A-Za-z]/g)) add(m[0].trim());
for (const m of text.matchAll(/[0-9]+[一-龥]{1,3}/g)) add(m[0]);

const list = [...candidates.entries()].sort((a, b) => b[1] - a[1]);
if (list.length === 0) {
  console.log("未登録の言葉はありません。");
} else {
  console.log(`未登録の言葉: ${list.length} 個\n`);
  for (const [word, count] of list) console.log(`${String(count).padStart(3)}回  ${word}`);
}
