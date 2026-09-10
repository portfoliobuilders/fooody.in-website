import { Package, ShieldOff, UmbrellaOff } from "lucide-react";

const PROMISES = [
  {
    title: "No Platform Fees",
    copy: "Order on Fooody without a single rupee of hidden convenience charges.",
    icon: ShieldOff,
    wash: "from-rose-100 to-white",
  },
  {
    title: "No Surge Charges",
    copy: "Your price holds firm, even during peak dinner rush or heavy rain.",
    icon: UmbrellaOff,
    wash: "from-orange-100 to-white",
  },
  {
    title: "No Packaging Markups",
    copy: "Honest, genuine menu prices set directly by the kitchen.",
    icon: Package,
    wash: "from-emerald-100 to-white",
  },
] as const;

export function PromiseCards() {
  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8" aria-labelledby="promise-heading">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold tracking-[0.2em] text-rose-600 uppercase">
          Why Kochi orders direct
        </p>
        <h2 id="promise-heading" className="font-display mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          The Fooody Promise
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PROMISES.map((item) => (
            <article
              key={item.title}
              className={`promise-card bg-gradient-to-br ${item.wash} p-6`}
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-md shadow-rose-100">
                <item.icon className="text-rose-600" size={20} />
              </div>
              <h3 className="font-display mt-4 text-xl font-bold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
