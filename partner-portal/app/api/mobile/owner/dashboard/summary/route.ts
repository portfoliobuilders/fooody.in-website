import { NextResponse } from "next/server";
import { jsonError, requireMembership, MUTATE_ROLES } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { lowStockItems } from "@/lib/db/inventory";

export async function GET(request: Request) {
  try {
    const restaurantId = new URL(request.url).searchParams.get("restaurantId");
    if (!restaurantId) {
      return NextResponse.json({ error: "restaurantId is required" }, { status: 400 });
    }
    await requireMembership(restaurantId, MUTATE_ROLES);

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const [today, pending, outOfStock, lowStock] = await Promise.all([
      prisma.order.findMany({
        where: { restaurantId, placedAt: { gte: start }, status: { not: "CANCELLED" } },
        select: { totalPaise: true, netPayoutPaise: true },
      }),
      prisma.order.count({ where: { restaurantId, status: "PENDING" } }),
      prisma.menuItem.findMany({
        where: { restaurantId, inStock: false },
        select: { id: true, title: true },
      }),
      lowStockItems(restaurantId),
    ]);

    const salesPaise = today.reduce((sum, row) => sum + row.totalPaise, 0);
    const payoutPaise = today.reduce((sum, row) => sum + row.netPayoutPaise, 0);

    return NextResponse.json({
      date: start.toISOString(),
      pendingTickets: pending,
      orderCount: today.length,
      salesPaise,
      netPayoutPaise: payoutPaise,
      payoutBps: salesPaise ? Math.round((payoutPaise / salesPaise) * 10000) : 0,
      outOfStockMenu: outOfStock,
      lowStock: lowStock.map((item) => ({
        id: item.id,
        name: item.name,
        onHand: item.onHand,
        unit: item.unit,
      })),
    });
  } catch (error) {
    return jsonError(error);
  }
}
