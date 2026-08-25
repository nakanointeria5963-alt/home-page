import type { Metadata } from "next";
import BackgroundFX from "@/components/BackgroundFX";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import EntryCard from "./EntryCard";
import WritingList from "./WritingList";
import { WRITING_ENTRIES } from "./entries";

export const metadata: Metadata = {
  title: "執筆 | ROGUE PINK",
  description:
    "素直に思ったことを、そのまま残していく場所。映画を作りながら考えたことも、それ以外のことも。",
};

// 日付の古い順に並べ直す(entries.ts の並び順に依存しないようにする)
const BY_DATE_ASC = [...WRITING_ENTRIES].sort((a, b) =>
  a.date.localeCompare(b.date),
);

// 一番はじめに出した1本は、上に固定して動かさない
const FIRST_ENTRY = BY_DATE_ASC[0];
const REST_ENTRIES = BY_DATE_ASC.slice(1);

export default function WritingPage() {
  return (
    <>
      <BackgroundFX />
      <Header />
      <main className="mx-auto max-w-3xl px-6 pb-32 pt-40">
        <SectionHeading eyebrow="WRITING" title="執筆">
          <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-loose text-muted sm:text-base">
            素直に思ったことを、そのまま残していく場所。
            映画を作りながら考えたことも、それ以外のことも。
          </p>
        </SectionHeading>

        <Reveal className="mt-20">
          <EntryCard entry={FIRST_ENTRY} badge="はじまり" />
        </Reveal>

        <WritingList entries={REST_ENTRIES} />

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
