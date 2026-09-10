"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, MapPin, Search, ShoppingBag, Store } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { HashLink } from "@/components/hash-link";
import { Logo } from "@/components/logo";
import { useLocation } from "@/components/location-context";
import { useMenuFilter } from "@/components/menu-filter-context";
import {
  LOCATIONS,
  SEARCH_SUGGESTIONS,
  searchCatalog,
  type CategoryId,
} from "@/lib/catalog";

export function ConsumerHeader() {
  const { location, locationId, setLocationId } = useLocation();
  const { itemCount, setDrawerOpen } = useCart();
  const { setQuery, setCategory, focusDish } = useMenuFilter();
  const [scrolled, setScrolled] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const locRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchId = useId();
  const suggestions = useMemo(() => searchCatalog(draft), [draft]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (locRef.current && !locRef.current.contains(event.target as Node)) {
        setLocOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  function applySearch(next: string) {
    setDraft(next);
    setQuery(next);
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
    setSearchOpen(false);
  }

  return (
    <header className={`consumer-header sticky top-0 z-[80] ${scrolled ? "is-scrolled" : ""}`}>
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 px-4 py-1.5 text-[0.7rem] font-semibold tracking-wide text-white sm:px-6 lg:px-8">
        <p className="truncate">
          The Fooody Promise: ₹0 Platform Fee • ₹0 Surge Pricing • Real Menu Prices
        </p>
        <HashLink
          href="/#claim"
          className="hidden shrink-0 items-center gap-1 rounded-full bg-white/15 px-3 py-1 hover:bg-white/25 sm:inline-flex"
        >
          Claim fooody.in/your-brand
        </HashLink>
      </div>

      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 lg:flex-nowrap lg:px-8">
          <Logo markId="consumer-nav" className="order-1" />

          <div className="relative order-2 min-w-0 flex-1 lg:max-w-[15rem] lg:flex-none" ref={locRef}>
            <button
              type="button"
              className="inline-flex w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-left text-ivory lg:max-w-[15rem]"
              aria-expanded={locOpen}
              aria-haspopup="listbox"
              onClick={() => setLocOpen((v) => !v)}
            >
              <MapPin size={16} className="shrink-0 text-rose-400" />
              <span className="min-w-0">
                <span className="hidden text-[0.7rem] text-ivory/50 sm:block">Delivering to</span>
                <span className="block truncate text-sm font-semibold">{location.label}</span>
              </span>
              <ChevronDown size={14} className="ml-auto shrink-0 text-ivory/50" />
            </button>
            {locOpen ? (
              <LocationMenu
                locationId={locationId}
                onPick={(id) => {
                  setLocationId(id);
                  setLocOpen(false);
                }}
              />
            ) : null}
          </div>

          <HashLink
            href="/#claim"
            className="order-3 inline-flex shrink-0 items-center gap-2 rounded-full border border-rose-400/40 px-3 py-2 text-xs font-semibold text-ivory hover:bg-white/5 sm:text-sm lg:order-4"
          >
            <Store size={15} className="hidden text-rose-400 sm:block" />
            <span className="sm:hidden">Claim</span>
            <span className="hidden sm:inline xl:hidden">Claim Store</span>
            <span className="hidden xl:inline">For Restaurants: Claim Store</span>
          </HashLink>

          <button
            type="button"
            className="order-4 inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-lg shadow-rose-900/20 lg:order-5"
            onClick={() => setDrawerOpen(true)}
          >
            <ShoppingBag size={16} className="text-rose-600" />
            <span>{itemCount} items</span>
          </button>

        <div className="relative order-5 min-w-0 w-full flex-1 lg:order-3" ref={searchRef}>
          <label htmlFor={searchId} className="sr-only">
            Search dishes and restaurants
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            id={searchId}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applySearch(draft);
              }
              if (event.key === "Escape") setSearchOpen(false);
            }}
            placeholder="Search for biryani, burgers, cafes, or dishes..."
            className="h-12 w-full rounded-full border border-white/10 bg-white pr-4 pl-11 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500/40"
          />
          {searchOpen ? (
            <SearchMenu
              draft={draft}
              suggestions={suggestions}
              onCategory={(id) => {
                setCategory(id);
                setDraft("");
                setQuery("");
                setSearchOpen(false);
                document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
              }}
              onDish={(id) => {
                setCategory("all");
                setDraft("");
                setQuery("");
                setSearchOpen(false);
                focusDish(id);
              }}
              onHint={applySearch}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}

function LocationMenu({
  locationId,
  onPick,
}: {
  locationId: string;
  onPick: (id: (typeof LOCATIONS)[number]["id"]) => void;
}) {
  return (
    <ul
      role="listbox"
      className="absolute top-[calc(100%+0.5rem)] left-0 z-[90] w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#121826] p-2 shadow-2xl"
    >
      {LOCATIONS.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            role="option"
            aria-selected={item.id === locationId}
            className={`flex w-full flex-col rounded-xl px-3 py-2.5 text-left ${
              item.id === locationId ? "bg-white/10" : "hover:bg-white/5"
            }`}
            onClick={() => onPick(item.id)}
          >
            <span className="text-sm font-semibold text-ivory">{item.label}</span>
            <span className="text-xs text-ivory/50">{item.hint}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function SearchMenu({
  draft,
  suggestions,
  onCategory,
  onDish,
  onHint,
}: {
  draft: string;
  suggestions: ReturnType<typeof searchCatalog>;
  onCategory: (id: CategoryId) => void;
  onDish: (id: string) => void;
  onHint: (value: string) => void;
}) {
  return (
    <div className="absolute top-[calc(100%+0.45rem)] right-0 left-0 z-[90] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      {suggestions.length > 0 ? (
        <ul className="p-2">
          {suggestions.map((item) => (
            <li key={`${item.type}-${item.id}`}>
              <button
                type="button"
                className="flex w-full flex-col rounded-xl px-3 py-2.5 text-left hover:bg-rose-50"
                onClick={() =>
                  item.type === "category" ? onCategory(item.id) : onDish(item.id)
                }
              >
                <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                <span className="text-xs text-slate-500">{item.subtitle}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-3">
          <p className="px-1 text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
            Try searching
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SEARCH_SUGGESTIONS.map((hint) => (
              <button
                key={hint}
                type="button"
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700"
                onClick={() => onHint(hint)}
              >
                {hint}
              </button>
            ))}
          </div>
          {draft ? (
            <p className="mt-3 px-1 text-xs text-slate-500">
              No exact matches yet — showing live menu instead.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
