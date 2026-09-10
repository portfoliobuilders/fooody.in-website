"use client";

import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { HashLink } from "@/components/hash-link";
import { Logo } from "@/components/logo";
import { useWaitlist } from "@/components/waitlist-context";
import { NAV_LINKS } from "@/lib/site";

export function Navbar() {
  const { openWaitlist } = useWaitlist();
  const { itemCount, setDrawerOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`glass-nav fixed inset-x-0 top-0 z-[80] ${scrolled ? "is-scrolled" : ""}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Logo markId="editorial-nav" />
          <span className="pill hidden xl:inline-flex">
            Pioneering Kerala Food Tech Since 2016
          </span>
        </div>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <HashLink
              key={link.href}
              href={link.href}
              className="text-[0.82rem] font-medium tracking-wide text-ivory/70 transition-colors hover:text-ivory"
            >
              {link.label}
            </HashLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm font-semibold text-ivory"
            onClick={() => setDrawerOpen(true)}
          >
            <ShoppingBag size={16} />
            {itemCount}
          </button>
          <button
            type="button"
            className="btn-primary hidden px-4 py-2.5 text-sm lg:inline-flex"
            onClick={() => openWaitlist("nav")}
          >
            Claim Your Direct Channel
          </button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-obsidian/95 px-4 py-5 lg:hidden">
          <nav className="flex flex-col gap-3" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <HashLink
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-3 text-ivory/85 hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </HashLink>
            ))}
            <button
              type="button"
              className="btn-primary mt-2"
              onClick={() => {
                setOpen(false);
                openWaitlist("mobile-nav");
              }}
            >
              Claim Your Direct Channel
            </button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
