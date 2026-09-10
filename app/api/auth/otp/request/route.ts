import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { jsonError } from "@/lib/auth/rbac";

const schema = z.object({ phone: z.string().min(10).max(15) });

export async function POST(request: Request) {
  try {
    const { phone } = schema.parse(await request.json());
    const demo = process.env.AUTH_DEMO_OTP ?? "123456";
    const code = process.env.NODE_ENV === "production" && !process.env.AUTH_DEMO_OTP
      ? String(Math.floor(100000 + Math.random() * 900000))
      : demo;
    const codeHash = await bcrypt.hash(code, 8);
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
      demo: Boolean(process.env.AUTH_DEMO_OTP),
      hint: process.env.AUTH_DEMO_OTP ? "Demo OTP is 123456" : undefined,
    });
  } catch (error) {
    return jsonError(error);
  }
}
