"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ParticleBurst, { createParticles, type Particle } from "@/components/ParticleBurst";

const STORAGE_KEY = "roguepink.thankYouCount";
const FLUSH_DELAY_MS = 800;

type ThanksResponse = {
  enabled: boolean;
  total: number | null;
  applied?: number;
  limited?: boolean;
};

export default function ThankYouButton() {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [globalTotal, setGlobalTotal] = useState<number | null>(null);

  // Taps land here until the next flush, so every tap reaches the server even
  // when they come faster than we want to fire requests.
  const pending = useRef(0);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    flushTimer.current = null;
    const delta = pending.current;
    if (delta <= 0) return;
    pending.current = 0;

    fetch("/api/thanks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta }),
    })
      .then((res) => res.json())
      .then((data: ThanksResponse) => {
        if (data.enabled && typeof data.total === "number") setGlobalTotal(data.total);
      })
      .catch(() => {
        // global counter is a bonus; ignore network/API failures
      });
  }, []);

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

  // Don't lose taps that are still pending when the page goes away.
  useEffect(() => {
    const flushOnHide = () => {
      const delta = pending.current;
      if (delta <= 0) return;
      pending.current = 0;
      if (flushTimer.current) {
        clearTimeout(flushTimer.current);
        flushTimer.current = null;
      }
      navigator.sendBeacon?.(
        "/api/thanks",
        new Blob([JSON.stringify({ delta })], { type: "application/json" })
      );
    };

    window.addEventListener("pagehide", flushOnHide);
    return () => {
      window.removeEventListener("pagehide", flushOnHide);
      flushOnHide();
    };
  }, []);

  const handleTap = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Functional update so bursts of taps in a single tick all count.
    setCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });

    // Move the shared total in step with the tap; the flush response reconciles
    // it against the server's authoritative value moments later.
    setGlobalTotal((prev) => (prev === null ? prev : prev + 1));

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setParticles((prev) => [...prev, ...createParticles(x, y, 10, 70)]);

    pending.current += 1;
    if (!flushTimer.current) {
      flushTimer.current = setTimeout(flush, FLUSH_DELAY_MS);
    }
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
