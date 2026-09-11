import { NextResponse } from "next/server";
import { jsonError, requireMembership, KITCHEN_ROLES } from "@/lib/auth/rbac";
import { dispatchRequisition } from "@/lib/db/requisitions";

type Params = { params: Promise<{ restaurantId: string; id: string }> };

/** Deducts sending-branch stock. Credit happens on POST .../receive. */
export async function POST(_request: Request, { params }: Params) {
  try {
    const { restaurantId, id } = await params;
    await requireMembership(restaurantId, KITCHEN_ROLES);
    return NextResponse.json({ requisition: await dispatchRequisition(restaurantId, id) });
  } catch (error) {
    return jsonError(error);
  }
}
