import { notFound } from "next/navigation";
import { Storefront } from "@/components/storefront/storefront";
import { RESERVED_SLUGS } from "@/lib/tenant/host";
import { prisma } from "@/lib/db/prisma";

export default async function RestaurantStorePage({
  params,
}: {
  params: Promise<{ restaurant_slug: string }>;
}) {
  const { restaurant_slug } = await params;
  if (RESERVED_SLUGS.has(restaurant_slug)) notFound();
  const exists = await prisma.restaurant.findUnique({ where: { slug: restaurant_slug } });
  if (!exists) notFound();
  return <Storefront slug={restaurant_slug} />;
}
