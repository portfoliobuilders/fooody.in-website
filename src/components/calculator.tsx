"use client";

import { useMemo, useState } from "react";
import { Reveal } from "@/components/reveal";
import { formatINR, formatNumber } from "@/lib/format";

const COMMISSION = 0.25;

export function Calculator() {
  const [orders, setOrders] = useState(1800);
  const [aov, setAov] = useState(450);

  const math = useMemo(() => {
    const monthlyGmv = orders * aov;
    const monthlyLost = monthlyGmv * COMMISSION;
    const annualSaved = monthlyLost * 12;
    return { monthlyGmv, monthlyLost, annualSaved };
  }, [orders, aov]);

  return (
    <section id="calculator" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="gold-text font-display text-sm font-semibold tracking-[0.22em] uppercase">
            Interactive commission savings calculator
          </p>
          <h2 className="font-display mt-4 max-w-3xl text-3xl font-extrabold sm:text-5xl">
            See what aggregators quietly take from your kitchen.
          </h2>
          <p className="mt-4 max-w-2xl text-ivory/70">
            Model a typical 25% marketplace cut against Fooody’s 0% direct
            engine. Move the sliders — the math updates instantly.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <div className="card-lux p-6 sm:p-8">
              <label className="block">
                <span className="flex items-center justify-between text-sm text-mist">
                  Average monthly orders
                  <strong className="text-ivory">{formatNumber(orders)}</strong>
                </span>
                <input
                  type="range"
                  min={500}
                  max={10000}
                  step={50}
                  value={orders}
                  onChange={(e) => setOrders(Number(e.target.value))}
                  className="mt-4"
                  aria-valuemin={500}
                  aria-valuemax={10000}
                  aria-valuenow={orders}
                />
                <span className="mt-2 flex justify-between text-xs text-mist/70">
                  <span>500</span>
                  <span>10,000</span>
                </span>
              </label>

              <label className="mt-8 block">
                <span className="flex items-center justify-between text-sm text-mist">
                  Average order value
                  <strong className="text-ivory">{formatINR(aov)}</strong>
                </span>
                <input
                  type="range"
                  min={200}
                  max={1500}
                  step={10}
                  value={aov}
                  onChange={(e) => setAov(Number(e.target.value))}
                  className="mt-4"
                  aria-valuemin={200}
                  aria-valuemax={1500}
                  aria-valuenow={aov}
                />
                <span className="mt-2 flex justify-between text-xs text-mist/70">
                  <span>₹200</span>
                  <span>₹1,500</span>
                </span>
              </label>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="grid gap-4">
              <div className="card-lux p-6 sm:p-8">
                <p className="text-sm text-mist">
                  Amount lost to aggregators (25% avg commission)
                </p>
                <p className="font-display mt-2 text-3xl font-extrabold text-flame sm:text-4xl">
                  {formatINR(math.monthlyLost)}
                  <span className="ml-2 text-base font-medium text-mist">
                    / month
                  </span>
                </p>
              </div>
              <div className="card-lux p-6 sm:p-8">
                <p className="text-sm text-mist">
                  Money saved annually with Fooody’s 0% Direct Engine
                </p>
                <p className="font-display mt-2 text-4xl font-extrabold gradient-text sm:text-5xl">
                  {formatINR(math.annualSaved)}
                </p>
                <p className="mt-4 text-lg text-ivory">
                  Put {formatINR(math.annualSaved)} back into your kitchen every
                  year.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
