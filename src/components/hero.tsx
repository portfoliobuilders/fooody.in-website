"use client";

import Image from "next/image";
import { ArrowRight, Clock3, Database, Percent, Repeat } from "lucide-react";
import { HashLink } from "@/components/hash-link";
import { useWaitlist } from "@/components/waitlist-context";

const PROOF = [
  { icon: Percent, value: "0%", label: "Commission Per Order" },
  { icon: Database, value: "100%", label: "Customer Data Ownership" },
  { icon: Repeat, value: "40%+", label: "Higher Repeat Customer Rate" },
  { icon: Clock3, value: "24 Hours", label: "Setup & Go-Live" },
] as const;

export function Hero() {
  const { openWaitlist } = useWaitlist();

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pb-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="pill">
            <span className="pulse-dot" aria-hidden="true" />
            🔥 Rebuilding the Future of Restaurant Freedom
          </div>
          <h1 className="font-display mt-6 max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight text-ivory sm:text-6xl lg:text-[4.4rem]">
            Getting orders is easy.{" "}
            <span className="gradient-text">Owning your customers</span> is
            power.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ivory/70 sm:text-lg">
            Cut the 15–30% aggregator tax. Fooody gives restaurants their own 0%
            commission direct ordering system—branded websites, apps, QR menus,
            and automated WhatsApp stores with 100% customer data retention.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              className="btn-primary"
              onClick={() => openWaitlist("hero-primary")}
            >
              Launch Your Restaurant Channel
              <ArrowRight size={16} />
            </button>
            <HashLink href="/our-story/" className="btn-ghost">
              Explore The 2016 Origin Story
              <ArrowRight size={16} />
            </HashLink>
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PROOF.map((item) => (
              <div
                key={item.label}
                className="card-lux px-4 py-4"
              >
                <item.icon className="mb-3 text-ember" size={18} />
                <dt className="font-display text-xl font-bold text-ivory sm:text-2xl">
                  {item.value}
                </dt>
                <dd className="mt-1 text-xs leading-snug text-mist">
                  {item.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-flame/25 via-transparent to-gold/20 blur-2xl" />
          <div className="card-lux relative floaty p-2">
            <div className="relative overflow-hidden rounded-[1.2rem]">
              <Image
                src="/images/hero-kerala-table.jpg"
                alt="A luxury Kerala dining table at night — the kind of branded experience restaurants can own with Fooody"
                width={1280}
                height={720}
                priority
                className="h-[420px] w-full object-cover sm:h-[520px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-obsidian/75 p-4 backdrop-blur">
                  <p className="text-[0.65rem] tracking-[0.18em] text-gold uppercase">
                    Direct channel
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold">
                    Your brand. Your guests.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-obsidian/75 p-4 backdrop-blur">
                  <p className="text-[0.65rem] tracking-[0.18em] text-gold uppercase">
                    Aggregator tax
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold">
                    15–30% gone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
