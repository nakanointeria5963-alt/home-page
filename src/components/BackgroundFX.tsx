"use client";

import { motion } from "framer-motion";

export default function BackgroundFX() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      <motion.div
        className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-pink/25 blur-[120px]"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-10rem] top-1/3 h-[28rem] w-[28rem] rounded-full bg-pink-light/20 blur-[130px]"
        animate={{ x: [0, -50, 0], y: [0, 60, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-12rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-pink/15 blur-[140px]"
        animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
