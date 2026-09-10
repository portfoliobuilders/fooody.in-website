import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Informational disclaimer for the Fooody.in website.",
  alternates: { canonical: "/disclaimer/" },
};

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer">
      <p>
        Content on Fooody.in is for general information about our direct
        ordering platform and founding waitlist. It is not a prospectus, not
        investment advice, and not a binding offer of software until a written
        order form is signed.
      </p>
      <p>
        Savings calculator figures are illustrations using a 25% average
        aggregator commission. Actual commissions, order volumes, and savings
        vary by restaurant and marketplace.
      </p>
      <p>
        Historical dates about Fooody’s 2016–2018 Kerala operations are shared
        in good faith from the founding team’s record. Third-party brand names
        (for example Swiggy or Zomato) are used only to describe market
        timeline and are not affiliated with Fooody.
      </p>
      <p>
        We try to keep this site accurate, but we do not warrant that every
        feature, price, or go-live time will match a future product build.
      </p>
    </LegalPage>
  );
}
