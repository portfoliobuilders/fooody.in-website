import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { jsonError } from "@/lib/auth/rbac";
import { provisionRestaurant, slugifyRestaurant } from "@/lib/db/restaurants";
import { setSessionCookie } from "@/lib/auth/session";
import { RESERVED_SLUGS } from "@/lib/tenant/host";

const schema = z.object({
  restaurantName: z.string().min(2),
  slug: z.string().optional(),
  city: z.string().min(2),
  area: z.string().optional(),
  address: z.string().min(4),
  phone: z.string().min(8),
  cuisine: z.string().min(2),
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const slug = slugifyRestaurant(body.slug || body.restaurantName);
    if (RESERVED_SLUGS.has(slug)) {
      return NextResponse.json({ error: "That URL is reserved" }, { status: 400 });
    }
    const existingUser = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (existingUser) {
      return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        id: `usr_${Date.now().toString(36)}`,
        email: body.email.toLowerCase(),
        phone: body.phone.replace(/\D/g, "").slice(-10),
        passwordHash,
        name: body.ownerName,
      },
    });

    const restaurant = await provisionRestaurant({
      slug,
      name: body.restaurantName,
      city: body.city,
      area: body.area,
      address: body.address,
      phone: body.phone.replace(/\D/g, "").slice(-10) || body.phone,
      cuisine: body.cuisine,
      whatsappPhone: body.phone.replace(/\D/g, "").slice(-10),
      ownerUserId: user.id,
      listedOnMarketplace: true,
    });

    await setSessionCookie({
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });

    return NextResponse.json({
      restaurant,
      storeUrl: restaurant.menuUrl ?? `/${restaurant.slug}`,
      dashboardUrl: `/dashboard/${restaurant.id}`,
    });
  } catch (error) {
    return jsonError(error);
  }
}
