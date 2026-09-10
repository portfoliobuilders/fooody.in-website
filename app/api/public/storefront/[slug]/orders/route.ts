import { NextResponse } from "next/server";
import type { FulfillmentChannel } from "@prisma/client";
import { jsonError } from "@/lib/auth/rbac";
import { createOrder } from "@/lib/db/orders";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
    if (!restaurant) return NextResponse.json({ error: "Store not found" }, { status: 404 });
    const body = await request.json();
    const order = await createOrder({
      restaurantId: restaurant.id,
      channel: (body.channel as FulfillmentChannel) ?? "TAKEAWAY",
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerNotes: body.customerNotes,
      tableNumber: body.tableNumber,
      couponCode: body.couponCode,
      paymentGateway: body.paymentGateway,
      paymentStatus: body.paymentStatus,
      lines: body.lines,
      marketplace: Boolean(body.marketplace),
    });
    return NextResponse.json({ order });
  } catch (error) {
    return jsonError(error);
  }
}
