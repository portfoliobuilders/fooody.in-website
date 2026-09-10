import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { marketplaceBoost } from "@/lib/db/promotions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BrandMark } from "@/components/brand-mark";

export default async function MarketplacePage() {
  const restaurants = await prisma.restaurant.findMany({
    where: { listedOnMarketplace: true },
    include: {
      items: { where: { listedOnMarketplace: true, inStock: true }, take: 2 },
      campaigns: { where: { status: "ACTIVE" } },
    },
  });
  const ranked = restaurants
    .map((r) => {
      const campaign = r.campaigns[0];
      const boost = campaign ? marketplaceBoost(campaign.spentTodayPaise, campaign.dailyBudgetPaise) : 0;
      return { ...r, boost, score: r.rating * 20 + boost };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-[#f7f3eb]">
      <header className="bg-obsidian px-4 py-4 text-ivory">
        <div className="mx-auto flex max-w-5xl items-center gap-2">
          <BrandMark />
          <p className="font-display text-xl font-extrabold">
            fooody<span className="text-flame">.</span>in marketplace
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <h1 className="font-display text-4xl font-extrabold">Order from kitchens that own their guests.</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {ranked.map((r) => (
            <Link key={r.id} href={`/${r.slug}`}>
              <Card>
                <CardContent className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-display text-xl font-bold">{r.name}</p>
                      <p className="text-sm text-mist">
                        {r.area}, {r.city} · {r.prepTimeMins} min
                      </p>
                    </div>
                    {r.boost > 0 && <Badge tone="gold">Sponsored</Badge>}
                  </div>
                  <p className="text-sm">{r.tagline}</p>
                  <p className="text-xs text-mist">
                    {r.items.map((i) => i.title).join(" · ")} · {r.rating}★
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
