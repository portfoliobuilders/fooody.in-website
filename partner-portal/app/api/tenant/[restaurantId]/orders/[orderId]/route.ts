import { z } from "zod";
import { NextResponse } from "next/server";
import type { OrderStatus } from "@prisma/client";
import { jsonError, requireMembership, ORDER_ROLES, CASH_ROLES } from "@/lib/auth/rbac";
import { collectPayment, getOrder, printBill, transitionOrder } from "@/lib/db/orders";

const schema = z
  .object({
    status: z
      .enum(["PENDING", "ACCEPTED", "PREPARING", "READY", "DISPATCHED", "COMPLETED", "CANCELLED"])
      .optional(),
    cancelReason: z.string().optional(),
    printBill: z.boolean().optional(),
    collectPayment: z.enum(["CASH", "CARD", "UPI"]).optional(),
  })
  .refine((body) => Boolean(body.status || body.printBill || body.collectPayment), {
    message: "No action",
  });

type Params = { params: Promise<{ restaurantId: string; orderId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { restaurantId, orderId } = await params;
    await requireMembership(restaurantId, ORDER_ROLES);
    const order = await getOrder(restaurantId, orderId);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { restaurantId, orderId } = await params;
    const { role } = await requireMembership(restaurantId, ORDER_ROLES);
    const body = schema.parse(await request.json());
    if (role === "KITCHEN_STAFF" && (body.status === "CANCELLED" || body.collectPayment || body.printBill)) {
      return NextResponse.json({ error: "Kitchen cannot settle or cancel tickets" }, { status: 403 });
    }
    if ((body.collectPayment || body.printBill) && !CASH_ROLES.includes(role)) {
      return NextResponse.json({ error: "Only cashier can collect payment" }, { status: 403 });
    }

    let order = await getOrder(restaurantId, orderId);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (body.collectPayment) {
      order = await collectPayment(restaurantId, orderId, body.collectPayment);
    }
    if (body.printBill) {
      order = await printBill(restaurantId, orderId);
    }
    if (body.status) {
      order = await transitionOrder(restaurantId, orderId, body.status as OrderStatus, body.cancelReason);
    }
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (error) {
    return jsonError(error);
  }
}
