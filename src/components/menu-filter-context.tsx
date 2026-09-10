"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CategoryId, FilterId } from "@/lib/catalog";

type MenuFilterContextValue = {
  category: CategoryId | "all";
  filter: FilterId;
  query: string;
  highlightId: string | null;
  setCategory: (id: CategoryId | "all") => void;
  toggleCategory: (id: CategoryId | "all") => void;
  setFilter: (id: FilterId) => void;
  setQuery: (query: string) => void;
  focusDish: (id: string) => void;
};

const MenuFilterContext = createContext<MenuFilterContextValue | null>(null);

export function MenuFilterProvider({ children }: { children: ReactNode }) {
  const [category, setCategoryState] = useState<CategoryId | "all">("all");
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const setCategory = useCallback((id: CategoryId | "all") => {
    setCategoryState(id);
  }, []);

  const toggleCategory = useCallback((id: CategoryId | "all") => {
    setCategoryState((prev) => (prev === id ? "all" : id));
  }, []);

  const focusDish = useCallback((id: string) => {
    setHighlightId(id);
    window.setTimeout(() => {
      document.getElementById(`dish-${id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);
    window.setTimeout(() => setHighlightId(null), 1600);
  }, []);

  const value = useMemo(
    () => ({
      category,
      filter,
      query,
      highlightId,
      setCategory,
      toggleCategory,
      setFilter,
      setQuery,
      focusDish,
    }),
    [category, filter, query, highlightId, setCategory, toggleCategory, focusDish],
  );

  return (
    <MenuFilterContext.Provider value={value}>{children}</MenuFilterContext.Provider>
  );
}

export function useMenuFilter() {
  const ctx = useContext(MenuFilterContext);
  if (!ctx) {
    throw new Error("useMenuFilter must be used within MenuFilterProvider");
  }
  return ctx;
}
