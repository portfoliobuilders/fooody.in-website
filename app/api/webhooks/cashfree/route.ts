import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { publishTenantEvent } from "@/lib/realtime/order-bus";

function valid(raw: string, signature: string | null, timestamp: string | null) {
  const secret = process.env.CASHFREE_WEBHOOK_SECRET;
  if (!secret) return true;
  if (!signature || !timestamp) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}${raw}`).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!valid(raw, request.headers.get("x-webhook-signature"), request.headers.get("x-webhook-timestamp"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  const payload = JSON.parse(raw) as {
    type?: string;
    data?: { order?: { order_id?: string; order_status?: string } };
  };
  const reference = payload.data?.order?.order_id;
  if (!reference) return NextResponse.json({ ok: true });
  const payment = await prisma.payment.findFirst({
    where: { reference },
    include: { order: true },
  });
  if (!payment) return NextResponse.json({ ok: true });
  const paid = payload.data?.order?.order_status === "PAID" || payload.type === "PAYMENT_SUCCESS_WEBHOOK";
  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: paid ? "PAID" : payment.status, settled: paid },
  });
  publishTenantEvent(payment.restaurantId, { type: "order.updated", payload: { ...payment.order, payment: updated } });
  return NextResponse.json({ ok: true });
}
