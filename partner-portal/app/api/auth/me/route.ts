import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  const memberships = await prisma.restaurantMember.findMany({
    where: { userId: session.userId },
    include: { restaurant: true },
  });
  return NextResponse.json({ user: session, memberships });
}
