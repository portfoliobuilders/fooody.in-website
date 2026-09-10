import { Reveal } from "@/components/reveal";

const FAQS = [
  {
    q: "What is a direct ordering platform for restaurants?",
    a: "It lets guests order from your own website, branded app, QR menus, and WhatsApp — not a marketplace. You keep zero-commission economics and 100% of the customer data.",
  },
  {
    q: "Why are restaurants in India moving off aggregators in 2026?",
    a: "India’s online food delivery market is racing past $13 billion, but kitchens still lose 15–30% per order and nearly all repeat intelligence. Brands on direct channels see up to 40% higher repeat rates — and 65–70% of restaurant revenue already comes from guests who return.",
  },
  {
    q: "Does Fooody charge commission?",
    a: "No. Fooody is a transparent subscription with 0% per order, no hidden cuts, and no long-term lock-in. Cancel anytime. Your domain and user base stay yours.",
  },
  {
    q: "How fast can a restaurant go live?",
    a: "Most founding partners are designed to launch in 24 hours: branded web store, QR dine-in, and WhatsApp commerce first, then apps and POS as you scale.",
  },
] as const;

export function Faq() {
  return (
    <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <p className="gold-text font-display text-sm font-semibold tracking-[0.22em] uppercase">
            Restaurant questions
          </p>
          <h2 className="font-display mt-4 text-3xl font-extrabold sm:text-4xl">
            The shift from orders to ownership.
          </h2>
        </Reveal>
        <div className="mt-8 space-y-3">
          {FAQS.map((item, i) => (
            <Reveal key={item.q} delay={i * 60}>
              <details className="card-lux group p-5">
                <summary className="cursor-pointer list-none font-semibold marker:hidden">
                  {item.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ivory/70">
                  {item.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
