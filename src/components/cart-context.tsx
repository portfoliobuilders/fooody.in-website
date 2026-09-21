"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  findDish,
  PACKAGING_MARKUP_PER_ITEM,
  PLATFORM_FEE_PER_ITEM,
  type Dish,
} from "@/lib/catalog";

const STORAGE_KEY = "fooody_cart_v1";
const cartListeners = new Set<() => void>();

export type CartLine = {
  dish: Dish;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  aggregatorSubtotal: number;
  saved: number;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  qtyFor: (id: string) => number;
  add: (dish: Dish) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function subscribeCart(listener: () => void) {
  cartListeners.add(listener);
  return () => cartListeners.delete(listener);
}

function getCartSnapshot() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? "{}";
  } catch {
    return "{}";
  }
}

function getCartServerSnapshot() {
  return "{}";
}

function parseCart(raw: string): Record<string, number> {
  try {
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredCart(qtyById: Record<string, number>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(qtyById));
  } catch {
    /* private mode */
  }
  cartListeners.forEach((listener) => listener());
}

export function CartProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getCartServerSnapshot,
  );
  const qtyById = useMemo(() => parseCart(raw), [raw]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mutate = useCallback(
    (updater: (prev: Record<string, number>) => Record<string, number>) => {
      writeStoredCart(updater(qtyById));
    },
    [qtyById],
  );

  const add = useCallback(
    (dish: Dish) => {
      mutate((prev) => ({ ...prev, [dish.id]: (prev[dish.id] ?? 0) + 1 }));
    },
    [mutate],
  );

  const inc = useCallback(
    (id: string) => {
      mutate((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    },
    [mutate],
  );

  const dec = useCallback(
    (id: string) => {
      mutate((prev) => {
        const current = prev[id] ?? 0;
        if (current <= 1) {
          const next = { ...prev };
          delete next[id];
          return next;
        }
        return { ...prev, [id]: current - 1 };
      });
    },
    [mutate],
  );

  const clear = useCallback(() => {
    mutate(() => ({}));
    setDrawerOpen(false);
  }, [mutate]);

  const qtyFor = useCallback((id: string) => qtyById[id] ?? 0, [qtyById]);

  const value = useMemo(() => {
    const lines = Object.entries(qtyById)
      .map(([id, qty]) => {
        const dish = findDish(id);
        if (!dish || qty < 1) return null;
        return { dish, qty };
      })
      .filter((line): line is CartLine => Boolean(line));

    const itemCount = lines.reduce((sum, line) => sum + line.qty, 0);
    const subtotal = lines.reduce((sum, line) => sum + line.dish.price * line.qty, 0);
    const aggregatorSubtotal = lines.reduce(
      (sum, line) => sum + line.dish.aggregatorPrice * line.qty,
      0,
    );
    const saved =
      aggregatorSubtotal -
      subtotal +
      itemCount * (PLATFORM_FEE_PER_ITEM + PACKAGING_MARKUP_PER_ITEM);

    return {
      lines,
      itemCount,
      subtotal,
      aggregatorSubtotal,
      saved,
      drawerOpen,
      setDrawerOpen,
      qtyFor,
      add,
      inc,
      dec,
      clear,
    };
  }, [add, clear, dec, drawerOpen, inc, qtyById, qtyFor]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
