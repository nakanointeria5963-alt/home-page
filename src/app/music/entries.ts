export type MusicEntry = {
  slug: string;
  date: string;
  title: string;
  description: string;
  videoUrl?: string;
  links?: { label: string; url: string }[];
};

// 新しい曲は配列の先頭に追加する
export const MUSIC_ENTRIES: MusicEntry[] = [
  {
    slug: "2026-08-12-code-love",
    date: "2026-08-12",
    title: "CODE LOVE",
    description:
      "この曲を作ったのは、AIです。この映像を作ったのも、AIです。その二つを一本につなぎ合わせたのも、AIです。そして、テロップまで、AIです。俺がやったのは、お願いして、ここに載せただけ。できあがったものを見たとき、まじまじとAIの凄さを感じました。それが一番素直な感想です。",
    videoUrl:
      "https://d2ol7oe51mr4n9.cloudfront.net/user_3HB6SVADKta7xCKiPnLpSPjn1jc/dff91e0c-3f6f-46f3-b90c-fa17c1e60f69.mp4",
  },
];
