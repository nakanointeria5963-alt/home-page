import type { JournalEntry } from "./entries";

function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

function formatNo(no: number): string {
  return `#${String(no).padStart(2, "0")}`;
}

type EntryCardProps = {
  entry: JournalEntry;
  /** 上に固定した1本目に付ける小さい札。付けないときは省略する */
  badge?: string;
};

export default function EntryCard({ entry, badge }: EntryCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-background-elevated p-8 sm:p-10">
      {badge ? (
        <p className="mb-4 inline-block rounded-full border border-pink/40 px-3 py-1 text-[0.65rem] font-bold tracking-[0.25em] text-pink-light">
          {badge}
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        <span className="text-xs font-black tracking-[0.2em] text-pink">
          {formatNo(entry.no)}
        </span>
        <span aria-hidden="true" className="h-3 w-px bg-border" />
        <time
          dateTime={entry.date}
          className="text-xs font-bold tracking-[0.3em] text-muted"
        >
          {formatDate(entry.date)}
        </time>
      </div>
      <h2 className="mt-3 text-xl font-black text-foreground sm:text-2xl">
        {entry.title}
      </h2>
      <div className="mt-6 space-y-4 text-sm leading-loose text-muted sm:text-base">
        {entry.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
