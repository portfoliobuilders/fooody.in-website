import { NextResponse } from "next/server";
import { jsonError, requireMembership, ORDER_ROLES } from "@/lib/auth/rbac";
import { getOrder } from "@/lib/db/orders";
import { prisma } from "@/lib/db/prisma";
import { buildKotPayload, buildReceiptPayload } from "@/lib/pos/escpos";

type Params = { params: Promise<{ restaurantId: string; orderId: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { restaurantId, orderId } = await params;
    await requireMembership(restaurantId, ORDER_ROLES);
    const kind = new URL(request.url).searchParams.get("kind") === "receipt" ? "receipt" : "kot";
    const [order, restaurant] = await Promise.all([
      getOrder(restaurantId, orderId),
      prisma.restaurant.findUnique({ where: { id: restaurantId }, select: { name: true } }),
    ]);
    if (!order || !restaurant) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const payload = {
      orderNumber: order.orderNumber,
      channel: order.channel,
      customerName: order.customerName,
      customerNotes: order.customerNotes,
      table: order.table,
      placedAt: order.placedAt,
      totalPaise: order.totalPaise,
      items: order.items,
      restaurantName: restaurant.name,
      tenders: order.payment?.tenders ?? [],
    };
    return NextResponse.json(kind === "receipt" ? buildReceiptPayload(payload) : buildKotPayload(payload));
  } catch (error) {
    return jsonError(error);
  }
}
