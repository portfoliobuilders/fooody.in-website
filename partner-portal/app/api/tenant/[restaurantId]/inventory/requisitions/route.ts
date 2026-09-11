import { NextResponse } from "next/server";
import { z } from "zod";
import type { RequisitionType } from "@prisma/client";
import { jsonError, requireMembership, KITCHEN_ROLES } from "@/lib/auth/rbac";
import { createRequisition, listRequisitions } from "@/lib/db/requisitions";

type Params = { params: Promise<{ restaurantId: string }> };

const createSchema = z.object({
  type: z.enum(["PURCHASE_ORDER", "BRANCH_TRANSFER"]),
  fulfillingBranchId: z.string().optional().nullable(),
  notes: z.string().optional(),
  lines: z
    .array(
      z.object({
        inventoryItemId: z.string(),
        quantity: z.number().positive(),
        sourceInventoryId: z.string().optional(),
      }),
    )
    .min(1),
});

export async function GET(_request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, KITCHEN_ROLES);
    return NextResponse.json({ requisitions: await listRequisitions(restaurantId) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    const { user } = await requireMembership(restaurantId, KITCHEN_ROLES);
    const body = createSchema.parse(await request.json());
    const requisition = await createRequisition({
      restaurantId,
      userId: user.userId,
      type: body.type as RequisitionType,
      fulfillingBranchId: body.fulfillingBranchId,
      notes: body.notes,
      lines: body.lines,
    });
    return NextResponse.json({ requisition }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
