import { Audience } from "@/components/audience";
import { Calculator } from "@/components/calculator";
import { Faq } from "@/components/faq";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { JsonLd } from "@/components/json-ld";
import { Manifesto } from "@/components/manifesto";
import { MobileCta } from "@/components/mobile-cta";
import { Navbar } from "@/components/navbar";
import { OriginStory } from "@/components/origin-story";
import { Philosophy } from "@/components/philosophy";
import { Pricing } from "@/components/pricing";
import { WaitlistSection } from "@/components/waitlist-section";

export default function Home() {
  return (
    <>
      <JsonLd />
      <Navbar />
      <main id="main" className="relative z-[2] pb-24 sm:pb-0">
        <Hero />
        <Philosophy />
        <OriginStory />
        <Calculator />
        <Features />
        <Audience />
        <Manifesto />
        <Pricing />
        <WaitlistSection />
        <Faq />
      </main>
      <Footer />
      <MobileCta />
    </>
  );
}
