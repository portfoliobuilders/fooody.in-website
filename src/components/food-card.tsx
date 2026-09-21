"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock3, Star } from "lucide-react";
import type { Dish } from "@/lib/catalog";
import { QtyControl } from "@/components/qty-control";
import { formatINR } from "@/lib/format";

export function FoodCard({ dish, highlight = false }: { dish: Dish; highlight?: boolean }) {
  return (
    <article
      id={`dish-${dish.id}`}
      className={`food-card overflow-hidden ${highlight ? "is-hot" : ""}`}
    >
      <div className="relative">
        <Image
          src={dish.image}
          alt={`${dish.name} from ${dish.restaurant}`}
          width={800}
          height={560}
          className="h-44 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
        <span className="absolute top-3 left-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-[0.7rem] font-bold tracking-wide text-white uppercase">
          {dish.etaMin}-{dish.etaMax} MIN
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-[0.7rem] font-bold text-slate-700">
          {dish.distanceKm.toFixed(1)} km
        </span>
        {dish.badge ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[0.65rem] font-bold text-white">
            {dish.badge}
          </span>
        ) : null}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {dish.storeHref ? (
              <Link
                href={dish.storeHref}
                className="truncate text-sm font-semibold text-slate-500 hover:text-rose-600"
              >
                {dish.restaurant}
              </Link>
            ) : (
              <p className="truncate text-sm font-semibold text-slate-500">{dish.restaurant}</p>
            )}
            <h3 className="font-display mt-0.5 text-lg leading-snug font-bold text-slate-900">
              {dish.name}
            </h3>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-xs font-bold text-white">
            <Star size={11} fill="currentColor" />
            {dish.rating.toFixed(1)}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {dish.cuisine}
          {dish.veg ? " · Pure veg" : ""}
          {dish.freeDelivery ? " · ₹0 delivery" : ""}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-xl font-extrabold text-slate-900">
              {formatINR(dish.price)}
            </p>
            <p className="text-xs text-slate-400">
              <span className="line-through">{formatINR(dish.aggregatorPrice)}</span>
              {" "}on aggregators
            </p>
          </div>
          <QtyControl dish={dish} />
        </div>
        <p className="mt-3 inline-flex items-center gap-1 text-[0.7rem] font-medium text-slate-400">
          <Clock3 size={12} />
          Direct kitchen price. No platform fee.
        </p>
      </div>
    </article>
  );
}
