import Link from "next/link";
import { Mail } from "lucide-react";
import { Logo } from "@/components/logo";
import { KERALA_CITIES, SITE } from "@/lib/site";

export function Footer() {
  const loop = [...KERALA_CITIES, ...KERALA_CITIES];

  return (
    <footer className="border-t border-white/10 px-4 pt-10 pb-24 sm:px-6 sm:pb-8 lg:px-8">
      <div className="marquee mb-10">
        <div className="marquee-track gap-10 px-6 text-sm tracking-[0.22em] text-gold/70 uppercase">
          {loop.map((city, i) => (
            <span key={`${city}-${i}`} className="flex items-center gap-10">
              {city}
              <span aria-hidden="true">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-mist">
            Kerala’s original food-tech pioneer. India’s direct ordering
            platform for restaurants that want their customers back.
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-8 text-sm" aria-label="Footer">
          <div className="flex flex-col gap-2">
            <Link href="/#story" className="text-ivory/80 hover:text-ivory">
              Story
            </Link>
            <Link href="/#features" className="text-ivory/80 hover:text-ivory">
              Platform
            </Link>
            <Link href="/#pricing" className="text-ivory/80 hover:text-ivory">
              Pricing
            </Link>
            <Link href="/#waitlist" className="text-ivory/80 hover:text-ivory">
              Waitlist
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/terms/" className="text-ivory/80 hover:text-ivory">
              Terms
            </Link>
            <Link href="/privacy/" className="text-ivory/80 hover:text-ivory">
              Privacy Policy
            </Link>
            <a
              href={`mailto:${SITE.email}`}
              className="inline-flex items-center gap-2 text-ivory/80 hover:text-ivory"
            >
              <Mail size={14} /> {SITE.email}
            </a>
          </div>
        </nav>
        <div className="flex gap-3">
          <a
            href="https://www.instagram.com/"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-ivory/80 hover:text-ivory"
            aria-label="Fooody on Instagram"
          >
            <InstagramGlyph />
          </a>
          <a
            href="https://www.linkedin.com/"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-ivory/80 hover:text-ivory"
            aria-label="Fooody on LinkedIn"
          >
            <LinkedInGlyph />
          </a>
        </div>
      </div>

      <div className="kasavu-line mx-auto mt-10 max-w-7xl" />
      <p className="mx-auto mt-6 max-w-7xl text-center text-sm text-mist">
        Proudly Born in Kerala • Built for Restaurants Across India
      </p>
    </footer>
  );
}

function InstagramGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function LinkedInGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.5 9.5H4V20h2.5V9.5ZM5.25 4A1.75 1.75 0 1 0 5.26 7.5 1.75 1.75 0 0 0 5.25 4ZM20 20h-2.5v-5.6c0-1.77-.64-2.98-2.24-2.98-1.22 0-1.95.82-2.27 1.61-.12.28-.15.68-.15 1.07V20H10.4s.03-9.3 0-10.26H12.9v1.45c.33-.51 1.47-1.73 3.58-1.73 2.61 0 4.52 1.7 4.52 5.36V20Z" />
    </svg>
  );
}
