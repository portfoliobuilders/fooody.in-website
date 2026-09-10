import { NextResponse } from "next/server";
import { jsonError, requireMembership, CASH_ROLES, MENU_ROLES } from "@/lib/auth/rbac";
import { listReservations, upsertReservation } from "@/lib/db/tables";

type Params = { params: Promise<{ restaurantId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, CASH_ROLES);
    return NextResponse.json({ reservations: await listReservations(restaurantId) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, MENU_ROLES);
    const body = await request.json();
    return NextResponse.json({ reservation: await upsertReservation(restaurantId, body) });
  } catch (error) {
    return jsonError(error);
  }
}
