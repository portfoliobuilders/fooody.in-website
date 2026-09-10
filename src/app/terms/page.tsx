import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms for using Fooody.in’s website and founding restaurant waitlist.",
  alternates: { canonical: "/terms/" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use">
      <p>
        Fooody.in (“Fooody”, “we”) provides information about our direct
        ordering platform and collects early-access waitlist requests from
        restaurants in India.
      </p>
      <p>
        Submitting the waitlist form is an enquiry, not a binding commercial
        contract. Founding pricing, onboarding, and subscription terms are
        confirmed in writing before any paid service begins. There are no
        long-term lock-ins advertised on this site — cancel-anytime
        subscriptions apply only after a restaurant signs an order form.
      </p>
      <p>
        You must provide accurate restaurant and contact details and have
        authority to represent the business named. Do not submit another
        person’s WhatsApp number without their permission.
      </p>
      <p>
        All Fooody names, the flame mark, copy, and site design are owned by
        Fooody or its licensors. You may not scrape, republish, or impersonate
        the brand.
      </p>
      <p>
        This website is provided as-is for informational purposes. Kerala
        origin-story dates are presented in good faith from Fooody’s founding
        history.
      </p>
      <p>
        These terms are governed by the laws of India. Courts in Ernakulam,
        Kerala have jurisdiction, without affecting any non-waivable consumer
        or MSME protections that may apply.
      </p>
      <p>
        Questions:{" "}
        <a className="text-gold underline" href="mailto:hello@fooody.in">
          hello@fooody.in
        </a>
      </p>
    </LegalPage>
  );
}
