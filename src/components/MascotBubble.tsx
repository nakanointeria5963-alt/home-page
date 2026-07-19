"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type MascotBubbleProps = {
  message: ReactNode;
  align?: "left" | "right";
};

export default function MascotBubble({
  message,
  align = "left",
}: MascotBubbleProps) {
  return (
    <div
      className={`flex items-end gap-4 ${
        align === "right" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <motion.img
        src="/mascot.png"
        alt="ROGUE PINKのマスコット"
        className="h-24 w-auto shrink-0 drop-shadow-[0_0_25px_rgba(255,46,136,0.25)] sm:h-28"
        animate={{ y: [0, -10, 0], rotate: [0, -3, 0, 3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative rounded-2xl rounded-bl-sm border border-border bg-background-elevated px-5 py-4 text-sm text-muted shadow-[0_0_30px_rgba(255,46,136,0.08)] sm:text-base">
        {message}
      </div>
    </div>
  );
}
