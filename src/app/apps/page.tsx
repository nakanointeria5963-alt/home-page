import type { Metadata } from "next";
import BackgroundFX from "@/components/BackgroundFX";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { APP_GROUPS } from "./entries";

export const metadata: Metadata = {
  title: "アプリ | ROGUE PINK",
  description:
    "登録なし、ダウンロードなしで使えるアプリ。お酒・たばこ・ギャンブルをやめる、減らすための記録と、スマホやホームページではじめてつまずく人のための手引きです。",
};

export default function AppsPage() {
  return (
    <>
      <BackgroundFX />
      <Header />
      <main className="mx-auto max-w-3xl px-6 pb-32 pt-40">
        <SectionHeading eyebrow="APPS" title="アプリ">
          {/* 6本ぜんぶに当てはまることは、ここで1回だけ言う。
              節ごとの「共通すること」でくり返さない */}
          <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-loose text-muted sm:text-base">
            登録なし。ダウンロードなし。無料です。
            開けばすぐ使えるアプリを作っています。
          </p>
        </SectionHeading>

        {APP_GROUPS.map((group) => (
          // 性格の違うアプリを混ぜない。
          // 下の「共通すること」と注意書きは、この節のアプリだけを指す
          <section key={group.id} className="mt-24 first:mt-20">
            <Reveal>
              <div className="border-t border-border pt-10">
                <h2 className="text-lg font-black text-foreground sm:text-xl">
                  {group.title}
                </h2>
                <p className="mt-3 text-sm leading-loose text-muted">
                  {group.lead}
                </p>
              </div>
            </Reveal>

            <div className="mt-10 space-y-8">
              {group.entries.map((app, index) => (
                // 着地点(id)は、動かない外枠に付ける。
                // Reveal の中に付けると、飛んだ直後に中身がずり上がってヘッダーに潜る
                <div key={app.slug} id={app.slug}>
                  <Reveal delay={index * 0.1}>
                    <article className="rounded-2xl border border-border bg-background-elevated p-8 sm:p-10">
                      <p className="text-xs font-black tracking-[0.2em] text-pink">
                        {app.eyebrow}
                      </p>
                      <h3 className="mt-3 text-xl font-black text-foreground sm:text-2xl">
                        {app.name}
                      </h3>
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
                        {app.action ?? "使ってみる"} →
                      </a>
                    </article>
                  </Reveal>
                </div>
              ))}
            </div>

            {/* その節に共通すること。カードの中で何度もくり返さず、ここで1回だけ言う */}
            <Reveal delay={0.1} className="mt-12">
              <div className="rounded-2xl border border-border p-8 sm:p-10">
                <p className="text-xs font-black tracking-[0.2em] text-pink">
                  {group.notesTitle}
                </p>
                <ul className="mt-6 space-y-3">
                  {group.notes.map((note) => (
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
                {group.disclaimers && (
                  <div className="mt-6 space-y-3 border-t border-border pt-6">
                    {group.disclaimers.map((note) => (
                      <p
                        key={typeof note === "string" ? note : note.telLabel}
                        className="flex gap-2 text-xs leading-loose text-muted"
                      >
                        <span aria-hidden="true">※</span>
                        {typeof note === "string" ? (
                          <span>{note}</span>
                        ) : (
                          <span>
                            {note.before}
                            {/* ボタンにはしない。番号のまま、掛けたい人だけが掛けられればいい */}
                            <a
                              href={`tel:${note.tel}`}
                              className="whitespace-nowrap py-2 font-bold text-pink-light underline decoration-pink/40 underline-offset-4 transition-colors hover:decoration-pink"
                            >
                              {note.telLabel}
                            </a>
                            {note.after}
                          </span>
                        )}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          </section>
        ))}

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
