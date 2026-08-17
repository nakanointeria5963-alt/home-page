"use client";

import { useRef } from "react";
import BusinessIcon, { type BusinessIconName } from "@/components/BusinessIcon";
import usePointerFine from "@/hooks/usePointerFine";
import type { Product } from "@/components/sections/Businesses";

export type BusinessStatus = "live" | "wip" | "soon";

export type BusinessStat = {
  /** いま出せている数。entries.ts の件数から数える */
  value: number;
  /** 「本 公開中」「曲 公開中」など、数のうしろに続く言葉 */
  unit: string;
};

export type BusinessLatest = {
  title: string;
  date: string;
};

type BusinessCardProps = {
  title: string;
  description: string;
  icon: BusinessIconName;
  status: BusinessStatus;
  stat?: BusinessStat;
  latest?: BusinessLatest;
  products?: Product[];
  /** 主役の1枚。横いっぱいで、最新の1件を並べて出す */
  featured?: boolean;
};

const STATUS: Record<
  BusinessStatus,
  { label: string; wrap: string; dot: string }
> = {
  live: {
    label: "公開中",
    wrap: "bg-pink/15 text-pink-soft",
    dot: "bg-pink shadow-[0_0_0_3px_rgba(255,46,136,0.22)]",
  },
  wip: {
    label: "制作中",
    wrap: "bg-pink-light/10 text-pink-light",
    dot: "border-[1.5px] border-pink-light",
  },
  soon: {
    label: "準備中",
    wrap: "bg-muted/10 text-muted",
    dot: "bg-muted opacity-60",
  },
};

function StatusBadge({ status }: { status: BusinessStatus }) {
  const style = STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider ${style.wrap}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

function LatestPanel({ latest }: { latest: BusinessLatest }) {
  return (
    <div className="w-full shrink-0 rounded-xl border border-border bg-pink/5 px-4 py-3.5 sm:w-64">
      <p className="text-[10px] font-bold tracking-[0.2em] text-pink">LATEST</p>
      <p className="mt-1.5 text-sm font-bold leading-relaxed text-foreground">
        {latest.title}
      </p>
      <p className="mt-1 text-[11px] tabular-nums text-muted">{latest.date}</p>
    </div>
  );
}

export default function BusinessCard({
  title,
  description,
  icon,
  status,
  stat,
  latest,
  products,
  featured = false,
}: BusinessCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isFine = usePointerFine();
  const isSleeping = status === "soon";
  const canGlow = isFine && !isSleeping;

  // カーソルの位置を CSS 変数に流す。state を使わないので再描画は起きない
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!canGlow || !card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  const body = (
    <>
      <div className="flex items-center gap-3">
        <BusinessIcon
          name={icon}
          className={`h-[22px] w-[22px] transition-transform duration-300 motion-reduce:transition-none ${
            isSleeping
              ? "text-muted"
              : "text-pink group-hover:-rotate-3 group-hover:scale-110"
          }`}
        />
        <StatusBadge status={status} />
      </div>

      <h3
        className={`mt-3 font-black tracking-tight text-foreground ${
          featured ? "text-2xl sm:text-4xl" : "text-xl sm:text-2xl"
        }`}
      >
        {title}
      </h3>

      <p
        className={`mt-3 leading-loose text-muted ${
          featured ? "max-w-xl text-sm sm:text-base" : "text-sm"
        }`}
      >
        {description}
      </p>

      {stat && (
        <div className="mt-4 flex items-baseline gap-2 border-t border-border pt-4 text-xs text-muted">
          <b className="text-base font-black tabular-nums text-pink-soft">
            {stat.value}
          </b>
          <span>{stat.unit}</span>
        </div>
      )}

      {products && (
        <div className="mt-5 flex flex-wrap gap-3">
          {products.map((product) => {
            const isExternal = product.url.startsWith("http");
            return (
              <a
                key={product.url}
                href={product.url}
                {...(isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="inline-flex items-center gap-1 rounded-full bg-pink/10 px-4 py-2 text-xs font-bold text-pink-light transition-colors hover:bg-pink hover:text-white focus-visible:bg-pink focus-visible:text-white sm:text-sm"
              >
                {product.label} →
              </a>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={[
        "group relative isolate overflow-hidden rounded-2xl border border-border bg-background-elevated transition-colors duration-300",
        featured ? "p-8 sm:p-10" : "p-7 sm:p-8",
        // 準備中はまだ中身が少ないので、無理に高さを揃えず静かに短く置く
        isSleeping ? "opacity-55" : "h-full hover:border-pink-light/40",
      ].join(" ")}
    >
      {canGlow && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
          style={{
            // 横いっぱいのカードは面積が広いので、光も大きくしないと薄まって見えない
            background: `radial-gradient(${
              featured ? "520px" : "360px"
            } circle at var(--mx, 50%) var(--my, 50%), rgba(255,46,136,0.26), transparent 64%)`,
          }}
        />
      )}

      {featured && latest ? (
        <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
          <div>{body}</div>
          <LatestPanel latest={latest} />
        </div>
      ) : (
        body
      )}
    </div>
  );
}
