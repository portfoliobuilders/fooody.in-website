import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireMembership, KITCHEN_ROLES, MUTATE_ROLES } from "@/lib/auth/rbac";
import { decideRequisition, dispatchRequisition, getRequisition, receiveRequisition } from "@/lib/db/requisitions";

type Params = { params: Promise<{ restaurantId: string; id: string }> };

const schema = z.object({
  action: z.enum(["approve", "reject", "dispatch", "receive"]),
});

export async function GET(_request: Request, { params }: Params) {
  try {
    const { restaurantId, id } = await params;
    await requireMembership(restaurantId, KITCHEN_ROLES);
    const requisition = await getRequisition(restaurantId, id);
    if (!requisition) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ requisition });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { restaurantId, id } = await params;
    const { user, role } = await requireMembership(restaurantId, KITCHEN_ROLES);
    const body = schema.parse(await request.json());

    if ((body.action === "approve" || body.action === "reject") && !MUTATE_ROLES.includes(role)) {
      return NextResponse.json({ error: "Only owners or managers can approve" }, { status: 403 });
    }

    if (body.action === "approve" || body.action === "reject") {
      const requisition = await decideRequisition(
        restaurantId,
        id,
        user.userId,
        body.action === "approve" ? "APPROVED" : "REJECTED",
      );
      return NextResponse.json({ requisition });
    }
    if (body.action === "dispatch") {
      return NextResponse.json({ requisition: await dispatchRequisition(restaurantId, id) });
    }
    return NextResponse.json({ requisition: await receiveRequisition(restaurantId, id) });
  } catch (error) {
    return jsonError(error);
  }
}
