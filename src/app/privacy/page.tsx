import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Fooody.in handles restaurant waitlist data and website analytics.",
  alternates: { canonical: "/privacy/" },
};

export default function PrivacyPage() {
  return (
    <PageShell variant="editorial">
      <Navbar />
      <main id="main" className="relative z-[2] mx-auto max-w-3xl px-4 py-28 sm:px-6">
        <p className="gold-text text-sm tracking-[0.2em] uppercase">Legal</p>
        <h1 className="font-display mt-3 text-4xl font-extrabold">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-mist">Last updated: 10 September 2026</p>
        <div className="mt-8 space-y-5 text-ivory/80">
          <p>
            Fooody.in collects waitlist information you submit: restaurant name,
            owner or manager name, WhatsApp number, city, restaurant type, and
            the page or button that referred you.
          </p>
          <p>
            We use this data only to contact you about Fooody onboarding, to
            remember your submission on this device (via localStorage), and —
            if a webhook is configured — to store the same fields in Fooody’s
            CRM. We do not sell restaurant contact lists to aggregators or ad
            networks.
          </p>
          <p>
            Legal basis: your consent when you submit the form, and our
            legitimate interest in responding to business enquiries. You may
            ask us to delete your waitlist entry by emailing{" "}
            <a className="text-gold underline" href="mailto:hello@fooody.in">
              hello@fooody.in
            </a>
            .
          </p>
          <p>
            The site is statically hosted. Hosting providers and optional form
            webhooks may process data in India or another region you configure.
            Do not submit sensitive personal data (passwords, payment cards, or
            Aadhaar) through this form.
          </p>
          <p>
            Essential localStorage is used to prevent duplicate waitlist
            submissions on the same browser. You can clear it anytime in your
            browser settings.
          </p>
        </div>
      </main>
      <Footer />
    </PageShell>
  );
}
