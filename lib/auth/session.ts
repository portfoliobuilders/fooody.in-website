import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { StaffRole } from "@prisma/client";

export const SESSION_COOKIE = "fooody_session";

export type SessionUser = {
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
};

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error("SESSION_SECRET is not set");
  }
  return new TextEncoder().encode(value);
}

export async function signSession(user: SessionUser) {
  return new SignJWT({
    userId: user.userId,
    name: user.name,
    email: user.email ?? "",
    phone: user.phone ?? "",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.userId)
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret());
}

export async function readSessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.userId !== "string" || typeof payload.name !== "string") {
      return null;
    }
    return {
      userId: payload.userId,
      name: payload.name,
    email: typeof payload.email === "string" && payload.email ? payload.email : null,
    phone: typeof payload.phone === "string" && payload.phone ? payload.phone : null,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

export async function setSessionCookie(user: SessionUser) {
  const jar = await cookies();
  const token = await signSession(user);
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export const ROLE_RANK: Record<StaffRole, number> = {
  DELIVERY_DRIVER: 1,
  KITCHEN_STAFF: 2,
  BILLING_CASHIER: 3,
  MANAGER: 4,
  OWNER: 5,
  SUPER_ADMIN: 6,
};
