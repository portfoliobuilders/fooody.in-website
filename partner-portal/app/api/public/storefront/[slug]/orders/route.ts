import { NextResponse } from "next/server";
import { z } from "zod";
import type { FulfillmentChannel } from "@prisma/client";
import { jsonError } from "@/lib/auth/rbac";
import { createOrder } from "@/lib/db/orders";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ slug: string }> };

const publicOrderSchema = z.object({
  channel: z
    .enum(["DINE_IN", "ONLINE_DELIVERY", "TAKEAWAY", "SELF_DELIVERY", "WHATSAPP"])
    .optional(),
  customerName: z.string().min(1),
  customerPhone: z.string().min(8),
  customerNotes: z.string().optional(),
  tableNumber: z.string().optional(),
  couponCode: z.string().optional(),
  paymentGateway: z.enum(["RAZORPAY", "CASHFREE", "STRIPE", "UPI", "CASH"]).optional(),
  cashOnDelivery: z.boolean().optional(),
  marketplace: z.boolean().optional(),
  lines: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        variantName: z.string().optional(),
        quantity: z.number().int().positive(),
        notes: z.string().optional(),
        modifiers: z.array(z.object({ name: z.string(), pricePaise: z.number() })).optional(),
      }),
    )
    .min(1),
});

export async function POST(request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
    if (!restaurant) return NextResponse.json({ error: "Store not found" }, { status: 404 });
    const body = publicOrderSchema.parse(await request.json());
    const order = await createOrder({
      restaurantId: restaurant.id,
      channel: (body.channel as FulfillmentChannel) ?? "TAKEAWAY",
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerNotes: body.customerNotes,
      tableNumber: body.tableNumber,
      couponCode: body.couponCode,
      paymentGateway: body.paymentGateway,
      paymentStatus: body.cashOnDelivery ? "CASH_ON_DELIVERY" : "PENDING",
      lines: body.lines,
      marketplace: Boolean(body.marketplace),
    });
    return NextResponse.json({ order });
  } catch (error) {
    return jsonError(error);
  }
}
