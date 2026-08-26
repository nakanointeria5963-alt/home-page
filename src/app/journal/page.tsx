import type { Metadata } from "next";
import BackgroundFX from "@/components/BackgroundFX";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import EntryCard from "./EntryCard";
import JournalList from "./JournalList";
import { JOURNAL_ENTRIES } from "./entries";

export const metadata: Metadata = {
  title: "制作日誌 | ROGUE PINK",
  description:
    "ROGUE PINKのAI映画プロジェクトの制作日誌。映画ができあがっていく過程を公開しています。",
};

// 日付の古い順に並べ直す(entries.ts の並び順に依存しないようにする)
const BY_DATE_ASC = [...JOURNAL_ENTRIES].sort((a, b) =>
  a.date.localeCompare(b.date),
);

// 一番はじめに出した1本は、上に固定して動かさない
const FIRST_ENTRY = BY_DATE_ASC[0];
const REST_ENTRIES = BY_DATE_ASC.slice(1);

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

        {/* 着地点(id)は、動かない外枠に付ける */}
        <div id={FIRST_ENTRY.slug} className="mt-20">
          <Reveal>
            <EntryCard entry={FIRST_ENTRY} badge="はじまり" />
          </Reveal>
        </div>

        <JournalList firstEntry={FIRST_ENTRY} entries={REST_ENTRIES} />

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
