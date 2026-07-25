"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import ParticleBurst, { createParticles, type Particle } from "@/components/ParticleBurst";

type MascotBubbleProps = {
  message: ReactNode;
  align?: "left" | "right";
};

const REACTIONS = [
  "えへへ、ありがとう!",
  "その調子!",
  "うれしいな、ふふっ",
  "またタップしてね",
  "今日もいい日にしよう",
  "くすぐったいよ〜",
];

export default function MascotBubble({
  message,
  align = "left",
}: MascotBubbleProps) {
  const [tapped, setTapped] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [reaction, setReaction] = useState<string | null>(null);
  const reactionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastReaction = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (reactionTimeout.current) clearTimeout(reactionTimeout.current);
    };
  }, []);

  const handleTap = (event: React.MouseEvent<HTMLButtonElement>) => {
    setTapped(true);
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.width / 2;
    const y = rect.height / 2;
    setParticles((prev) => [...prev, ...createParticles(x, y, 8, 60)]);

    let next = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
    if (next === lastReaction.current && REACTIONS.length > 1) {
      next = REACTIONS[(REACTIONS.indexOf(next) + 1) % REACTIONS.length];
    }
    lastReaction.current = next;
    setReaction(next);

    if (reactionTimeout.current) clearTimeout(reactionTimeout.current);
    reactionTimeout.current = setTimeout(() => setReaction(null), 2400);
  };

  const handleParticleDone = (id: number) => {
    setParticles((prev) => prev.filter((particle) => particle.id !== id));
  };

  return (
    <div
      className={`flex items-end gap-4 ${
        align === "right" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <button
        type="button"
        onClick={handleTap}
        aria-label="マスコットをタップする"
        className="relative shrink-0 appearance-none border-none bg-transparent p-0"
      >
        <motion.img
          src="/mascot.png"
          alt="ROGUE PINKのマスコット"
          className="h-24 w-auto drop-shadow-[0_0_25px_rgba(255,46,136,0.25)] sm:h-28"
          variants={{
            idle: { y: [0, -10, 0], rotate: [0, -3, 0, 3, 0] },
            tapped: { scale: [1, 0.85, 1.15, 1], y: [0, 4, -24, 0] },
          }}
          animate={tapped ? "tapped" : "idle"}
          transition={
            tapped
              ? { duration: 0.5, ease: "easeOut" }
              : { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }
          onAnimationComplete={() => {
            if (tapped) setTapped(false);
          }}
        />
        <ParticleBurst particles={particles} variant="heart" onDone={handleParticleDone} />
      </button>
      <div
        className="relative rounded-2xl rounded-bl-sm border border-border bg-background-elevated px-5 py-4 text-sm text-muted shadow-[0_0_30px_rgba(255,46,136,0.08)] sm:text-base"
        aria-live="polite"
      >
        <AnimatePresence mode="wait">
          {reaction ? (
            <motion.p
              key={reaction}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-pink"
            >
              {reaction}
            </motion.p>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
