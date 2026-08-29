"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toSpeech } from "@/lib/reading";

// ページには記事が何本も並んでいる。2本が同時に鳴ったら聞けたものではないので、
// 新しく再生を始めたら、前に鳴っていたほうを必ず止める
let stopPlaying: (() => void) | null = null;

type Speed = "slow" | "normal" | "fast";

// ノブさんから「全体的に遅い。前の『はやい』が『ふつう』でちょうどいい」。
// 3段とも一段ずつ上げた(前: 0.85 / 1 / 1.2)
const SPEEDS: [Speed, string, number][] = [
  ["slow", "ゆっくり", 1],
  ["normal", "ふつう", 1.2],
  ["fast", "はやい", 1.45],
];

// 段落まるごとを一息で読ませない。
// 長い文をそのまま渡すと途中で切れるブラウザがあるので、句点で分ける。
function toSentences(paragraph: string): string[] {
  const out: string[] = [];
  let buffer = "";
  for (const character of paragraph) {
    buffer += character;
    if (character === "。" || character === "！" || character === "？") {
      out.push(buffer);
      buffer = "";
    }
  }
  if (buffer.trim()) out.push(buffer);
  return out;
}

type ReadAloudProps = {
  title: string;
  paragraphs: string[];
};

export default function ReadAloud({ title, paragraphs }: ReadAloudProps) {
  const [supported, setSupported] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>("normal");
  // いま読んでいる段落。-1 は題名、null は止まっている
  const [active, setActive] = useState<number | null>(null);

  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const speedRef = useRef<Speed>("normal");
  const cleanupRef = useRef<(() => void) | null>(null);

  speedRef.current = speed;

  // 声の一覧は、あとから届くことがある。届いたときにもう一度選び直す
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setSupported(true);

    const pickVoice = () => {
      const japanese = window.speechSynthesis
        .getVoices()
        .filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith("ja"));
      if (japanese.length > 0) voiceRef.current = japanese[0];
    };

    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
      cleanupRef.current?.();
    };
  }, []);

  const stop = useCallback(() => {
    cleanupRef.current?.();
  }, []);

  const play = useCallback(() => {
    const synth = window.speechSynthesis;
    stopPlaying?.();
    synth.cancel();

    // 題名 → 段落の順に、文ごとに並べる
    const queue: { paragraph: number; text: string }[] = [
      { paragraph: -1, text: title },
    ];
    paragraphs.forEach((paragraph, index) => {
      for (const sentence of toSentences(paragraph)) {
        queue.push({ paragraph: index, text: sentence });
      }
    });

    let stopped = false;
    let cursor = 0;
    let timer = 0;

    const finish = () => {
      if (stopped) return;
      stopped = true;
      window.clearTimeout(timer);
      synth.cancel();
      setPlaying(false);
      setActive(null);
      if (stopPlaying === finish) stopPlaying = null;
      cleanupRef.current = null;
    };

    const speakNext = () => {
      if (stopped) return;
      if (cursor >= queue.length) {
        finish();
        return;
      }
      const item = queue[cursor];
      setActive(item.paragraph);

      const utterance = new SpeechSynthesisUtterance(toSpeech(item.text));
      utterance.lang = "ja-JP";
      if (voiceRef.current) utterance.voice = voiceRef.current;
      utterance.rate =
        SPEEDS.find(([key]) => key === speedRef.current)?.[2] ?? 1;

      utterance.onend = () => {
        if (stopped) return;
        cursor += 1;
        const next = queue[cursor];
        // 段落が変わるところは、少し長めに黙る
        const gap = next && next.paragraph !== item.paragraph ? 480 : 130;
        timer = window.setTimeout(speakNext, gap);
      };
      utterance.onerror = finish;

      synth.speak(utterance);
    };

    stopPlaying = finish;
    cleanupRef.current = finish;
    setPlaying(true);
    speakNext();
  }, [paragraphs, title]);

  return (
    <>
      {supported ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={playing ? stop : play}
            aria-label={playing ? "読み上げを止める" : "この文章を読み上げる"}
            className={
              playing
                ? "inline-flex items-center gap-2 rounded-full border border-pink/50 bg-pink/15 px-5 py-3 text-xs font-bold text-pink-light transition-colors sm:text-sm"
                : "inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-xs font-bold text-muted transition-colors hover:border-pink/50 hover:text-pink-light sm:text-sm"
            }
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5"
              fill="currentColor"
            >
              {playing ? (
                <rect x="3" y="3" width="10" height="10" rx="1.5" />
              ) : (
                <path d="M4 2.8v10.4a.6.6 0 0 0 .92.5l8.2-5.2a.6.6 0 0 0 0-1L4.92 2.3A.6.6 0 0 0 4 2.8Z" />
              )}
            </svg>
            {playing ? "止める" : "読み上げ"}
          </button>

          <div
            role="group"
            aria-label="読み上げの速さ"
            className="inline-flex rounded-full border border-border p-1"
          >
            {SPEEDS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSpeed(key)}
                aria-pressed={speed === key}
                className={
                  speed === key
                    ? "rounded-full bg-pink/15 px-4 py-2.5 text-xs font-bold text-pink-light transition-colors"
                    : "rounded-full px-4 py-2.5 text-xs font-bold text-muted transition-colors hover:text-pink-light"
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 space-y-4 text-sm leading-loose sm:text-base">
        {paragraphs.map((paragraph, index) => (
          <p
            key={paragraph}
            className={
              active === index
                ? "-mx-4 rounded-lg bg-pink/10 px-4 py-2 text-foreground transition-colors"
                : "-mx-4 px-4 py-2 text-muted transition-colors"
            }
          >
            {paragraph}
          </p>
        ))}
      </div>
    </>
  );
}
