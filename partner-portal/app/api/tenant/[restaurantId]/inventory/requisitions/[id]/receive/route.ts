import { NextResponse } from "next/server";
import { jsonError, requireMembership, KITCHEN_ROLES } from "@/lib/auth/rbac";
import { receiveRequisition } from "@/lib/db/requisitions";

type Params = { params: Promise<{ restaurantId: string; id: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const { restaurantId, id } = await params;
    await requireMembership(restaurantId, KITCHEN_ROLES);
    return NextResponse.json({ requisition: await receiveRequisition(restaurantId, id) });
  } catch (error) {
    return jsonError(error);
  }
}
