"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import ParticleBurst, { createParticles, type Particle } from "@/components/ParticleBurst";
import usePointerFine from "@/hooks/usePointerFine";

const MAX_TRAIL_PARTICLES = 16;
const SPAWN_INTERVAL_MS = 50;

export default function SparkleTrail() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const isFine = usePointerFine();
  const prefersReducedMotion = useReducedMotion();
  const lastSpawnRef = useRef(0);

  const handleParticleDone = (id: number) => {
    setParticles((prev) => prev.filter((particle) => particle.id !== id));
  };

  useEffect(() => {
    if (prefersReducedMotion) return;

    if (isFine) {
      const handlePointerMove = (event: PointerEvent) => {
        const now = performance.now();
        if (now - lastSpawnRef.current < SPAWN_INTERVAL_MS) return;
        lastSpawnRef.current = now;
        setParticles((prev) => {
          const next = [...prev, ...createParticles(event.clientX, event.clientY, 1, 12)];
          return next.length > MAX_TRAIL_PARTICLES
            ? next.slice(next.length - MAX_TRAIL_PARTICLES)
            : next;
        });
      };
      window.addEventListener("pointermove", handlePointerMove);
      return () => window.removeEventListener("pointermove", handlePointerMove);
    }

    const handlePointerDown = (event: PointerEvent) => {
      setParticles((prev) => [...prev, ...createParticles(event.clientX, event.clientY, 6, 40)]);
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isFine, prefersReducedMotion]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <ParticleBurst particles={particles} variant="spark" onDone={handleParticleDone} />
    </div>
  );
}
