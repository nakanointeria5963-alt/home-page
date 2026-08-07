import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import BusinessCard from "@/components/sections/BusinessCard";

export type Product = {
  label: string;
  url: string;
};

type Business = {
  title: string;
  description: string;
  icon: string;
  products?: Product[];
};

const BUSINESSES: Business[] = [
  {
    title: "アプリ開発",
    description:
      "誰でも自由に、簡単に使えるアプリを。社会に本当に役立つプロダクトをつくります。",
    icon: "📱",
    products: [
      {
        label: "禁酒サポートアプリを使ってみる",
        url: "https://nakanointeria5963-alt.github.io/kinnsyu/",
      },
    ],
  },
  {
    title: "音楽・映像制作",
    description:
      "自分にしか出せない表現で、心を動かすエンターテインメントを届けます。AI映像生成を使った短編映画を制作中。",
    icon: "🎵",
    products: [
      {
        label: "映画の制作日誌を読む",
        url: "/journal",
      },
    ],
  },
  {
    title: "アパレル",
    description:
      "Tシャツなど、想いを乗せたプロダクトを形にして届けます。",
    icon: "👕",
  },
  {
    title: "エコシステム",
    description:
      "生まれた利益を、また誰かのために使う。「ありがとう」がめぐる仕組みをつくります。",
    icon: "♻️",
  },
];

export default function Businesses() {
  return (
    <section
      id="businesses"
      className="mx-auto max-w-5xl px-6 py-32 sm:py-40"
    >
      <SectionHeading eyebrow="BUSINESSES" title="やっていくこと">
        <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-loose text-muted sm:text-base">
          一人がひとつの商売しかできない時代は終わりました。
          ひとりで、いくつもの「ありがとう」を生み出していきます。
        </p>
      </SectionHeading>

      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {BUSINESSES.map((item, index) => (
          <Reveal key={item.title} delay={index * 0.1}>
            <BusinessCard
              index={index}
              title={item.title}
              description={item.description}
              icon={item.icon}
              products={item.products}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
