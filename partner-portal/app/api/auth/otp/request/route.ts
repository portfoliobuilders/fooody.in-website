import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { jsonError } from "@/lib/auth/rbac";

const schema = z.object({ phone: z.string().min(10).max(15) });

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Phone OTP is disabled in production. Sign in with email and password." },
        { status: 403 },
      );
    }
    const { phone } = schema.parse(await request.json());
    const demo = process.env.AUTH_DEMO_OTP ?? "123456";
    const codeHash = await bcrypt.hash(demo, 8);
    await prisma.otpChallenge.create({
      data: {
        phone,
        codeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        userId: (await prisma.user.findUnique({ where: { phone } }))?.id,
      },
    });
    return NextResponse.json({
      ok: true,
      demo: true,
      hint: `Demo OTP is ${demo}`,
    });
  } catch (error) {
    return jsonError(error);
  }
}
