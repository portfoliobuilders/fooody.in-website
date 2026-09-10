import { NextResponse } from "next/server";
import type { StaffRole } from "@prisma/client";
import { jsonError, requireMembership } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ restaurantId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, ["OWNER"]);
    const members = await prisma.restaurantMember.findMany({
      where: { restaurantId },
      include: { user: true },
    });
    return NextResponse.json({ members });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, ["OWNER"]);
    const body = (await request.json()) as {
      email?: string;
      name?: string;
      role: StaffRole;
    };
    if (!body.email || !body.role) {
      return NextResponse.json({ error: "Email and role required" }, { status: 400 });
    }
    const user = await prisma.user.upsert({
      where: { email: body.email.toLowerCase() },
      update: {},
      create: {
        id: `usr_${crypto.randomUUID().slice(0, 8)}`,
        email: body.email.toLowerCase(),
        name: body.name || body.email.split("@")[0],
      },
    });
    const member = await prisma.restaurantMember.upsert({
      where: { restaurantId_userId: { restaurantId, userId: user.id } },
      update: { role: body.role },
      create: { restaurantId, userId: user.id, role: body.role },
      include: { user: true },
    });
    return NextResponse.json({ member });
  } catch (error) {
    return jsonError(error);
  }
}
