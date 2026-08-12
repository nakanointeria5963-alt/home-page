export type MusicEntry = {
  slug: string;
  date: string;
  title: string;
  description: string;
  links?: { label: string; url: string }[];
};

// 新しい曲は配列の先頭に追加する
export const MUSIC_ENTRIES: MusicEntry[] = [];
