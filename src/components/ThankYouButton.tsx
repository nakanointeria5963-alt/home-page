"use client";

import { useEffect, useRef, useState } from "react";
import ParticleBurst, { createParticles, type Particle } from "@/components/ParticleBurst";

const STORAGE_KEY = "roguepink.thankYouCount";

type ThanksResponse = { enabled: boolean; total: number | null };

export default function ThankYouButton() {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [globalTotal, setGlobalTotal] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem(STORAGE_KEY));
      if (!Number.isNaN(stored) && stored > 0) setCount(stored);
    } catch {
      // localStorage unavailable (private mode etc.) — keep in-memory count only
    }
    setMounted(true);

    fetch("/api/thanks")
      .then((res) => res.json())
      .then((data: ThanksResponse) => {
        if (data.enabled) setGlobalTotal(data.total);
      })
      .catch(() => {
        // global counter is a bonus; ignore network/API failures
      });
  }, []);

  const handleTap = (event: React.MouseEvent<HTMLButtonElement>) => {
    const next = count + 1;
    setCount(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // ignore
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setParticles((prev) => [...prev, ...createParticles(x, y, 10, 70)]);

    fetch("/api/thanks", { method: "POST" })
      .then((res) => res.json())
      .then((data: ThanksResponse) => {
        if (data.enabled && typeof data.total === "number") setGlobalTotal(data.total);
      })
      .catch(() => {
        // global counter is a bonus; ignore network/API failures
      });
  };

  const handleParticleDone = (id: number) => {
    setParticles((prev) => prev.filter((particle) => particle.id !== id));
  };

  return (
    <button
      type="button"
      onClick={handleTap}
      aria-label="ありがとうを送る"
      className="relative flex flex-col items-center gap-2 overflow-visible rounded-2xl border border-border bg-background-elevated px-8 py-6 text-center transition-colors hover:border-pink/50"
    >
      <span className="text-2xl">💗</span>
      <span className="text-sm font-bold text-foreground sm:text-base">ありがとうを届ける</span>
      <span aria-live="polite" className="text-xs text-muted sm:text-sm">
        {mounted && count > 0
          ? `あなたはこれまで${count}回、ありがとうを届けました`
          : "タップして、ありがとうを届けよう"}
      </span>
      {globalTotal !== null && (
        <span aria-live="polite" className="text-xs text-pink sm:text-sm">
          {`🌍 みんなの合計 ${globalTotal.toLocaleString()}回`}
        </span>
      )}
      <ParticleBurst particles={particles} variant="heart" onDone={handleParticleDone} />
    </button>
  );
}
