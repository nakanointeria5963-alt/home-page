"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "@/components/Reveal";
import EntryCard from "./EntryCard";
import type { WritingEntry } from "./entries";

type Order = "newest" | "oldest";

type WritingListProps = {
  /** 上に固定している1本目。目次には入れるが、下の一覧には出さない */
  firstEntry: WritingEntry;
  /** 古い順(1本目を除いたもの)で渡す */
  entries: WritingEntry[];
  /** 読み上げボタンを付ける記事。いまは試しに1本だけ */
  readAloudSlug?: string;
};

function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

export default function WritingList({
  firstEntry,
  entries,
  readAloudSlug,
}: WritingListProps) {
  const [order, setOrder] = useState<Order>("newest");
  const [indexOpen, setIndexOpen] = useState(false);

  const shown = order === "newest" ? [...entries].reverse() : entries;
  // 目次はページに並んでいる順そのまま。固定した1本目は必ず先頭
  const indexItems = [firstEntry, ...shown];

  return (
    <>
      <Reveal className="mt-16 flex flex-wrap items-center justify-center gap-3">
        <div
          role="group"
          aria-label="並び順"
          className="inline-flex rounded-full border border-border bg-background-elevated p-1"
        >
          {(
            [
              ["newest", "新しい順"],
              ["oldest", "古い順"],
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
          aria-controls="writing-index"
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

      <AnimatePresence initial={false}>
        {indexOpen ? (
          <motion.nav
            id="writing-index"
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
                    <span className="flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.2em] text-pink">
                      {formatDate(entry.date)}
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

      <div className="mt-10 space-y-16">
        {shown.map((entry, index) => (
          // 着地点(id)は、動かない外枠に付ける。
          // Reveal の中に付けると、飛んだ直後に中身がずり上がってヘッダーに潜る
          <div key={entry.slug} id={entry.slug}>
            <Reveal delay={index * 0.1}>
              <EntryCard
                entry={entry}
                readAloud={entry.slug === readAloudSlug}
              />
            </Reveal>
          </div>
        ))}
      </div>
    </>
  );
}
