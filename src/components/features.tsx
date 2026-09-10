import {
  Bike,
  HeartPulse,
  QrCode,
  ShieldCheck,
  Smartphone,
  Store,
  Workflow,
} from "lucide-react";
import { Reveal } from "@/components/reveal";

const FEATURES = [
  {
    title: "Multi-Channel Direct Engine",
    copy: "Branded web store, custom Android/iOS apps, dine-in smart QR codes, and WhatsApp conversational commerce — one kitchen, every channel you own.",
    icon: Store,
    wide: true,
    chips: ["Web Store", "Apps", "QR Menus", "WhatsApp"],
  },
  {
    title: "100% Customer CRM & Retention",
    copy: "Full visibility into phone numbers, ordering patterns, favourite dishes, and automated re-engagement on SMS and WhatsApp.",
    icon: HeartPulse,
    wide: false,
  },
  {
    title: "Smart POS & Kitchen Order Flow",
    copy: "Real-time KOT printing, 86-item auto-toggling, and bi-directional POS integration so the floor and the pass stay in sync.",
    icon: Workflow,
    wide: false,
  },
  {
    title: "Third-Party Logistics or In-House Fleet",
    copy: "Plug into Dunzo, Shadowfax, Porter — or run your own riders with live tracking. Delivery is a choice, not a tax.",
    icon: Bike,
    wide: false,
  },
  {
    title: "Zero Contracts & 0% Hidden Cuts",
    copy: "Transparent subscription. Cancel anytime. Own your domain and user base forever. No lock-in, no leakage.",
    icon: ShieldCheck,
    wide: false,
  },
] as const;

export function Features() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="gold-text font-display text-sm font-semibold tracking-[0.22em] uppercase">
            Platform features
          </p>
          <h2 className="font-display mt-4 max-w-3xl text-3xl font-extrabold sm:text-5xl">
            The operating system for restaurant freedom.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 lg:grid-cols-6">
          {FEATURES.map((feature, i) => (
            <Reveal
              key={feature.title}
              delay={i * 70}
              className={feature.wide ? "lg:col-span-4" : "lg:col-span-2"}
            >
              <article className="card-lux h-full p-6 sm:p-8">
                <feature.icon className="text-ember" size={22} />
                <h3 className="font-display mt-5 text-xl font-bold">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ivory/70">
                  {feature.copy}
                </p>
                {"chips" in feature ? (
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {feature.chips.map((chip) => (
                      <li
                        key={chip}
                        className="rounded-full border border-white/10 px-3 py-1 text-xs text-gold"
                      >
                        {chip}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-ivory/80">
              <Smartphone size={16} className="text-gold" />
              Native apps that wear your brand
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-ivory/80">
              <QrCode size={16} className="text-gold" />
              Table QR that never leaves your house
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-ivory/80">
              <Store size={16} className="text-gold" />
              A storefront you actually own
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
