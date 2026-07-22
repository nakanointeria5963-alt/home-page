"use client";

import { motion } from "framer-motion";

export type Particle = {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  rotate: number;
};

const COLORS = ["var(--color-pink)", "var(--color-pink-light)", "var(--color-pink-soft)"];

let idCounter = 0;

export function createParticles(x: number, y: number, count = 10, spread = 70): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const distance = spread * (0.5 + Math.random() * 0.5);
    idCounter += 1;
    return {
      id: idCounter,
      x,
      y,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotate: (Math.random() - 0.5) * 180,
    };
  });
}

type ParticleBurstProps = {
  particles: Particle[];
  variant: "heart" | "spark";
  onDone: (id: number) => void;
};

export default function ParticleBurst({ particles, variant, onDone }: ParticleBurstProps) {
  return (
    <>
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="pointer-events-none absolute select-none"
          style={{ left: particle.x, top: particle.y, color: particle.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: variant === "heart" ? 0.6 : 0.4 }}
          animate={{
            x: particle.dx,
            y: particle.dy,
            opacity: [1, 1, 0],
            scale: variant === "heart" ? 1.1 : 0.8,
            rotate: particle.rotate,
          }}
          transition={{
            default: { duration: variant === "heart" ? 0.9 : 0.6, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: variant === "heart" ? 0.9 : 0.6, times: [0, 0.65, 1] },
          }}
          onAnimationComplete={() => onDone(particle.id)}
        >
          {variant === "heart" ? (
            <span className="text-lg">♥</span>
          ) : (
            <span className="block h-1.5 w-1.5 rounded-full bg-current blur-[1px]" />
          )}
        </motion.span>
      ))}
    </>
  );
}
