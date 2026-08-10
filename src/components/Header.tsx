"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

const NAV_ITEMS = [
  { href: "/#concept", label: "コンセプト" },
  { href: "/#businesses", label: "事業" },
  { href: "/#vision", label: "世界観" },
  { href: "/journal", label: "制作日誌" },
  { href: "/writing", label: "執筆" },
  { href: "/#contact", label: "連絡先" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 sm:px-10">
        <a href="/#top" className="flex items-center gap-2">
          <Image
            src="/logo.jpg"
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
        <div className="flex items-center gap-3">
          <a
            href="/#contact"
            className="hidden rounded-full bg-pink px-4 py-2 text-xs font-bold tracking-wide text-white shadow-[0_0_20px_rgba(255,46,136,0.45)] transition-transform hover:scale-105 sm:inline-block sm:text-sm"
          >
            連絡する
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground sm:hidden"
          >
            <span className="relative block h-3 w-4">
              <motion.span
                className="absolute inset-x-0 top-0 h-0.5 bg-current"
                animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 6 : 0 }}
              />
              <motion.span
                className="absolute inset-x-0 bottom-0 h-0.5 bg-current"
                animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -6 : 0 }}
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border/60 sm:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-2 py-3 text-base font-medium text-muted transition-colors hover:bg-background-elevated hover:text-pink-light"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="/#contact"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-full bg-pink px-4 py-3 text-center text-sm font-bold text-white"
              >
                連絡する
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
