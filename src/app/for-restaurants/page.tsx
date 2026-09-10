import type { Metadata } from "next";
import { Audience } from "@/components/audience";
import { Calculator } from "@/components/calculator";
import { ClaimBanner } from "@/components/claim-banner";
import { Faq } from "@/components/faq";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { HashScroller } from "@/components/hash-scroller";
import { Hero } from "@/components/hero";
import { MobileCta } from "@/components/mobile-cta";
import { Navbar } from "@/components/navbar";
import { PageShell } from "@/components/page-shell";
import { Philosophy } from "@/components/philosophy";
import { Pricing } from "@/components/pricing";
import { WaitlistSection } from "@/components/waitlist-section";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "For Restaurants — Claim Your Direct Store",
  description:
    "QR dining, CRM, POS, WhatsApp stores, and in-house or 3PL fleets. Fooody is the 0% commission operating system for restaurants in India. Claim fooody.in/your-brand.",
  alternates: { canonical: "/for-restaurants/" },
  openGraph: {
    title: "For Restaurants · Fooody.in",
    description:
      "Launch a branded digital menu in minutes. 0% commission, 100% customer data, QR + POS + fleet.",
    url: `${SITE.url}/for-restaurants/`,
  },
};

export default function ForRestaurantsPage() {
  return (
    <PageShell variant="editorial">
      <HashScroller />
      <Navbar />
      <main id="main" className="relative z-[2] pb-24 sm:pb-0">
        <Hero />
        <div className="px-0">
          <ClaimBanner />
        </div>
        <Philosophy />
        <Calculator />
        <Features />
        <Audience />
        <Pricing />
        <WaitlistSection />
        <Faq />
      </main>
      <Footer />
      <MobileCta />
    </PageShell>
  );
}
