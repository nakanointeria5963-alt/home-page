"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";
import EntryCard from "./EntryCard";
import type { WritingEntry } from "./entries";

type Order = "newest" | "oldest";

type WritingListProps = {
  /** 古い順(はじまりの1本を除いたもの)で渡す */
  entries: WritingEntry[];
};

export default function WritingList({ entries }: WritingListProps) {
  const [order, setOrder] = useState<Order>("newest");
  const shown = order === "newest" ? [...entries].reverse() : entries;

  return (
    <>
      <Reveal className="mt-16 flex justify-center">
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
      </Reveal>

      <div className="mt-10 space-y-16">
        {shown.map((entry, index) => (
          <Reveal key={entry.slug} delay={index * 0.1}>
            <EntryCard entry={entry} />
          </Reveal>
        ))}
      </div>
    </>
  );
}
