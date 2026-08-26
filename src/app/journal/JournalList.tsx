"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "@/components/Reveal";
import EntryCard from "./EntryCard";
import type { JournalEntry } from "./entries";

type Order = "oldest" | "newest";

/**
 * 並べ替えとタイトル一覧のボタンを出しはじめる本数(1本目を含めた合計)。
 * 5本までは古い順に並ぶだけ。記事より看板のほうが大きくなるのを避けるため。
 * 6本目を公開した日に、ボタンは自動で出てくる。
 */
const SHOW_CONTROLS_FROM = 6;

type JournalListProps = {
  /** 上に固定している1本目。目次には入れるが、下の一覧には出さない */
  firstEntry: JournalEntry;
  /** 古い順(1本目を除いたもの)で渡す */
  entries: JournalEntry[];
};

function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

function formatNo(no: number): string {
  return `#${String(no).padStart(2, "0")}`;
}

export default function JournalList({ firstEntry, entries }: JournalListProps) {
  // 制作日誌は「始まり→今」の一本の線なので、既定は古い順。
  // (執筆は一本ずつ独立しているので、あちらの既定は新しい順)
  const [order, setOrder] = useState<Order>("oldest");
  const [indexOpen, setIndexOpen] = useState(false);

  const showControls = entries.length + 1 >= SHOW_CONTROLS_FROM;
  const shown = showControls && order === "newest" ? [...entries].reverse() : entries;
  // 目次はページに並んでいる順そのまま。固定した1本目は必ず先頭
  const indexItems = [firstEntry, ...shown];

  return (
    <>
      {showControls ? (
        <Reveal className="mt-16 flex flex-wrap items-center justify-center gap-3">
          <div
            role="group"
            aria-label="並び順"
            className="inline-flex rounded-full border border-border bg-background-elevated p-1"
          >
            {(
              [
                ["oldest", "古い順"],
                ["newest", "新しい順"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setOrder(value)}
                aria-pressed={order === value}
                className={
                  order === value
                    ? "rounded-full bg-pink/15 px-5 py-2 text-xs font-bold text-pink-light transition-colors sm:text-sm"
                    : "rounded-full px-5 py-2 text-xs font-bold text-muted transition-colors hover:text-pink-light sm:text-sm"
                }
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIndexOpen((open) => !open)}
            aria-expanded={indexOpen}
            aria-controls="journal-index"
            className={
              indexOpen
                ? "inline-flex items-center gap-2 rounded-full border border-pink/50 px-5 py-3 text-xs font-bold text-pink-light transition-colors sm:text-sm"
                : "inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-xs font-bold text-muted transition-colors hover:border-pink/50 hover:text-pink-light sm:text-sm"
            }
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M2 4h12M2 8h12M2 12h8" />
            </svg>
            タイトル一覧
          </button>
        </Reveal>
      ) : null}

      <AnimatePresence initial={false}>
        {showControls && indexOpen ? (
          <motion.nav
            id="journal-index"
            aria-label="タイトル一覧"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-background-elevated px-6">
              {indexItems.map((entry) => (
                <li key={entry.slug}>
                  <a
                    href={`#${entry.slug}`}
                    className="flex flex-col gap-1 py-4 transition-colors hover:text-pink-light"
                  >
                    <span className="flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.2em]">
                      <span className="text-pink">{formatNo(entry.no)}</span>
                      <span aria-hidden="true" className="h-2.5 w-px bg-border" />
                      <span className="text-muted">{formatDate(entry.date)}</span>
                      {entry.slug === firstEntry.slug ? (
                        <span className="rounded-full border border-pink/40 px-2 py-0.5 text-[0.6rem] tracking-[0.15em] text-pink-light">
                          はじまり
                        </span>
                      ) : null}
                    </span>
                    <span className="text-sm font-bold leading-snug text-foreground sm:text-base">
                      {entry.title}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        ) : null}
      </AnimatePresence>

      <div className={showControls ? "mt-10 space-y-16" : "mt-16 space-y-16"}>
        {shown.map((entry, index) => (
          // 着地点(id)は、動かない外枠に付ける。
          // Reveal の中に付けると、飛んだ直後に中身がずり上がってヘッダーに潜る
          <div key={entry.slug} id={entry.slug}>
            <Reveal delay={index * 0.1}>
              <EntryCard entry={entry} />
            </Reveal>
          </div>
        ))}
      </div>
    </>
  );
}
