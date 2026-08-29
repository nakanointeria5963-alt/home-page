import ReadAloud from "@/components/ReadAloud";
import { formatNo, type JournalEntry } from "./entries";

function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

export default function EntryCard({ entry }: { entry: JournalEntry }) {
  return (
    <article className="rounded-2xl border border-border bg-background-elevated p-8 sm:p-10">
      {/* 番号の場所。1本目だけ、数字ではなく「はじまり」が入る */}
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
      <ReadAloud title={entry.title} paragraphs={entry.paragraphs} />
    </article>
  );
}
