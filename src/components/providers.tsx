"use client";

import { WaitlistProvider } from "@/components/waitlist-context";
import { WaitlistModal } from "@/components/waitlist-modal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WaitlistProvider>
      {children}
      <WaitlistModal />
    </WaitlistProvider>
  );
}
