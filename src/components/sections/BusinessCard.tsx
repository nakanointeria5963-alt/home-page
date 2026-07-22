"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import usePointerFine from "@/hooks/usePointerFine";
import type { Product } from "@/components/sections/Businesses";

type BusinessCardProps = {
  index: number;
  title: string;
  description: string;
  icon: string;
  products?: Product[];
};

export default function BusinessCard({
  index,
  title,
  description,
  icon,
  products,
}: BusinessCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isFine = usePointerFine();

  const rotateX = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 });
  const lift = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isFine || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(relX * 16);
    rotateX.set(relY * -16);
    lift.set(-4);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    lift.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        y: lift,
        transformPerspective: 800,
      }}
      className="group h-full rounded-2xl border border-border bg-background-elevated p-8 transition-colors duration-300 hover:border-pink/50 hover:shadow-[0_0_40px_rgba(255,46,136,0.15)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-[0.3em] text-pink">
          {String(index + 1).padStart(2, "0")}
        </span>
        <motion.span
          className="text-2xl"
          whileHover={{ scale: 1.15, rotate: 6 }}
          aria-hidden
        >
          {icon}
        </motion.span>
      </div>
      <h3 className="mt-3 text-xl font-black text-foreground sm:text-2xl">{title}</h3>
      <p className="mt-4 text-sm leading-loose text-muted sm:text-base">{description}</p>
      {products && (
        <div className="mt-6 flex flex-wrap gap-3">
          {products.map((product) => (
            <a
              key={product.url}
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-pink/10 px-4 py-2 text-xs font-bold text-pink-light transition-colors hover:bg-pink hover:text-white sm:text-sm"
            >
              {product.label}を使ってみる →
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
}
