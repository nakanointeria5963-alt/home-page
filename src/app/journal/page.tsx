import type { Metadata } from "next";
import BackgroundFX from "@/components/BackgroundFX";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { JOURNAL_ENTRIES } from "./entries";

export const metadata: Metadata = {
  title: "制作日誌 | ROGUE PINK",
  description:
    "ROGUE PINKのAI映画プロジェクトの制作日誌。映画ができあがっていく過程を公開しています。",
};

function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

export default function JournalPage() {
  return (
    <>
      <BackgroundFX />
      <Header />
      <main className="mx-auto max-w-3xl px-6 pb-32 pt-40">
        <SectionHeading eyebrow="JOURNAL" title="制作日誌">
          <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-loose text-muted sm:text-base">
            AIの映像生成を使った映画を、数ヶ月かけて作っています。
            できあがっていく過程を、ここに残していきます。
          </p>
        </SectionHeading>

        <div className="mt-20 space-y-16">
          {JOURNAL_ENTRIES.map((entry, index) => (
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
                <div className="mt-6 space-y-4 text-sm leading-loose text-muted sm:text-base">
                  {entry.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

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
