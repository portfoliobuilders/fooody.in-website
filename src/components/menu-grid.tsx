"use client";

import { DISHES, FILTERS, filterDishes } from "@/lib/catalog";
import { FoodCard } from "@/components/food-card";
import { useMenuFilter } from "@/components/menu-filter-context";
import { useLocation } from "@/components/location-context";

export function MenuGrid() {
  const { category, filter, query, setFilter, setCategory, setQuery, highlightId } = useMenuFilter();
  const { location } = useLocation();
  const dishes = filterDishes(DISHES, { category, filter, query });

  return (
    <section id="menu" className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-rose-600 uppercase">
              Direct from {location.label}
            </p>
            <h2 className="font-display mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Kitchens you can order from now
            </h2>
          </div>
          <p className="text-sm text-slate-500">{dishes.length} dishes · real menu prices</p>
        </div>

        <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((item) => {
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-rose-300"
                }`}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {dishes.length === 0 ? (
          <div className="neo-card mt-8 p-10 text-center">
            <p className="font-display text-xl font-bold text-slate-900">No matches in this filter.</p>
            <p className="mt-2 text-sm text-slate-500">
              Clear search or tap All to see the full Kochi board.
            </p>
            <button
              type="button"
              className="btn-primary mt-5"
              onClick={() => {
                setFilter("all");
                setCategory("all");
                setQuery("");
              }}
            >
              Show all dishes
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {dishes.map((dish) => (
              <FoodCard key={dish.id} dish={dish} highlight={highlightId === dish.id} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
