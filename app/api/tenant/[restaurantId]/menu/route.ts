import { NextResponse } from "next/server";
import { jsonError, requireMembership, MENU_ROLES, ORDER_ROLES } from "@/lib/auth/rbac";
import { createCategory, getCatalog, upsertMenuItem } from "@/lib/db/menu";

type Params = { params: Promise<{ restaurantId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, ORDER_ROLES);
    return NextResponse.json(await getCatalog(restaurantId));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, MENU_ROLES);
    const body = await request.json();
    if (body.kind === "category") {
      return NextResponse.json({ category: await createCategory(restaurantId, body.name) });
    }
    const item = await upsertMenuItem(restaurantId, body);
    return NextResponse.json({ item });
  } catch (error) {
    return jsonError(error);
  }
}
