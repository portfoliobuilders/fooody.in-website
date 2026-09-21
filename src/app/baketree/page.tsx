import type { Metadata } from "next";
import { BaketreeStore } from "@/components/baketree-store";
import { ConsumerHeader } from "@/components/consumer-header";
import { Footer } from "@/components/footer";
import { PageShell } from "@/components/page-shell";
import { BAKETREE, BAKETREE_DISHES } from "@/lib/baketree";
import { SITE } from "@/lib/site";

const title = `${BAKETREE.name} — Order Direct in ${BAKETREE.area}`;
const description = `Order from ${BAKETREE.name} at fooody.in/baketree. ${BAKETREE.tagline} Real menu prices, ₹0 platform fee. Call ${BAKETREE.phone}.`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "BakeTree Kochi",
    "BakeTree Palarivattom menu",
    "order al faham Kochi",
    "shawarma Palarivattom",
    "fooody.in/baketree",
  ],
  alternates: { canonical: "/baketree/" },
  openGraph: {
    title: `${title} · Fooody.in`,
    description,
    url: `${SITE.url}/baketree/`,
    images: [
      {
        url: BAKETREE.cover,
        width: 900,
        height: 600,
        alt: `${BAKETREE.name} Al Faham`,
      },
    ],
  },
};

export default function BaketreePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: BAKETREE.name,
    url: `${SITE.url}/baketree/`,
    image: `${SITE.url}${BAKETREE.cover}`,
    telephone: `+91${BAKETREE.phone}`,
    email: BAKETREE.email,
    servesCuisine: BAKETREE.cuisine,
    address: {
      "@type": "PostalAddress",
      streetAddress: BAKETREE.address,
      addressLocality: BAKETREE.city,
      addressRegion: "Kerala",
      addressCountry: "IN",
    },
    areaServed: BAKETREE.area,
    menu: `${SITE.url}/baketree/`,
    acceptsReservations: "False",
    hasMenu: {
      "@type": "Menu",
      hasMenuSection: [
        {
          "@type": "MenuSection",
          name: "BakeTree menu",
          hasMenuItem: BAKETREE_DISHES.slice(0, 20).map((dish) => ({
            "@type": "MenuItem",
            name: dish.name,
            offers: {
              "@type": "Offer",
              price: dish.price,
              priceCurrency: "INR",
            },
          })),
        },
      ],
    },
  };

  return (
    <PageShell variant="market">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ConsumerHeader />
      <main id="main" className="relative z-[2] pb-28">
        <BaketreeStore />
      </main>
      <Footer />
    </PageShell>
  );
}
