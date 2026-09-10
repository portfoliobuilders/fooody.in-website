import { NextResponse } from "next/server";
import { z } from "zod";
import type { StaffRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSession, type SessionUser } from "@/lib/auth/session";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export type TenantContext = {
  user: SessionUser;
  restaurantId: string;
  role: StaffRole;
};

export async function requireUser() {
  const user = await getSession();
  if (!user) {
    throw new HttpError(401, "Sign in required");
  }
  return user;
}

export async function requireMembership(
  restaurantId: string,
  allowed?: StaffRole[],
): Promise<TenantContext> {
  const user = await requireUser();
  const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
  if (dbUser?.isSuperAdmin) {
    return { user, restaurantId, role: "SUPER_ADMIN" };
  }
  const membership = await prisma.restaurantMember.findUnique({
    where: {
      restaurantId_userId: { restaurantId, userId: user.userId },
    },
  });
  if (!membership) {
    throw new HttpError(403, "No access to this restaurant");
  }
  if (allowed && !allowed.includes(membership.role)) {
    throw new HttpError(403, "This role cannot perform that action");
  }
  return { user, restaurantId, role: membership.role };
}

export function jsonError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: "Invalid request", details: error.flatten() }, { status: 400 });
  }
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  console.error(error);
  return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
}

export const MUTATE_ROLES: StaffRole[] = ["SUPER_ADMIN", "OWNER", "MANAGER"];
export const ORDER_ROLES: StaffRole[] = [
  "SUPER_ADMIN",
  "OWNER",
  "MANAGER",
  "KITCHEN_STAFF",
  "BILLING_CASHIER",
  "DELIVERY_DRIVER",
];
export const KITCHEN_ROLES: StaffRole[] = ["SUPER_ADMIN", "OWNER", "MANAGER", "KITCHEN_STAFF"];
export const CASH_ROLES: StaffRole[] = ["SUPER_ADMIN", "OWNER", "MANAGER", "BILLING_CASHIER"];
export const MENU_ROLES: StaffRole[] = ["SUPER_ADMIN", "OWNER", "MANAGER"];
export const FINANCE_ROLES: StaffRole[] = ["SUPER_ADMIN", "OWNER", "MANAGER", "BILLING_CASHIER"];
export const DISPATCH_ROLES: StaffRole[] = [
  "SUPER_ADMIN",
  "OWNER",
  "MANAGER",
  "BILLING_CASHIER",
  "DELIVERY_DRIVER",
];
