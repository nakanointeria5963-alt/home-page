"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center"
    >
      <motion.img
        src="/logo.svg"
        alt="ROGUE PINK"
        className="mb-8 h-28 w-28 rounded-2xl shadow-[0_0_60px_rgba(255,46,136,0.35)] sm:h-36 sm:w-36"
        initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-4xl font-black tracking-tight text-foreground sm:text-6xl"
      >
        ROGUE PINK
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-pink-light sm:text-2xl"
      >
        ありがとうと言ってもらいたい。
        <br />
        そして、ありがとうと言いたい。
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4 max-w-md text-sm text-muted sm:text-base"
      >
        ひとりから始まる、なんでもありのブランド。
      </motion.p>

      <motion.a
        href="#concept"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="mt-14 flex flex-col items-center gap-2 text-xs font-medium text-muted"
      >
        <span className="tracking-[0.3em]">SCROLL</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="h-8 w-px bg-gradient-to-b from-pink to-transparent"
        />
      </motion.a>
    </section>
  );
}
