import { randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { tableQrPath } from "@/lib/tenant/host";
import { generateMenuQr } from "@/lib/qr/menu-qr";

export function slugifyRestaurant(input: string) {
  return input
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export type ProvisionRestaurantInput = {
  id?: string;
  slug: string;
  name: string;
  tagline?: string;
  city: string;
  area?: string;
  address: string;
  phone: string;
  cuisine: string;
  gstin?: string;
  upiVpa?: string;
  whatsappPhone?: string;
  brandPrimary?: string;
  brandAccent?: string;
  brandBackground?: string;
  logoUrl?: string;
  coverUrl?: string;
  rating?: number;
  prepTimeMins?: number;
  ownerUserId?: string;
  listedOnMarketplace?: boolean;
  tableCount?: number;
};

/** Creates a kitchen, lists it on Fooody, and stands up QR tables + hours. */
export async function provisionRestaurant(input: ProvisionRestaurantInput) {
  const slug = slugifyRestaurant(input.slug || input.name);
  if (!slug || slug.length < 3) throw new Error("Choose a longer restaurant URL");

  const taken = await prisma.restaurant.findUnique({ where: { slug } });
  if (taken) throw new Error("That store URL is already live");

  const id = input.id ?? `rst_${randomBytes(6).toString("hex")}`;
  const listedOnMarketplace = input.listedOnMarketplace ?? true;
  const menuQr = await generateMenuQr(slug);

  return prisma.$transaction(async (tx) => {
    const created = await tx.restaurant.create({
      data: {
        id,
        slug,
        name: input.name.trim(),
        tagline: input.tagline?.trim() ?? "",
        city: input.city.trim(),
        area: input.area?.trim() ?? "",
        address: input.address.trim(),
        phone: input.phone.trim(),
        cuisine: input.cuisine.trim(),
        gstin: input.gstin,
        upiVpa: input.upiVpa,
        whatsappPhone: input.whatsappPhone ?? input.phone.trim(),
        brandPrimary: input.brandPrimary ?? "#111827",
        brandAccent: input.brandAccent ?? "#ef4444",
        brandBackground: input.brandBackground ?? "#f6f1e8",
        logoUrl: input.logoUrl,
        coverUrl: input.coverUrl,
        rating: input.rating ?? 4.6,
        prepTimeMins: input.prepTimeMins ?? 25,
        listedOnMarketplace,
        isOpen: true,
        menuUrl: menuQr.menuUrl,
        menuQrSvg: menuQr.menuQrSvg,
      },
    });

    await tx.restaurantDomain.create({
      data: { restaurantId: created.id, host: `${slug}.fooody.in`, isPrimary: true },
    });

    await tx.operatingHour.createMany({
      data: [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
        restaurantId: created.id,
        weekday,
        opensAt: "11:00",
        closesAt: "23:00",
      })),
    });

    await tx.commissionRule.createMany({
      data: [
        { restaurantId: created.id, channel: "ONLINE_DELIVERY", commissionBps: 0, platformFeePaise: 0 },
        { restaurantId: created.id, channel: "WHATSAPP", commissionBps: 0, platformFeePaise: 0 },
        { restaurantId: created.id, channel: "DINE_IN", commissionBps: 0, platformFeePaise: 0 },
        { restaurantId: created.id, channel: "TAKEAWAY", commissionBps: 0, platformFeePaise: 0 },
      ],
    });

    const zone = await tx.diningZone.create({
      data: { restaurantId: created.id, name: "Main hall", kind: "INDOOR" },
    });

    const tableCount = input.tableCount ?? 8;
    await tx.diningTable.createMany({
      data: Array.from({ length: tableCount }, (_, i) => {
        const number = String(i + 1);
        return {
          restaurantId: created.id,
          zoneId: zone.id,
          number,
          seats: i % 3 === 2 ? 6 : 4,
          qrPath: tableQrPath(slug, number),
        };
      }),
    });

    if (input.ownerUserId) {
      await tx.restaurantMember.create({
        data: { restaurantId: created.id, userId: input.ownerUserId, role: "OWNER" },
      });
    }

    return created;
  });
}

export async function updateRestaurantSettings(
  restaurantId: string,
  data: Prisma.RestaurantUpdateInput & {
    hours?: { weekday: number; opensAt: string; closesAt: string; isClosed: boolean }[];
  },
) {
  const { hours, ...rest } = data;
  await prisma.restaurant.update({ where: { id: restaurantId }, data: rest });
  if (hours) {
    for (const hour of hours) {
      await prisma.operatingHour.upsert({
        where: { restaurantId_weekday: { restaurantId, weekday: hour.weekday } },
        update: { opensAt: hour.opensAt, closesAt: hour.closesAt, isClosed: hour.isClosed },
        create: { restaurantId, ...hour },
      });
    }
  }
  return prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: { hours: { orderBy: { weekday: "asc" } }, domains: true },
  });
}

export async function getRestaurantSettings(restaurantId: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: { hours: { orderBy: { weekday: "asc" } }, domains: true },
  });
  if (!restaurant) return null;
  if (restaurant.menuQrSvg && restaurant.menuUrl) return restaurant;
  const menuQr = await generateMenuQr(restaurant.slug);
  return prisma.restaurant.update({
    where: { id: restaurantId },
    data: { menuUrl: menuQr.menuUrl, menuQrSvg: menuQr.menuQrSvg },
    include: { hours: { orderBy: { weekday: "asc" } }, domains: true },
  });
}
