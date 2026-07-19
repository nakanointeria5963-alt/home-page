"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const NAV_ITEMS = [
  { href: "#concept", label: "コンセプト" },
  { href: "#businesses", label: "事業" },
  { href: "#vision", label: "世界観" },
  { href: "#contact", label: "連絡先" },
];

export default function Header() {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 sm:px-10">
        <a href="#top" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="ROGUE PINK"
            width={32}
            height={32}
            className="h-8 w-8 rounded-md"
          />
          <span className="text-sm font-black tracking-[0.2em] text-foreground">
            ROGUE PINK
          </span>
        </a>
        <nav className="hidden gap-8 text-sm font-medium text-muted sm:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-pink-light"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="rounded-full bg-pink px-4 py-2 text-xs font-bold tracking-wide text-white shadow-[0_0_20px_rgba(255,46,136,0.45)] transition-transform hover:scale-105 sm:text-sm"
        >
          連絡する
        </a>
      </div>
    </motion.header>
  );
}
