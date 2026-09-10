import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { PageShell } from "@/components/page-shell";

export function LegalPage({
  kicker = "Legal",
  title,
  updated = "10 September 2026",
  children,
}: {
  kicker?: string;
  title: string;
  updated?: string | null;
  children: ReactNode;
}) {
  return (
    <PageShell variant="editorial">
      <Navbar />
      <main id="main" className="relative z-[2] mx-auto max-w-3xl px-4 py-28 sm:px-6">
        <p className="gold-text text-sm tracking-[0.2em] uppercase">{kicker}</p>
        <h1 className="font-display mt-3 text-4xl font-extrabold">{title}</h1>
        {updated ? (
          <p className="mt-2 text-sm text-mist">Last updated: {updated}</p>
        ) : null}
        <div className="prose-legal mt-8 space-y-5 text-ivory/80">{children}</div>
      </main>
      <Footer />
    </PageShell>
  );
}
