import Reveal from "@/components/Reveal";

const BUSINESSES = [
  {
    title: "アプリ開発",
    description:
      "誰でも自由に、簡単に使えるアプリを。社会に本当に役立つプロダクトをつくります。",
    products: [
      { label: "禁酒サポートアプリ", url: "https://nakanointeria5963-alt.github.io/kinnsyu/" },
    ],
  },
  {
    title: "音楽・映像制作",
    description:
      "自分にしか出せない表現で、心を動かすエンターテインメントを届けます。",
  },
  {
    title: "アパレル",
    description:
      "Tシャツなど、想いを乗せたプロダクトを形にして届けます。",
  },
  {
    title: "エコシステム",
    description:
      "生まれた利益を、また誰かのために使う。「ありがとう」がめぐる仕組みをつくります。",
  },
];

export default function Businesses() {
  return (
    <section
      id="businesses"
      className="mx-auto max-w-5xl px-6 py-32 sm:py-40"
    >
      <Reveal>
        <p className="text-center text-xs font-bold tracking-[0.4em] text-pink-light">
          BUSINESSES
        </p>
        <h2 className="mt-4 text-center text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          やっていくこと
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-loose text-muted sm:text-base">
          一人がひとつの商売しかできない時代は終わりました。
          ひとりで、いくつもの「ありがとう」を生み出していきます。
        </p>
      </Reveal>

      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {BUSINESSES.map((item, index) => (
          <Reveal key={item.title} delay={index * 0.1}>
            <div className="group h-full rounded-2xl border border-border bg-background-elevated p-8 transition-all duration-300 hover:-translate-y-1 hover:border-pink/50 hover:shadow-[0_0_40px_rgba(255,46,136,0.15)]">
              <span className="text-xs font-bold tracking-[0.3em] text-pink">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-xl font-black text-foreground sm:text-2xl">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-loose text-muted sm:text-base">
                {item.description}
              </p>
              {item.products && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {item.products.map((product) => (
                    <a
                      key={product.url}
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-pink/10 px-4 py-2 text-xs font-bold text-pink-light transition-colors hover:bg-pink hover:text-white sm:text-sm"
                    >
                      {product.label}を使ってみる →
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
