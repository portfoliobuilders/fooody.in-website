import { NextResponse } from "next/server";
import type { FulfillmentChannel, OrderStatus } from "@prisma/client";
import { jsonError, requireMembership, ORDER_ROLES, CASH_ROLES } from "@/lib/auth/rbac";
import { createDemoOrder, createOrder, listOrders } from "@/lib/db/orders";

type Params = { params: Promise<{ restaurantId: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, ORDER_ROLES);
    const url = new URL(request.url);
    const channel = url.searchParams.get("channel") as FulfillmentChannel | null;
    const status = url.searchParams.get("status") as OrderStatus | null;
    const orders = await listOrders(restaurantId, {
      channel: channel || undefined,
      status: status || undefined,
    });
    return NextResponse.json({ orders });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, CASH_ROLES);
    const body = await request.json();
    if (body.simulate) {
      return NextResponse.json({ order: await createDemoOrder(restaurantId) });
    }
    const order = await createOrder({ restaurantId, ...body });
    return NextResponse.json({ order });
  } catch (error) {
    return jsonError(error);
  }
}
