import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireMembership, MENU_ROLES } from "@/lib/auth/rbac";
import { toggleItemStock, upsertMenuItem } from "@/lib/db/menu";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ restaurantId: string; itemId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { restaurantId, itemId } = await params;
    await requireMembership(restaurantId, MENU_ROLES);
    const body = await request.json();
    if (typeof body.inStock === "boolean" && Object.keys(body).length === 1) {
      const item = await toggleItemStock(restaurantId, itemId, body.inStock);
      return NextResponse.json({ item });
    }
    const item = await upsertMenuItem(restaurantId, { ...body, id: itemId });
    return NextResponse.json({ item });
  } catch (error) {
    return jsonError(error);
  }
}

const stockSchema = z.object({ inStock: z.boolean() });

export async function PUT(request: Request, { params }: Params) {
  try {
    const { restaurantId, itemId } = await params;
    await requireMembership(restaurantId, MENU_ROLES);
    const { inStock } = stockSchema.parse(await request.json());
    const item = await toggleItemStock(restaurantId, itemId, inStock);
    return NextResponse.json({ item });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { restaurantId, itemId } = await params;
    await requireMembership(restaurantId, MENU_ROLES);
    const item = await prisma.menuItem.findFirst({ where: { id: itemId, restaurantId } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await prisma.menuItem.delete({ where: { id: item.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
