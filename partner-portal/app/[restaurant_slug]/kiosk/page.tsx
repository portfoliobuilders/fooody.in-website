import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Storefront } from "@/components/storefront/storefront";
import { prisma } from "@/lib/db/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ restaurant_slug: string }>;
}): Promise<Metadata> {
  const { restaurant_slug } = await params;
  const restaurant = await prisma.restaurant.findUnique({ where: { slug: restaurant_slug } });
  return { title: restaurant ? `${restaurant.name} kiosk` : "Order kiosk" };
}

export default async function KioskPage({
  params,
}: {
  params: Promise<{ restaurant_slug: string }>;
}) {
  const { restaurant_slug } = await params;
  const exists = await prisma.restaurant.findUnique({ where: { slug: restaurant_slug } });
  if (!exists) notFound();
  return <Storefront slug={restaurant_slug} kiosk />;
}
