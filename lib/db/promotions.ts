import type { CouponType, OfferChannel } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function listCoupons(restaurantId: string) {
  return prisma.coupon.findMany({
    where: { restaurantId },
    include: { _count: { select: { redemptions: true } } },
    orderBy: { code: "asc" },
  });
}

export async function upsertCoupon(
  restaurantId: string,
  data: {
    id?: string;
    code: string;
    type: CouponType;
    value: number;
    minOrderPaise?: number;
    maxDiscountPaise?: number | null;
    expiresAt?: string | null;
    usageLimitPerUser?: number;
    channel?: OfferChannel;
    isActive?: boolean;
  },
) {
  const payload = {
    restaurantId,
    code: data.code.toUpperCase(),
    type: data.type,
    value: data.value,
    minOrderPaise: data.minOrderPaise ?? 0,
    maxDiscountPaise: data.maxDiscountPaise ?? null,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    usageLimitPerUser: data.usageLimitPerUser ?? 1,
    channel: data.channel ?? "ALL",
    isActive: data.isActive ?? true,
  };
  if (data.id) {
    return prisma.coupon.update({ where: { id: data.id }, data: payload });
  }
  return prisma.coupon.create({ data: payload });
}

export async function listCampaigns(restaurantId: string) {
  return prisma.adCampaign.findMany({
    where: { restaurantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function upsertCampaign(
  restaurantId: string,
  data: { id?: string; name: string; dailyBudgetPaise: number; status?: "ACTIVE" | "PAUSED" | "ENDED" },
) {
  if (data.id) {
    return prisma.adCampaign.update({
      where: { id: data.id },
      data: {
        name: data.name,
        dailyBudgetPaise: data.dailyBudgetPaise,
        status: data.status,
      },
    });
  }
  return prisma.adCampaign.create({
    data: {
      restaurantId,
      name: data.name,
      dailyBudgetPaise: data.dailyBudgetPaise,
      status: data.status ?? "ACTIVE",
    },
  });
}

export function marketplaceBoost(spentTodayPaise: number, dailyBudgetPaise: number) {
  if (dailyBudgetPaise <= 0) return 0;
  const ratio = Math.min(1, spentTodayPaise / dailyBudgetPaise);
  return 12 + ratio * 28;
}
