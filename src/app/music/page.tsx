import type { Metadata } from "next";
import BackgroundFX from "@/components/BackgroundFX";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { MUSIC_ENTRIES } from "./entries";

export const metadata: Metadata = {
  title: "音楽 | ROGUE PINK",
  description:
    "自分にしか出せない表現で、心を動かす音楽を。できた曲がここに並んでいきます。",
};

function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

export default function MusicPage() {
  return (
    <>
      <BackgroundFX />
      <Header />
      <main className="mx-auto max-w-3xl px-6 pb-32 pt-40">
        <SectionHeading eyebrow="MUSIC" title="音楽">
          <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-loose text-muted sm:text-base">
            自分にしか出せない表現で、心を動かす音楽を。
            できた曲が、ここにどんどん並んでいきます。
          </p>
        </SectionHeading>

        {MUSIC_ENTRIES.length === 0 ? (
          <Reveal className="mt-20">
            <div className="rounded-2xl border border-border bg-background-elevated p-10 text-center">
              <p className="text-3xl">🎵</p>
              <p className="mt-4 text-sm leading-loose text-muted sm:text-base">
                最初の一曲を準備中です。
                <br />
                できた曲から、ここに並んでいきます。
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="mt-20 space-y-16">
            {MUSIC_ENTRIES.map((entry, index) => (
              <Reveal key={entry.slug} delay={index * 0.1}>
                <article
                  id={entry.slug}
                  className="rounded-2xl border border-border bg-background-elevated p-8 sm:p-10"
                >
                  <time
                    dateTime={entry.date}
                    className="text-xs font-bold tracking-[0.3em] text-pink"
                  >
                    {formatDate(entry.date)}
                  </time>
                  <h2 className="mt-3 text-xl font-black text-foreground sm:text-2xl">
                    {entry.title}
                  </h2>
                  <p className="mt-6 text-sm leading-loose text-muted sm:text-base">
                    {entry.description}
                  </p>
                  {entry.links && entry.links.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      {entry.links.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block rounded-full border border-pink/40 px-5 py-2 text-sm font-bold text-pink-light transition-colors hover:border-pink hover:bg-pink/10"
                        >
                          {link.label} →
                        </a>
                      ))}
                    </div>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        )}

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
