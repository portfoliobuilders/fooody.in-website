import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user.phone) {
      return NextResponse.json({ orders: [] });
    }
    const orders = await prisma.order.findMany({
      where: {
        customerPhone: user.phone,
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
      include: {
        items: true,
        dispatch: true,
        restaurant: { select: { name: true, slug: true, phone: true } },
        payment: { select: { gateway: true, status: true } },
      },
      orderBy: { placedAt: "desc" },
      take: 20,
    });
    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        channel: order.channel,
        restaurant: order.restaurant,
        totalPaise: order.totalPaise,
        items: order.items,
        dispatch: order.dispatch
          ? {
              status: order.dispatch.status,
              trackingUrl: order.dispatch.trackingUrl,
              deliveryOtp: order.dispatch.deliveryOtp,
            }
          : null,
        payment: order.payment,
        placedAt: order.placedAt,
      })),
    });
  } catch (error) {
    return jsonError(error);
  }
}
