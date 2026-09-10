"use client";

import { useWaitlist } from "@/components/waitlist-context";

export function MobileCta() {
  const { openWaitlist } = useWaitlist();

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-white/10 bg-obsidian/90 p-3 backdrop-blur sm:hidden">
      <button
        type="button"
        className="btn-primary w-full"
        onClick={() => openWaitlist("mobile-sticky")}
      >
        Claim Your Direct Channel
      </button>
    </div>
  );
}
