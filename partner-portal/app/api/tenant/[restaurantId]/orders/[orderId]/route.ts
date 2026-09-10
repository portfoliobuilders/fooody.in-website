import { z } from "zod";
import { NextResponse } from "next/server";
import type { OrderStatus } from "@prisma/client";
import { jsonError, requireMembership, ORDER_ROLES } from "@/lib/auth/rbac";
import { getOrder, transitionOrder } from "@/lib/db/orders";

const schema = z.object({
  status: z.enum([
    "PENDING",
    "ACCEPTED",
    "PREPARING",
    "READY",
    "DISPATCHED",
    "COMPLETED",
    "CANCELLED",
  ]),
  cancelReason: z.string().optional(),
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
    if (role === "KITCHEN_STAFF" && body.status === "CANCELLED") {
      return NextResponse.json({ error: "Kitchen cannot cancel orders" }, { status: 403 });
    }
    const order = await transitionOrder(
      restaurantId,
      orderId,
      body.status as OrderStatus,
      body.cancelReason,
    );
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (error) {
    return jsonError(error);
  }
}
