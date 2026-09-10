import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-obsidian text-ivory">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <BrandMark />
          <p className="font-display text-xl font-extrabold">
            fooody<span className="text-flame">.</span>in
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="ghost">
            <Link href="/marketplace">Marketplace</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Partner login</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-20">
        <p className="text-xs tracking-[0.2em] text-gold uppercase">Restaurant partner OS</p>
        <h1 className="font-display mt-4 max-w-3xl text-5xl font-extrabold leading-tight">
          The operating dashboard for kitchens that own their orders.
        </h1>
        <p className="mt-4 max-w-2xl text-ivory/70">
          Live POS / KDS, menu &amp; 86-toggles, table QR, reservations, payouts, inventory, and ads — with a branded store at{" "}
          <span className="text-ivory">fooody.in/[your-slug]</span> and automatic marketplace listing.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/login">Open partner portal</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/malabar-kitchen">Demo storefront</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
