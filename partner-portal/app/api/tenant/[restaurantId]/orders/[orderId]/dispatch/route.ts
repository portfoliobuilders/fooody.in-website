import { NextResponse } from "next/server";
import { jsonError, requireMembership, DISPATCH_ROLES } from "@/lib/auth/rbac";
import { dispatchOrder, quoteDispatch } from "@/lib/dispatch";
import type { DispatchType } from "@prisma/client";

type Params = { params: Promise<{ restaurantId: string; orderId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { restaurantId, orderId } = await params;
    await requireMembership(restaurantId, DISPATCH_ROLES);
    const quote = await quoteDispatch(orderId);
    return NextResponse.json({ quote });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { restaurantId, orderId } = await params;
    await requireMembership(restaurantId, DISPATCH_ROLES);
    const body = (await request.json().catch(() => ({}))) as { type?: DispatchType };
    const dispatch = await dispatchOrder(orderId, body.type);
    return NextResponse.json({ dispatch });
  } catch (error) {
    return jsonError(error);
  }
}
