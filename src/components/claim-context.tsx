"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { slugify } from "@/lib/claim";

type ClaimContextValue = {
  isOpen: boolean;
  slug: string;
  openClaim: (slug?: string) => void;
  closeClaim: () => void;
};

const ClaimContext = createContext<ClaimContextValue | null>(null);

export function ClaimProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [slug, setSlug] = useState("");

  const openClaim = useCallback((nextSlug = "") => {
    setSlug(slugify(nextSlug));
    setIsOpen(true);
  }, []);

  const closeClaim = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({ isOpen, slug, openClaim, closeClaim }),
    [isOpen, slug, openClaim, closeClaim],
  );

  return <ClaimContext.Provider value={value}>{children}</ClaimContext.Provider>;
}

export function useClaim() {
  const ctx = useContext(ClaimContext);
  if (!ctx) {
    throw new Error("useClaim must be used within ClaimProvider");
  }
  return ctx;
}
