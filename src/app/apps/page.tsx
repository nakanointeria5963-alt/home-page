import type { Metadata } from "next";
import BackgroundFX from "@/components/BackgroundFX";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { APP_ENTRIES, APP_NOTES } from "./entries";

export const metadata: Metadata = {
  title: "アプリ | ROGUE PINK",
  description:
    "登録なし、ダウンロードなしで使えるアプリ。禁酒・節酒・禁煙・ギャンブル断ちの記録を、その端末の中だけに残します。",
};

export default function AppsPage() {
  return (
    <>
      <BackgroundFX />
      <Header />
      <main className="mx-auto max-w-3xl px-6 pb-32 pt-40">
        <SectionHeading eyebrow="APPS" title="アプリ">
          <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-loose text-muted sm:text-base">
            登録なし。ダウンロードなし。
            開けばすぐ使えるアプリを作っています。
          </p>
        </SectionHeading>

        <div className="mt-20 space-y-8">
          {APP_ENTRIES.map((app, index) => (
            // 着地点(id)は、動かない外枠に付ける。
            // Reveal の中に付けると、飛んだ直後に中身がずり上がってヘッダーに潜る
            <div key={app.slug} id={app.slug}>
              <Reveal delay={index * 0.1}>
                <article className="rounded-2xl border border-border bg-background-elevated p-8 sm:p-10">
                  <p className="text-xs font-black tracking-[0.2em] text-pink">
                    {app.eyebrow}
                  </p>
                  <h2 className="mt-3 text-xl font-black text-foreground sm:text-2xl">
                    {app.name}
                  </h2>
                  <p className="mt-4 text-sm leading-loose text-muted sm:text-base">
                    {app.description}
                  </p>

                  <ul className="mt-6 space-y-2.5 border-t border-border pt-6">
                    {app.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex gap-3 text-sm leading-relaxed text-muted"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pink"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-7 inline-block rounded-full bg-pink/10 px-6 py-3 text-sm font-bold text-pink-light transition-colors hover:bg-pink hover:text-white focus-visible:bg-pink focus-visible:text-white"
                  >
                    使ってみる →
                  </a>
                </article>
              </Reveal>
            </div>
          ))}
        </div>

        {/* 4本に共通すること。カードの中で4回くり返さず、ここで1回だけ言う */}
        <Reveal delay={0.1} className="mt-16">
          <div className="rounded-2xl border border-border p-8 sm:p-10">
            <p className="text-xs font-black tracking-[0.2em] text-pink">
              4つに共通すること
            </p>
            <ul className="mt-6 space-y-3">
              {APP_NOTES.map((note) => (
                <li
                  key={note}
                  className="flex gap-3 text-sm leading-loose text-muted"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border"
                  />
                  {note}
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-border pt-6 text-xs leading-loose text-muted">
              ※
              これらは記録と気持ちの整理を手伝うアプリで、医療的な診断や治療をするものではありません。
              からだの不調があるときは、お医者さんに相談してください。
            </p>
          </div>
        </Reveal>

        <Reveal className="mt-20 text-center">
          <a
            href="/"
            className="inline-block rounded-full border border-border px-6 py-3 text-sm font-bold text-muted transition-colors hover:border-pink/50 hover:text-pink-light"
          >
            ← ホームへ戻る
          </a>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
