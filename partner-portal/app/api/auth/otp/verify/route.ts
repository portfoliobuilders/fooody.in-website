import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { setSessionCookie } from "@/lib/auth/session";
import { jsonError } from "@/lib/auth/rbac";

const schema = z.object({
  phone: z.string().min(10),
  code: z.string().min(4),
});

export async function POST(request: Request) {
  try {
    const { phone, code } = schema.parse(await request.json());
    const challenge = await prisma.otpChallenge.findFirst({
      where: { phone, consumed: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!challenge) {
      return NextResponse.json({ error: "OTP expired. Request a new one." }, { status: 400 });
    }
    const ok = await bcrypt.compare(code, challenge.codeHash);
    if (!ok) {
      return NextResponse.json({ error: "Incorrect OTP" }, { status: 401 });
    }
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumed: true },
    });
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: { id: `usr_${crypto.randomUUID().slice(0, 8)}`, phone, name: "Partner" },
      });
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
    return NextResponse.json({ user, memberships });
  } catch (error) {
    return jsonError(error);
  }
}
