import { NextResponse } from "next/server";
import { jsonError, requireMembership, KITCHEN_ROLES } from "@/lib/auth/rbac";
import { nearbyStock } from "@/lib/db/requisitions";

type Params = { params: Promise<{ restaurantId: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, KITCHEN_ROLES);
    const materialName = new URL(request.url).searchParams.get("materialName") ?? "";
    if (!materialName.trim()) {
      return NextResponse.json({ error: "materialName is required" }, { status: 400 });
    }
    return NextResponse.json(await nearbyStock(restaurantId, materialName));
  } catch (error) {
    return jsonError(error);
  }
}
