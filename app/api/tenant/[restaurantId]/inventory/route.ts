import { NextResponse } from "next/server";
import { jsonError, requireMembership, KITCHEN_ROLES, MENU_ROLES } from "@/lib/auth/rbac";
import { listInventory, mapRecipe, upsertInventory } from "@/lib/db/inventory";

type Params = { params: Promise<{ restaurantId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, KITCHEN_ROLES);
    return NextResponse.json({ items: await listInventory(restaurantId) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, MENU_ROLES);
    const body = await request.json();
    if (body.kind === "recipe") {
      return NextResponse.json({
        line: await mapRecipe(restaurantId, body.menuItemId, body.inventoryItemId, Number(body.qtyPerPortion)),
      });
    }
    return NextResponse.json({ item: await upsertInventory(restaurantId, body) });
  } catch (error) {
    return jsonError(error);
  }
}
