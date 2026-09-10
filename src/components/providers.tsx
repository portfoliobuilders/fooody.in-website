"use client";

import { CartProvider } from "@/components/cart-context";
import { CartUI } from "@/components/cart-ui";
import { ClaimProvider } from "@/components/claim-context";
import { ClaimModal } from "@/components/claim-modal";
import { LocationProvider } from "@/components/location-context";
import { MenuFilterProvider } from "@/components/menu-filter-context";
import { WaitlistProvider } from "@/components/waitlist-context";
import { WaitlistModal } from "@/components/waitlist-modal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocationProvider>
      <CartProvider>
        <MenuFilterProvider>
          <WaitlistProvider>
            <ClaimProvider>
              {children}
              <WaitlistModal />
              <ClaimModal />
              <CartUI />
            </ClaimProvider>
          </WaitlistProvider>
        </MenuFilterProvider>
      </CartProvider>
    </LocationProvider>
  );
}
