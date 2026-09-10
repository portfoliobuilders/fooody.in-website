"use client";

import Image from "next/image";
import { CATEGORIES, type CategoryId } from "@/lib/catalog";
import { useMenuFilter } from "@/components/menu-filter-context";

export function CategoryRail() {
  const { category, toggleCategory } = useMenuFilter();

  return (
    <section className="px-4 py-4 sm:px-6 lg:px-8" aria-labelledby="category-heading">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-rose-600 uppercase">
              EatSure-style shelf
            </p>
            <h2 id="category-heading" className="font-display mt-1 text-2xl font-extrabold text-slate-900">
              What are you craving?
            </h2>
          </div>
          {category !== "all" ? (
            <button
              type="button"
              className="text-sm font-semibold text-rose-600"
              onClick={() => toggleCategory(category)}
            >
              Clear
            </button>
          ) : null}
        </div>

        <div className="no-scrollbar mt-5 flex snap-x gap-5 overflow-x-auto pb-3">
          {CATEGORIES.map((item) => {
            const active = category === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className="w-[7.2rem] shrink-0 snap-start text-center"
                onClick={() => toggleCategory(item.id as CategoryId)}
              >
                <span
                  className={`block overflow-hidden rounded-[1.6rem] border-2 shadow-lg transition ${
                    active
                      ? "border-rose-500 ring-4 ring-rose-100"
                      : "border-white"
                  }`}
                >
                  <Image
                    src={item.image}
                    alt=""
                    width={280}
                    height={280}
                    className="h-[7.2rem] w-full object-cover"
                  />
                </span>
                <span className={`mt-2 block text-sm font-bold ${active ? "text-rose-600" : "text-slate-800"}`}>
                  {item.short}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
