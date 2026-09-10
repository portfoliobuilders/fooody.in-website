import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Manifesto } from "@/components/manifesto";
import { Navbar } from "@/components/navbar";
import { OriginStory } from "@/components/origin-story";
import { PageShell } from "@/components/page-shell";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our 2016 Story",
  description:
    "Fooody pioneered app-based food delivery in Kerala in 2016 — painting offices, writing Messenger bots, and going digital before Swiggy and Zomato arrived in 2018. The 2026 comeback is about restaurant ownership.",
  alternates: { canonical: "/our-story/" },
  openGraph: {
    title: "Our 2016 Story · Fooody.in",
    description:
      "The authentic chronicle of Kerala’s original food-tech pioneer — and why Fooody returned in 2026.",
    url: `${SITE.url}/our-story/`,
  },
};

export default function OurStoryPage() {
  return (
    <PageShell variant="editorial">
      <Navbar />
      <main id="main" className="relative z-[2] pt-20">
        <OriginStory />
        <Manifesto />
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="card-lux mx-auto max-w-7xl p-8 sm:p-12">
            <p className="gold-text font-display text-sm font-semibold tracking-[0.22em] uppercase">
              Why this history matters
            </p>
            <h2 className="font-display mt-3 text-3xl font-extrabold">
              The giants taught Kerala to order. They never taught kitchens to own.
            </h2>
            <div className="mt-6 grid gap-6 text-ivory/75 lg:grid-cols-2">
              <p>
                Athul Anil’s 2016 startup was not a pitch-deck romance. It was
                wet paint on office walls, late-night Facebook bot code, and
                first-generation merch handed to riders who still had to
                explain what “order on an app” meant.
              </p>
              <p>
                When national capital arrived in 2018, Fooody paused. The 2026
                return is the unfinished sentence: restaurants across India
                deserve a direct store at fooody.in/their-brand — with 0%
                commission and 100% of their guests.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PageShell>
  );
}
