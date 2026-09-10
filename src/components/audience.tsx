"use client";

import { useState } from "react";
import { Coffee, Pizza, Store, Truck } from "lucide-react";
import { Reveal } from "@/components/reveal";

const TABS = [
  {
    id: "cafes",
    label: "Full-Service & Cafes",
    icon: Coffee,
    headline: "Hospitality that remembers every guest.",
    copy: "Table QR orders, express pickup, and loyalty rewards for frequent diners — without sending your regulars into a marketplace.",
    points: [
      "QR dine-in that stays on your brand",
      "Express pickup for the after-office rush",
      "Loyalty that compounds repeat visits",
    ],
  },
  {
    id: "bakeries",
    label: "Bakeries & Pizzerias",
    icon: Pizza,
    headline: "Complex orders. Calendar-perfect fulfilment.",
    copy: "Advanced scheduled orders, date-time pre-booking, and deep topping or crust modifiers so customisation never becomes chaos.",
    points: [
      "Date-time pre-booking for cakes and catering trays",
      "Modifier trees for crusts, toppings, and finishes",
      "Scheduled production that kitchens can actually run",
    ],
  },
  {
    id: "qsr",
    label: "QSRs & Cloud Kitchens",
    icon: Store,
    headline: "Rush hour, without the marketplace tax.",
    copy: "High-frequency volume with instant one-tap checkouts, 86-item toggling, and a kitchen ticket stream built for speed.",
    points: [
      "One-tap reorders for power users",
      "Peak-hour queue handling",
      "Cloud-kitchen multi-brand routing",
    ],
  },
  {
    id: "trucks",
    label: "Food Trucks & Catering",
    icon: Truck,
    headline: "Move the kitchen. Keep the customer.",
    copy: "Live location updates, bulk catering inquiry workflows, and frictionless mobile pay for events, beaches, and office parks.",
    points: [
      "Location drops as the truck moves",
      "Structured catering enquiry to confirmed booking",
      "Mobile-first checkout in the wild",
    ],
  },
] as const;

export function Audience() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("cafes");
  const tab = TABS.find((item) => item.id === active) ?? TABS[0];

  return (
    <section id="who" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="gold-text font-display text-sm font-semibold tracking-[0.22em] uppercase">
            Who is this built for?
          </p>
          <h2 className="font-display mt-4 max-w-3xl text-3xl font-extrabold sm:text-5xl">
            Tailored to the way your kitchen actually runs.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div
            role="tablist"
            aria-label="Restaurant formats"
            className="grid gap-3"
          >
            {TABS.map((item) => {
              const selected = item.id === active;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`flex items-start gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                    selected
                      ? "border-ember/50 bg-charcoal"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                  onClick={() => setActive(item.id)}
                >
                  <item.icon
                    className={selected ? "text-ember" : "text-mist"}
                    size={18}
                  />
                  <span>
                    <span className="block font-semibold">{item.label}</span>
                    <span className="mt-1 block text-sm text-mist">
                      {item.headline}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <Reveal>
            <div role="tabpanel" className="card-lux p-8">
              <p className="text-xs tracking-[0.18em] text-gold uppercase">
                Format playbook
              </p>
              <h3 className="font-display mt-3 text-2xl font-bold">
                {tab.headline}
              </h3>
              <p className="mt-4 leading-relaxed text-ivory/75">{tab.copy}</p>
              <ul className="mt-6 space-y-3">
                {tab.points.map((point) => (
                  <li key={point} className="flex gap-3 text-ivory">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
