"use client";

import { Check } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { useWaitlist } from "@/components/waitlist-context";

const TIERS = [
  {
    name: "Direct Web",
    kicker: "Single outlet",
    points: [
      "Branded web store on your domain",
      "QR dine-in menus",
      "WhatsApp ordering",
      "0% commission, cancel anytime",
    ],
    featured: false,
  },
  {
    name: "Flagship Channel",
    kicker: "Most kitchens choose this",
    points: [
      "Everything in Direct Web",
      "Custom Android & iOS apps",
      "Full CRM + retention automations",
      "POS / KOT kitchen flow",
    ],
    featured: true,
  },
  {
    name: "Group & Multi-outlet",
    kicker: "For growing groups",
    points: [
      "Centralised brand control",
      "In-house fleet or 3PL",
      "Multi-kitchen routing",
      "Dedicated onboarding partner",
    ],
    featured: false,
  },
] as const;

const COMPARE = [
  ["Commission per order", "15–30%", "0%"],
  ["Customer phone & history", "Rented / hidden", "100% yours"],
  ["Brand experience", "Marketplace skin", "Your website, app & QR"],
  ["Contracts", "Lock-in + ads pressure", "Cancel anytime"],
  ["Repeat economics", "You pay to reacquire", "You already own the guest"],
] as const;

export function Pricing() {
  const { openWaitlist } = useWaitlist();

  return (
    <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="gold-text font-display text-sm font-semibold tracking-[0.22em] uppercase">
            Pricing
          </p>
          <h2 className="font-display mt-4 max-w-3xl text-3xl font-extrabold sm:text-5xl">
            A subscription. Never a tax on every plate.
          </h2>
          <p className="mt-4 max-w-2xl text-ivory/70">
            Fooody is transparent monthly software — not a 25% haircut. Founding
            2026 partners lock pioneer pricing. Exact rates are confirmed on
            onboarding, never at the checkout of a guest.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {TIERS.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 80}>
              <article
                className={`card-lux flex h-full flex-col p-7 ${
                  tier.featured ? "ring-1 ring-ember/50" : ""
                }`}
              >
                <p className="text-xs tracking-[0.18em] text-gold uppercase">
                  {tier.kicker}
                </p>
                <h3 className="font-display mt-2 text-2xl font-bold">
                  {tier.name}
                </h3>
                <p className="mt-2 text-sm text-mist">0% per order. Always.</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.points.map((point) => (
                    <li key={point} className="flex gap-2 text-sm text-ivory/85">
                      <Check size={16} className="mt-0.5 shrink-0 text-ember" />
                      {point}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={tier.featured ? "btn-primary mt-8" : "btn-ghost mt-8"}
                  onClick={() => openWaitlist(`pricing-${tier.name}`)}
                >
                  Claim founding access
                </button>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="card-lux mt-8 overflow-x-auto p-2">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">
                Aggregators versus Fooody comparison
              </caption>
              <thead>
                <tr className="text-mist">
                  <th className="px-5 py-4 font-medium">The split</th>
                  <th className="px-5 py-4 font-medium">Aggregators</th>
                  <th className="px-5 py-4 font-medium text-ember">Fooody</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row[0]} className="border-t border-white/10">
                    {row.map((cell, idx) => (
                      <td
                        key={cell}
                        className={`px-5 py-4 ${idx === 2 ? "text-ivory" : "text-ivory/70"}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
