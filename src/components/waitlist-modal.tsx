"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { WaitlistForm } from "@/components/waitlist-form";
import { useWaitlist } from "@/components/waitlist-context";

export function WaitlistModal() {
  const { isOpen, source, closeWaitlist } = useWaitlist();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeWaitlist();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    window.setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLElement>("input, select, button")
        ?.focus();
    }, 20);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeWaitlist]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center"
      role="presentation"
      onClick={closeWaitlist}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-title"
        className="card-lux relative z-[91] w-full max-w-lg p-6 sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10"
          onClick={closeWaitlist}
          aria-label="Close waitlist"
        >
          <X size={16} />
        </button>
        <h2 id="waitlist-title" className="font-display pr-10 text-2xl font-bold">
          Claim your direct channel
        </h2>
        <p className="mt-2 mb-6 text-sm text-mist">
          0% commission. 100% of your guests. We’ll confirm on WhatsApp.
        </p>
        <WaitlistForm idPrefix="modal" source={source} />
      </div>
    </div>,
    document.body,
  );
}
