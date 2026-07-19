"use client";

import { useState } from "react";

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="メールアドレスをコピー"
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-pink/50 hover:text-pink-light"
    >
      {copied ? (
        <span className="text-xs font-bold text-pink-light">✓</span>
      ) : (
        <span className="text-xs font-bold">コピー</span>
      )}
    </button>
  );
}
