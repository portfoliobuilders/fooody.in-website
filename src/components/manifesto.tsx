import Image from "next/image";
import { Reveal } from "@/components/reveal";

export function Manifesto() {
  return (
    <section id="manifesto" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-stretch gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal>
          <figure className="card-lux relative h-full min-h-[420px] p-2">
            <Image
              src="/images/founder-night.jpg"
              alt="A Kerala restaurateur at the threshold of the dining room — the independence Fooody is built to protect"
              width={1200}
              height={1600}
              className="h-full min-h-[420px] w-full rounded-[1.2rem] object-cover"
            />
            <figcaption className="absolute inset-x-6 bottom-6 rounded-2xl border border-white/10 bg-obsidian/75 p-4 backdrop-blur">
              <p className="font-display text-lg font-semibold">Athul Anil</p>
              <p className="text-sm text-mist">Founder, Fooody.in</p>
            </figcaption>
          </figure>
        </Reveal>
        <Reveal delay={80}>
          <article className="card-lux h-full p-8 sm:p-12">
            <p className="gold-text font-display text-sm font-semibold tracking-[0.22em] uppercase">
              Founder & freedom manifesto
            </p>
            <h2 className="font-display mt-4 text-3xl font-extrabold sm:text-4xl">
              Reclaim the restaurant-first ecosystem.
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-ivory/75">
              <p>
                I started Fooody in Kerala when “order food on an app” still
                sounded like a dare. We painted walls, printed tees, wrote
                Messenger bots by hand, and asked restaurants to trust a future
                they could not yet see.
              </p>
              <p>
                The giants arrived with capital. We paused. We watched what
                scale without ownership does to a kitchen: thinner margins,
                rented customers, and brands that no longer know who ate last
                night.
              </p>
              <p>
                Getting orders is no longer the challenge. Owning those orders
                is. What gets measured gets managed, and what gets owned gets
                scaled. In 2026, Fooody returns to give restaurants across
                India a direct channel they actually own — starting from the
                state that taught us the work.
              </p>
            </div>
            <p className="font-display mt-8 text-xl text-ivory">
              — Athul Anil
            </p>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
