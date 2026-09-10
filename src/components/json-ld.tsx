import { SITE } from "@/lib/site";

export function JsonLd() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      email: SITE.email,
      foundingDate: "2016",
      founder: {
        "@type": "Person",
        name: "Athul Anil",
      },
      description: SITE.description,
      areaServed: "IN",
      slogan: "₹0 platform fee. Real menu prices. Restaurants own their guests.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE.name,
      url: SITE.url,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE.url}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Fooody Direct Ordering Platform",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, iOS, Android, WhatsApp",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
        description: "0% commission per order. Transparent monthly subscription.",
      },
      description: SITE.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a direct ordering platform for restaurants?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A system that lets customers order through a restaurant’s own website, branded app, QR menus, and WhatsApp, with zero commission and full customer-data ownership.",
          },
        },
        {
          "@type": "Question",
          name: "Does Fooody charge aggregator commissions?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Fooody charges a transparent subscription and 0% per order. Restaurants keep their domain, CRM, and guest relationships.",
          },
        },
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
