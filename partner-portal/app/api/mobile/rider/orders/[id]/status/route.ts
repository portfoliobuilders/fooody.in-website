import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireUser } from "@/lib/auth/rbac";
import { advanceRiderOrder } from "@/lib/mobile/rider";

type Params = { params: Promise<{ id: string }> };

const schema = z.object({
  status: z.enum(["PICKED_UP", "ARRIVED", "DELIVERED"]),
  otp: z.string().optional(),
});

async function handle(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = schema.parse(await request.json());
    const result = await advanceRiderOrder(user.userId, id, body.status, body.otp);
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}

export const POST = handle;
export const PATCH = handle;
