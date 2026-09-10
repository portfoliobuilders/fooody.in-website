import Image from "next/image";
import { Reveal } from "@/components/reveal";

const MOMENTS = [
  {
    src: "/images/office-progress.jpg",
    alt: "DIY office setup in progress — Fooody’s early Kerala workspace being painted by the founding team",
    caption: "Painting the office ourselves, 2016",
  },
  {
    src: "/images/early-app-bot.jpg",
    alt: "Early Messenger-style restaurant ordering bot on a phone in a Kerala restaurant",
    caption: "Custom Facebook ordering bots",
  },
  {
    src: "/images/fooody-merch.jpg",
    alt: "First-generation Fooody merchandise, printed tees and early team artefacts",
    caption: "First-generation merch & team",
  },
] as const;

export function OriginStory() {
  return (
    <section id="story" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="gold-text font-display text-sm font-semibold tracking-[0.22em] uppercase">
            The authentic 2016 origin story
          </p>
          <h2 className="font-display mt-4 max-w-4xl text-3xl leading-tight font-extrabold sm:text-5xl">
            We were delivering in Kerala before the giants even landed.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <div className="space-y-5 text-base leading-relaxed text-ivory/75 sm:text-lg">
              <p>
                Back in 2016–2017, Fooody pioneered app-based delivery in
                Kerala. We were in the trenches—personally painting our office
                walls, running custom Facebook ordering bots, printing t-shirts,
                and convincing restaurants to go digital.
              </p>
              <p>
                Swiggy entered Kochi on{" "}
                <strong className="text-ivory">April 3, 2018</strong>. Zomato
                expanded across Kerala cities like Trivandrum, Thrissur, and
                Alappuzha on{" "}
                <strong className="text-ivory">June 27, 2018</strong>.
              </p>
              <p>
                Fooody paused, learned, and now returns in 2026 to solve the
                real crisis facing Indian food businesses: margin-killing
                aggregator commissions and total lack of customer ownership.
              </p>
            </div>
            <ol className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ["2016–17", "Kerala’s original food-tech delivery pioneer"],
                ["Apr 3, 2018", "Swiggy arrives in Kochi"],
                ["Jun 27, 2018", "Zomato expands across Kerala cities"],
                ["2026", "The comeback: from orders to ownership"],
              ].map(([year, copy]) => (
                <li key={year} className="card-lux p-5">
                  <p className="text-xs tracking-[0.18em] text-gold uppercase">
                    {year}
                  </p>
                  <p className="mt-2 font-medium text-ivory">{copy}</p>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={120}>
            <blockquote className="card-lux relative p-8 sm:p-10">
              <span className="font-display text-6xl leading-none text-flame/40">
                “
              </span>
              <p className="font-display text-2xl leading-snug font-semibold text-ivory">
                The smartest restaurants are no longer chasing visibility.
                They’re building direct customer relationships.
              </p>
              <footer className="mt-6 text-sm text-mist">
                Fooody manifesto · Kerala, 2026
              </footer>
            </blockquote>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {MOMENTS.map((shot, i) => (
            <Reveal key={shot.src} delay={i * 90}>
              <figure className="card-lux group p-2">
                <div className="overflow-hidden rounded-[1.15rem]">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={800}
                    height={600}
                    className="h-64 w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <figcaption className="px-3 py-3 text-sm text-mist">
                  {shot.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
