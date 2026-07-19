import Reveal from "@/components/Reveal";
import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  children?: ReactNode;
};

export default function SectionHeading({
  eyebrow,
  title,
  children,
}: SectionHeadingProps) {
  return (
    <Reveal>
      <p className="text-center text-xs font-bold tracking-[0.4em] text-pink-light">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-center text-3xl font-black tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {children}
    </Reveal>
  );
}
