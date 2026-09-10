import { CategoryRail } from "@/components/category-rail";
import { ClaimBanner } from "@/components/claim-banner";
import { ConsumerHeader } from "@/components/consumer-header";
import { Footer } from "@/components/footer";
import { MarketplaceBoot } from "@/components/hash-scroller";
import { JsonLd } from "@/components/json-ld";
import { MenuGrid } from "@/components/menu-grid";
import { PageShell } from "@/components/page-shell";
import { PromiseCards } from "@/components/promise-cards";
import { StoryTeaser } from "@/components/story-teaser";

export default function Home() {
  return (
    <PageShell variant="market">
      <JsonLd />
      <MarketplaceBoot />
      <ConsumerHeader />
      <main id="main" className="relative z-[2] pb-28">
        <h1 className="sr-only">
          Order food direct in Kochi on Fooody.in — ₹0 platform fee, ₹0 surge, real menu prices
        </h1>
        <ClaimBanner />
        <PromiseCards />
        <CategoryRail />
        <MenuGrid />
        <StoryTeaser />
      </main>
      <Footer />
    </PageShell>
  );
}
