import { NextResponse } from "next/server";
import { jsonError, requireMembership, ORDER_ROLES } from "@/lib/auth/rbac";
import { getRestaurantSettings } from "@/lib/db/restaurants";

type Params = { params: Promise<{ restaurantId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, ORDER_ROLES);
    const restaurant = await getRestaurantSettings(restaurantId);
    if (!restaurant?.menuQrSvg) {
      return NextResponse.json({ error: "Menu QR is not ready" }, { status: 404 });
    }
    return new NextResponse(restaurant.menuQrSvg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${restaurant.slug}-menu-qr.svg"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
