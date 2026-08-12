import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import MascotBubble from "@/components/MascotBubble";
import CopyButton from "@/components/CopyButton";
import ThankYouButton from "@/components/ThankYouButton";

const EMAIL = "info@roguepink.com";

export default function Contact() {
  return (
    <section
      id="contact"
      className="mx-auto max-w-3xl px-6 py-32 sm:py-40"
    >
      <SectionHeading eyebrow="CONTACT" title="連絡先" />

      <Reveal delay={0.15} className="mt-14">
        <MascotBubble
          message={
            <>
              一緒に何かやってみたい、そう思ってもらえたら
              <br />
              いつでも気軽に連絡してください。
            </>
          }
        />
      </Reveal>

      <Reveal
        delay={0.3}
        className="mt-10 flex flex-wrap items-center justify-center gap-3"
      >
        <a
          href={`mailto:${EMAIL}`}
          className="rounded-full bg-pink px-8 py-4 text-base font-bold text-white shadow-[0_0_40px_rgba(255,46,136,0.4)] transition-transform hover:scale-105 sm:text-lg"
        >
          {EMAIL}
        </a>
        <CopyButton value={EMAIL} />
      </Reveal>

      <Reveal delay={0.45} className="mt-10 flex justify-center">
        <ThankYouButton />
      </Reveal>
    </section>
  );
}
