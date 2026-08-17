import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import BusinessCard, {
  type BusinessLatest,
  type BusinessStat,
  type BusinessStatus,
} from "@/components/sections/BusinessCard";
import type { BusinessIconName } from "@/components/BusinessIcon";
import { WRITING_ENTRIES } from "@/app/writing/entries";
import { JOURNAL_ENTRIES } from "@/app/journal/entries";
import { MUSIC_ENTRIES } from "@/app/music/entries";

export type Product = {
  label: string;
  url: string;
};

type Business = {
  title: string;
  description: string;
  icon: BusinessIconName;
  status: BusinessStatus;
  stat?: BusinessStat;
  latest?: BusinessLatest;
  products?: Product[];
};

// 一番いま見せたいもの。横いっぱいで出す。
// 映画が完成したら、ここを別の事業に差し替えるだけでトップの顔が変わる
const FEATURED: Business = {
  title: "映像制作",
  description:
    "AI映像生成を使った映画を制作中。完成した作品だけでなく、作る過程も見せていきます。",
  icon: "film",
  status: "wip",
  stat: { value: JOURNAL_ENTRIES.length, unit: "本の制作日誌" },
  latest: JOURNAL_ENTRIES[0]
    ? { title: JOURNAL_ENTRIES[0].title, date: JOURNAL_ENTRIES[0].date }
    : undefined,
  products: [{ label: "映画の制作日誌を読む", url: "/journal" }],
};

const BUSINESSES: Business[] = [
  {
    title: "執筆",
    description:
      "素直に思ったことを、そのまま残していく場所。映画を作りながら考えたことも、それ以外のことも。",
    icon: "pen",
    status: "live",
    stat: { value: WRITING_ENTRIES.length, unit: "本 公開中" },
    products: [{ label: "執筆を読む", url: "/writing" }],
  },
  {
    title: "音楽",
    description:
      "自分にしか出せない表現で、心を動かす音楽を届けます。できた曲は、ここにどんどん増えていきます。",
    icon: "music",
    status: "live",
    stat: { value: MUSIC_ENTRIES.length, unit: "曲 公開中" },
    products: [{ label: "音楽を聴く", url: "/music" }],
  },
  {
    title: "アプリ開発",
    description:
      "誰でも自由に、簡単に使えるアプリを。社会に本当に役立つプロダクトをつくります。",
    icon: "app",
    status: "live",
    stat: { value: 1, unit: "本 公開中" },
    products: [
      {
        label: "禁酒サポートアプリを使ってみる",
        url: "https://nakanointeria5963-alt.github.io/kinnsyu/",
      },
    ],
  },
  {
    title: "アパレル",
    description: "Tシャツなど、想いを乗せたプロダクトを形にして届けます。",
    icon: "shirt",
    status: "soon",
  },
];

// 締めの1枚。他の事業を包む考え方なので、横いっぱいで静かに置く
const CLOSING: Business = {
  title: "エコシステム",
  description:
    "生まれた利益を、また誰かのために使う。「ありがとう」がめぐる仕組みをつくります。",
  icon: "cycle",
  status: "soon",
};

export default function Businesses() {
  return (
    <section id="businesses" className="mx-auto max-w-5xl px-6 py-32 sm:py-40">
      <SectionHeading eyebrow="BUSINESSES" title="やっていくこと">
        <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-loose text-muted sm:text-base">
          一人がひとつの商売しかできない時代は終わりました。
          ひとりで、いくつもの「ありがとう」を生み出していきます。
        </p>
      </SectionHeading>

      <div className="mt-16 grid gap-5 sm:grid-cols-2">
        <Reveal className="h-full sm:col-span-2">
          <BusinessCard {...FEATURED} featured />
        </Reveal>

        {BUSINESSES.map((item, index) => (
          <Reveal
            key={item.title}
            delay={(index + 1) * 0.08}
            // 数が奇数のときに最後の1枚が半分だけ残らないようにする
            className={`h-full ${
              BUSINESSES.length % 2 === 1 && index === BUSINESSES.length - 1
                ? "sm:col-span-2"
                : ""
            }`}
          >
            <BusinessCard {...item} />
          </Reveal>
        ))}

        <Reveal
          delay={(BUSINESSES.length + 1) * 0.08}
          className="h-full sm:col-span-2"
        >
          <BusinessCard {...CLOSING} />
        </Reveal>
      </div>
    </section>
  );
}
