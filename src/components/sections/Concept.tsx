import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import MascotBubble from "@/components/MascotBubble";

export default function Concept() {
  return (
    <section
      id="concept"
      className="mx-auto max-w-3xl px-6 py-32 sm:py-40"
    >
      <SectionHeading eyebrow="CONCEPT" title="コンセプト" />

      <Reveal delay={0.15}>
        <div className="mt-12 space-y-6 text-center text-base leading-loose text-muted sm:text-lg">
          <p>
            人と人の間をめぐっているのは、いつも「ありがとう」という気持ちだと思っています。
          </p>
          <p>
            お金の流れも、仕事の流れも、その循環がかたちを変えているだけ。
            それが、私が信じる社会の絶対的な構造です。
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.3} className="mt-16">
        <MascotBubble
          message={
            <>
              「ありがとう」と言ってもらいたい。
              <br />
              そして、私も「ありがとう」と言いたい。
              <br />
              その願いから、ROGUE PINKは始まります。
            </>
          }
        />
      </Reveal>
    </section>
  );
}
