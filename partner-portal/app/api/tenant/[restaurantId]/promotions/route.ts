import { NextResponse } from "next/server";
import { jsonError, requireMembership, MENU_ROLES } from "@/lib/auth/rbac";
import { listCoupons, upsertCoupon } from "@/lib/db/promotions";

type Params = { params: Promise<{ restaurantId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, MENU_ROLES);
    return NextResponse.json({ coupons: await listCoupons(restaurantId) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, MENU_ROLES);
    const body = await request.json();
    return NextResponse.json({ coupon: await upsertCoupon(restaurantId, body) });
  } catch (error) {
    return jsonError(error);
  }
}
