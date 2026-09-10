import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Refunds & Cancellation",
  description:
    "Refund and cancellation information for Fooody.in’s waitlist and future subscriptions.",
  alternates: { canonical: "/refunds/" },
};

export default function RefundsPage() {
  return (
    <LegalPage title="Refunds & Cancellation">
      <p>
        Joining the Fooody.in waitlist is free. This website does not collect
        card payments, UPI, or subscription fees. There is nothing to refund
        for a waitlist enquiry.
      </p>
      <p>
        If you later buy a Fooody subscription, pricing, billing cycle, and
        cancel-anytime terms will be stated on the order form. Those commercial
        terms — not this marketing page — govern refunds for paid plans.
      </p>
      <p>
        You may ask us to remove your waitlist details at any time by emailing{" "}
        <a className="text-gold underline" href="mailto:hello@fooody.in">
          hello@fooody.in
        </a>
        .
      </p>
    </LegalPage>
  );
}
