import Reveal from "@/components/Reveal";
import MascotBubble from "@/components/MascotBubble";

const EMAIL = "nakanointeria5963@gmail.com";

export default function Contact() {
  return (
    <section
      id="contact"
      className="mx-auto max-w-3xl px-6 py-32 sm:py-40"
    >
      <Reveal>
        <p className="text-center text-xs font-bold tracking-[0.4em] text-pink-light">
          CONTACT
        </p>
        <h2 className="mt-4 text-center text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          連絡先
        </h2>
      </Reveal>

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

      <Reveal delay={0.3} className="mt-10 flex justify-center">
        <a
          href={`mailto:${EMAIL}`}
          className="rounded-full bg-pink px-8 py-4 text-base font-bold text-white shadow-[0_0_40px_rgba(255,46,136,0.4)] transition-transform hover:scale-105 sm:text-lg"
        >
          {EMAIL}
        </a>
      </Reveal>
    </section>
  );
}
