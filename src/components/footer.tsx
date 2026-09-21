import Link from "next/link";
import { Mail } from "lucide-react";
import { HashLink } from "@/components/hash-link";
import { Logo } from "@/components/logo";
import { PoweredBy } from "@/components/powered-by";
import { KERALA_CITIES, SITE } from "@/lib/site";

const PRODUCT_LINKS = [
  { href: "/", label: "Order food" },
  { href: "/baketree/", label: "BakeTree menu" },
  { href: "/our-story/", label: "Our Story" },
  { href: "/for-restaurants/", label: "For Restaurants" },
  { href: "/for-restaurants/#features", label: "Platform" },
  { href: "/for-restaurants/#pricing", label: "Pricing" },
  { href: "/for-restaurants/#waitlist", label: "Partner Support" },
] as const;

const COMPANY_LINKS = [
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
] as const;

const LEGAL_LINKS = [
  { href: "/terms/", label: "Terms of Use" },
  { href: "/privacy/", label: "Privacy Policy" },
  { href: "/cookies/", label: "Cookie Policy" },
  { href: "/disclaimer/", label: "Disclaimer" },
  { href: "/refunds/", label: "Refunds" },
] as const;

export function Footer() {
  const loop = [...KERALA_CITIES, ...KERALA_CITIES];

  return (
    <footer className="relative z-[2] border-t border-white/10 bg-[#0B0F17] px-4 pt-10 pb-24 text-ivory sm:px-6 sm:pb-8 lg:px-8">
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
          <Logo markId="footer" />
          <p className="mt-3 max-w-sm text-sm text-mist">
            Kerala’s original food-tech pioneer. India’s direct ordering
            platform for restaurants that want their customers back.
          </p>
        </div>
        <nav
          className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3"
          aria-label="Footer"
        >
          <FooterCol title="Product" links={PRODUCT_LINKS} hash />
          <FooterCol title="Company" links={COMPANY_LINKS} />
          <FooterCol title="Legal" links={LEGAL_LINKS} />
        </nav>
        <div className="flex flex-col items-start gap-4">
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
          <a
            href={`mailto:${SITE.email}`}
            className="inline-flex items-center gap-2 text-sm text-ivory/80 hover:text-ivory"
          >
            <Mail size={14} /> {SITE.email}
          </a>
        </div>
      </div>

      <div className="kasavu-line mx-auto mt-10 max-w-7xl" />
      <div className="mx-auto mt-6 flex max-w-7xl flex-col items-center gap-5">
        <p className="text-center text-sm text-mist">
          Pioneered in Kerala (2016) • Empowering Restaurant Direct Orders (2026)
        </p>
        <PoweredBy />
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
  hash = false,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
  hash?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="mb-1 text-xs tracking-[0.18em] text-gold uppercase">
        {title}
      </p>
      {links.map((link) =>
        hash ? (
          <HashLink
            key={link.href}
            href={link.href}
            className="text-ivory/80 hover:text-ivory"
          >
            {link.label}
          </HashLink>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            className="text-ivory/80 hover:text-ivory"
          >
            {link.label}
          </Link>
        ),
      )}
    </div>
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
