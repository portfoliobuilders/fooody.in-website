import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { marketplaceBoost } from "@/lib/db/promotions";
import { jsonError } from "@/lib/auth/rbac";

export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { listedOnMarketplace: true },
      include: {
        items: { where: { listedOnMarketplace: true, inStock: true }, take: 3 },
        campaigns: { where: { status: "ACTIVE" } },
      },
    });
    const ranked = restaurants
      .map((r) => {
        const campaign = r.campaigns[0];
        const boost = campaign
          ? marketplaceBoost(campaign.spentTodayPaise, campaign.dailyBudgetPaise)
          : 0;
        return {
          ...r,
          adBoost: boost,
          rankScore: r.rating * 20 + boost,
          sponsored: boost > 0,
        };
      })
      .sort((a, b) => b.rankScore - a.rankScore);
    return NextResponse.json({ restaurants: ranked });
  } catch (error) {
    return jsonError(error);
  }
}
