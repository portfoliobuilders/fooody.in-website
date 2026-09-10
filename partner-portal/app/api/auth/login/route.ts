import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { setSessionCookie } from "@/lib/auth/session";
import { jsonError } from "@/lib/auth/rbac";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!user?.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    await setSessionCookie({
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
    const memberships = await prisma.restaurantMember.findMany({
      where: { userId: user.id },
      include: { restaurant: true },
    });
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
      memberships,
    });
  } catch (error) {
    return jsonError(error);
  }
}
