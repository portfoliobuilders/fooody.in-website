"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { QtyControl } from "@/components/qty-control";
import { formatINR } from "@/lib/format";

export function CartUI() {
  const { itemCount, subtotal, saved, drawerOpen, setDrawerOpen } = useCart();
  const snack = itemCount > 0 && !drawerOpen;

  return (
    <>
      {snack ? (
        <button
          type="button"
          className="cart-snack fixed inset-x-4 bottom-4 z-[70] mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-left text-white shadow-2xl sm:bottom-6"
          onClick={() => setDrawerOpen(true)}
        >
          <span className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-600">
              <ShoppingBag size={18} />
            </span>
            <span>
              <span className="block text-sm font-bold">
                {itemCount} item{itemCount === 1 ? "" : "s"} · {formatINR(subtotal)}
              </span>
              <span className="block text-xs text-emerald-300">
                You saved {formatINR(saved)} in platform fees & commissions
              </span>
            </span>
          </span>
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-rose-600">
            VIEW CART
          </span>
        </button>
      ) : null}
      {drawerOpen ? <CartDrawer /> : null}
    </>
  );
}

function CartDrawer() {
  const {
    itemCount,
    lines,
    subtotal,
    saved,
    setDrawerOpen,
    clear,
  } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [setDrawerOpen]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-[90]"
      role="presentation"
      onClick={() => setDrawerOpen(false)}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white text-slate-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="cart-title" className="font-display text-xl font-extrabold">
              Your Fooody bag
            </h2>
            <p className="text-xs text-slate-500">Direct from the kitchen · ₹0 platform fee</p>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close cart"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {checkingOut ? (
            <div className="rounded-2xl bg-emerald-50 p-5" role="status">
              <CheckCircle2 className="text-emerald-600" />
              <p className="font-display mt-3 text-2xl font-bold">Order ticket sent.</p>
              <p className="mt-2 text-sm text-slate-600">
                The kitchen received your direct order. No platform fee, no surge,
                no packaging markup.
              </p>
              <button
                type="button"
                className="btn-primary mt-5"
                onClick={() => {
                  clear();
                }}
              >
                Start another order
              </button>
            </div>
          ) : itemCount === 0 ? (
            <p className="text-sm text-slate-500">Your bag is empty. Add a dish to start a direct order.</p>
          ) : (
            lines.map((line) => (
              <div
                key={line.dish.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{line.dish.name}</p>
                  <p className="text-xs text-slate-500">{line.dish.restaurant}</p>
                  <p className="mt-1 text-sm font-bold">
                    {formatINR(line.dish.price * line.qty)}
                  </p>
                </div>
                <QtyControl dish={line.dish} compact />
              </div>
            ))
          )}
        </div>

        {!checkingOut && itemCount > 0 ? (
          <div className="border-t border-slate-100 p-5">
            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              You saved {formatINR(saved)} in platform fees & commissions by
              ordering direct on Fooody!
            </p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-display text-xl font-extrabold">
                {formatINR(subtotal)}
              </span>
            </div>
            <button
              type="button"
              className="btn-primary mt-4 w-full"
              onClick={() => setCheckingOut(true)}
            >
              Checkout · {formatINR(subtotal)}
            </button>
          </div>
        ) : null}
      </aside>
    </div>,
    document.body,
  );
}
