"use client";

import { WaitlistForm } from "@/components/waitlist-form";
import { Reveal } from "@/components/reveal";

export function WaitlistSection() {
  return (
    <section id="waitlist" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[1fr_0.9fr]">
        <Reveal>
          <p className="gold-text font-display text-sm font-semibold tracking-[0.22em] uppercase">
            Early access waitlist
          </p>
          <h2 className="font-display mt-4 text-3xl font-extrabold sm:text-5xl">
            Claim your direct channel before the 2026 cohort fills.
          </h2>
          <p className="mt-4 max-w-xl text-ivory/70">
            24-hour setup. 0% commission. 100% of your customers, finally in
            your CRM. Founding kitchens across Kerala and India get pioneer
            onboarding.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <div className="card-lux p-6 sm:p-8">
            <WaitlistForm idPrefix="page" source="on-page" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
