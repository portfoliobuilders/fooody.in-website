"use client";

import { Minus, Plus } from "lucide-react";
import type { Dish } from "@/lib/catalog";
import { useCart } from "@/components/cart-context";

export function QtyControl({
  dish,
  compact = false,
}: {
  dish: Dish;
  compact?: boolean;
}) {
  const { qtyFor, add, inc, dec } = useCart();
  const qty = qtyFor(dish.id);

  if (qty < 1) {
    return (
      <button
        type="button"
        className="add-btn"
        onClick={() => add(dish)}
        aria-label={`Add ${dish.name} to cart`}
      >
        ADD
        <Plus size={14} strokeWidth={2.6} />
      </button>
    );
  }

  return (
    <div className={`qty-stepper ${compact ? "scale-95" : ""}`}>
      <button type="button" onClick={() => dec(dish.id)} aria-label="Remove one">
        <Minus size={12} strokeWidth={3} />
      </button>
      <span className="min-w-[1.1rem] text-center text-sm font-extrabold text-rose-600">
        {qty}
      </span>
      <button type="button" onClick={() => inc(dish.id)} aria-label="Add one">
        <Plus size={12} strokeWidth={3} />
      </button>
    </div>
  );
}
