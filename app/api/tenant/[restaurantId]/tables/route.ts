import { NextResponse } from "next/server";
import type { TableStatus, ZoneKind } from "@prisma/client";
import { jsonError, requireMembership, CASH_ROLES, MENU_ROLES } from "@/lib/auth/rbac";
import { createTable, createZone, getFloorPlan, setTableStatus } from "@/lib/db/tables";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ restaurantId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, CASH_ROLES);
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    return NextResponse.json({ zones: await getFloorPlan(restaurantId), slug: restaurant?.slug });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, MENU_ROLES);
    const body = await request.json();
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (body.kind === "zone") {
      const raw = String(body.zoneKind ?? "indoor").toUpperCase();
      const kind = (["INDOOR", "OUTDOOR", "BAR", "PRIVATE"].includes(raw) ? raw : "INDOOR") as ZoneKind;
      return NextResponse.json({ zone: await createZone(restaurantId, body.name, kind) });
    }
    if (body.kind === "status") {
      const table = await setTableStatus(restaurantId, body.tableId, body.status as TableStatus);
      return NextResponse.json({ table });
    }
    const table = await createTable(restaurantId, {
      zoneId: body.zoneId,
      number: String(body.number),
      seats: Number(body.seats),
      slug: restaurant.slug,
    });
    return NextResponse.json({ table });
  } catch (error) {
    return jsonError(error);
  }
}
