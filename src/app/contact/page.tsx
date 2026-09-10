import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { PORTFOLIX, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Fooody.in for restaurant onboarding and waitlist help.",
  alternates: { canonical: "/contact/" },
};

export default function ContactPage() {
  return (
    <LegalPage kicker="Company" title="Contact" updated={null}>
      <p>
        For founding-partner waitlist, onboarding, or press, write to us on
        email. We typically reply on WhatsApp after you join the waitlist.
      </p>
      <p>
        Email:{" "}
        <a className="text-gold underline" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
      </p>
      <p>
        Website:{" "}
        <a className="text-gold underline" href={SITE.url}>
          {SITE.url}
        </a>
      </p>
      <p>
        Website engineered by{" "}
        <a
          className="text-gold underline"
          href={PORTFOLIX.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {PORTFOLIX.name}
        </a>
        .
      </p>
    </LegalPage>
  );
}
