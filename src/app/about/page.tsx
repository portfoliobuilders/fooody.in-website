import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { PORTFOLIX, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Fooody.in",
  description:
    "Fooody.in is Kerala’s original food-tech pioneer, returning in 2026 as a 0% commission direct ordering platform.",
  alternates: { canonical: "/about/" },
};

export default function AboutPage() {
  return (
    <LegalPage kicker="Company" title="About Fooody.in" updated={null}>
      <p>
        Fooody pioneered app-based food delivery in Kerala in 2016–2017 — before
        the national aggregators landed in Kochi and across the state. After a
        pause to learn from that era, Fooody returns in 2026 with a clearer
        mission: restaurants should own their customers, not rent them.
      </p>
      <p>
        Today Fooody.in is a direct ordering platform — branded websites, apps,
        QR dine-in menus, WhatsApp stores, and CRM — with 0% commission per
        order.
      </p>
      <p>
        This website is powered by{" "}
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
      <p>
        Talk to us:{" "}
        <a className="text-gold underline" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
      </p>
    </LegalPage>
  );
}
