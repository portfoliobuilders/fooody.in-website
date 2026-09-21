"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock3,
  Leaf,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Star,
  Store,
} from "lucide-react";
import { FoodCard } from "@/components/food-card";
import { useMenuFilter } from "@/components/menu-filter-context";
import {
  BAKETREE,
  BAKETREE_CATEGORIES,
  BAKETREE_DISHES,
  baketreeWhatsAppLink,
  type BaketreeCategoryId,
} from "@/lib/baketree";
import { formatINR } from "@/lib/format";

type VegFilter = "all" | "veg" | "nonveg";

export function BaketreeStore() {
  const { highlightId, focusDish } = useMenuFilter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<BaketreeCategoryId | "all">("all");
  const [veg, setVeg] = useState<VegFilter>("all");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash.startsWith("dish-")) return;
    const id = hash.slice("dish-".length);
    if (!BAKETREE_DISHES.some((dish) => dish.id === id)) return;
    const timer = window.setTimeout(() => focusDish(id), 120);
    return () => window.clearTimeout(timer);
  }, [focusDish]);

  const dishes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BAKETREE_DISHES.filter((dish) => {
      if (category !== "all" && dish.baketreeCategory !== category) return false;
      if (veg === "veg" && !dish.veg) return false;
      if (veg === "nonveg" && dish.veg) return false;
      if (q && !dish.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [category, query, veg]);

  const grouped = useMemo(() => {
    return BAKETREE_CATEGORIES.map((item) => ({
      ...item,
      items: dishes.filter((dish) => dish.baketreeCategory === item.id),
    })).filter((item) => item.items.length > 0);
  }, [dishes]);

  return (
    <>
      <section className="px-4 pt-5 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#143322]">
          <Image
            src={BAKETREE.cover}
            alt="Al Faham from BakeTree Resto Cafe"
            width={1400}
            height={700}
            priority
            className="h-56 w-full object-cover sm:h-72 lg:h-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1f16] via-[#0c1f16]/55 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
            <div className="flex items-end gap-4">
              <Image
                src={BAKETREE.logo}
                alt={`${BAKETREE.name} logo`}
                width={96}
                height={96}
                className="h-16 w-16 rounded-2xl bg-white object-contain p-1 shadow-lg sm:h-20 sm:w-20"
              />
              <div className="min-w-0 text-white">
                <p className="text-[0.7rem] font-bold tracking-[0.18em] text-[#E8D0A8] uppercase">
                  fooody.in/{BAKETREE.slug}
                </p>
                <h1 className="font-display mt-1 text-2xl font-extrabold sm:text-4xl">
                  {BAKETREE.name}
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-white/75">{BAKETREE.tagline}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoChip
            icon={<Star size={16} className="text-amber-500" fill="currentColor" />}
            label={`${BAKETREE.rating.toFixed(1)} kitchen rating`}
            hint="Direct menu prices"
          />
          <InfoChip
            icon={<MapPin size={16} className="text-rose-500" />}
            label={BAKETREE.address}
            hint={`${BAKETREE.distanceKm} km · ${BAKETREE.area}`}
          />
          <InfoChip
            icon={<Clock3 size={16} className="text-emerald-600" />}
            label={BAKETREE.hours}
            hint="Same-day kitchen prep"
          />
          <InfoChip
            icon={<Store size={16} className="text-slate-700" />}
            label={`${BAKETREE_DISHES.length} dishes`}
            hint={`${formatINR(Math.min(...BAKETREE_DISHES.map((d) => d.price)))} onwards`}
          />
        </div>
        <div className="mx-auto mt-4 flex max-w-7xl flex-wrap gap-2">
          <a href={`tel:+91${BAKETREE.phone}`} className="btn-primary py-2.5 text-sm">
            <Phone size={15} />
            Call {BAKETREE.phone}
          </a>
          <a
            href={baketreeWhatsAppLink()}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <MessageCircle size={15} />
            WhatsApp the kitchen
          </a>
          <Link href="/" className="btn-ghost py-2.5 text-sm text-slate-800">
            Back to Fooody marketplace
          </Link>
        </div>
      </section>

      <section id="menu" className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-rose-600 uppercase">
                Live BakeTree menu
              </p>
              <h2 className="font-display mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Order at the kitchen’s own prices
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              {dishes.length} item{dishes.length === 1 ? "" : "s"} · ₹0 platform fee
            </p>
          </div>

          <div className="relative mt-5">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search fried rice, shawarma, al faham, dosa..."
              aria-label="Search the BakeTree menu"
              className="h-12 w-full rounded-full border border-slate-200 bg-white pr-4 pl-11 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500/40"
            />
          </div>

          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
            <FilterChip
              active={veg === "all"}
              onClick={() => setVeg("all")}
              label="All"
            />
            <FilterChip
              active={veg === "veg"}
              onClick={() => setVeg("veg")}
              label="Veg"
              icon={<Leaf size={13} />}
            />
            <FilterChip
              active={veg === "nonveg"}
              onClick={() => setVeg("nonveg")}
              label="Non-veg"
            />
          </div>

          <div className="no-scrollbar mt-3 flex gap-5 overflow-x-auto pb-2">
            <button
              type="button"
              className="w-[6.6rem] shrink-0 text-center"
              onClick={() => setCategory("all")}
            >
              <span
                className={`flex h-[6.6rem] items-center justify-center rounded-[1.4rem] border-2 text-sm font-bold ${
                  category === "all"
                    ? "border-rose-500 bg-rose-50 text-rose-700 ring-4 ring-rose-100"
                    : "border-white bg-white text-slate-700 shadow"
                }`}
              >
                All
              </span>
              <span className="mt-2 block text-sm font-bold text-slate-800">Full menu</span>
            </button>
            {BAKETREE_CATEGORIES.map((item) => {
              const active = category === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className="w-[6.6rem] shrink-0 text-center"
                  onClick={() => setCategory(active ? "all" : item.id)}
                >
                  <span
                    className={`block overflow-hidden rounded-[1.4rem] border-2 shadow-lg ${
                      active ? "border-rose-500 ring-4 ring-rose-100" : "border-white"
                    }`}
                  >
                    <Image
                      src={item.image}
                      alt=""
                      width={280}
                      height={280}
                      className="h-[6.6rem] w-full object-cover"
                    />
                  </span>
                  <span
                    className={`mt-2 block text-sm font-bold ${
                      active ? "text-rose-600" : "text-slate-800"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {grouped.length === 0 ? (
            <div className="neo-card mt-8 p-10 text-center">
              <p className="font-display text-xl font-bold text-slate-900">
                No matches on this menu.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Clear search or show the full BakeTree board.
              </p>
              <button
                type="button"
                className="btn-primary mt-5"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setVeg("all");
                }}
              >
                Show full menu
              </button>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.id} id={`cat-${group.id}`} className="mt-10">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-extrabold text-slate-900">
                      {group.label}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">{group.blurb}</p>
                  </div>
                  <p className="text-xs font-semibold text-slate-400">
                    {group.items.length} item{group.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {group.items.map((dish) => (
                    <FoodCard
                      key={dish.id}
                      dish={dish}
                      highlight={highlightId === dish.id}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}

function InfoChip({
  icon,
  label,
  hint,
}: {
  icon: ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <div className="neo-card flex items-start gap-3 p-4">
      <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-bold text-slate-900">{label}</span>
        <span className="block text-xs text-slate-500">{hint}</span>
      </span>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-rose-300"
      }`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}
