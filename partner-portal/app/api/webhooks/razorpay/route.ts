import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { publishTenantEvent } from "@/lib/realtime/order-bus";

function validSignature(raw: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "Razorpay webhook is not configured" }, { status: 500 });
  }
  const raw = await request.text();
  if (!validSignature(raw, request.headers.get("x-razorpay-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  const payload = JSON.parse(raw) as {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; notes?: { orderId?: string }; status?: string } } };
  };
  const entity = payload.payload?.payment?.entity;
  const reference = entity?.id;
  const orderId = entity?.notes?.orderId;
  if (!reference && !orderId) return NextResponse.json({ ok: true });

  const payment = await prisma.payment.findFirst({
    where: orderId ? { orderId } : { reference },
    include: { order: true },
  });
  if (!payment) return NextResponse.json({ ok: true });

  const paid = entity?.status === "captured" || payload.event === "payment.captured";
  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: paid ? "PAID" : payload.event === "payment.failed" ? "FAILED" : payment.status,
      settled: paid,
      reference: reference ?? payment.reference,
    },
  });
  publishTenantEvent(payment.restaurantId, { type: "order.updated", payload: { ...payment.order, payment: updated } });
  return NextResponse.json({ ok: true });
}
