import Reveal from "@/components/Reveal";

export default function Vision() {
  return (
    <section id="vision" className="mx-auto max-w-3xl px-6 py-32 sm:py-40">
      <Reveal>
        <p className="text-center text-xs font-bold tracking-[0.4em] text-pink-light">
          VISION
        </p>
        <h2 className="mt-4 text-center text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          目指す世界
        </h2>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="mt-12 space-y-6 text-center text-base leading-loose text-muted sm:text-lg">
          <p>
            アプリも、音楽も、洋服も。暮らしの全部が、ここでゆるやかにつながっていく。
          </p>
          <p>遊んで、話して、買って、聴いて。なんでもあり、だけどちゃんと真面目。</p>
          <p className="font-bold text-foreground">
            ひとりから始まる事業が、いつか誰かの「ありがとう」に変わる場所を目指します。
          </p>
        </div>
      </Reveal>
    </section>
  );
}
