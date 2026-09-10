import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Fooody.in uses cookies and local browser storage.",
  alternates: { canonical: "/cookies/" },
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy">
      <p>
        Fooody.in is a static marketing site. We do not run advertising pixels
        or third-party tracking cookies on this page.
      </p>
      <p>
        We use essential browser storage (localStorage) only to remember if you
        already joined the waitlist on this device, so you are not asked to
        submit twice. That storage stays on your computer until you clear it.
      </p>
      <p>
        Your browser may also keep technical files (cached images, fonts, and
        scripts) so the site loads faster on a return visit. These are not used
        to identify you across other websites.
      </p>
      <p>
        If we later add optional analytics, we will update this page and, where
        required, ask before setting non-essential cookies.
      </p>
    </LegalPage>
  );
}
