import { notFound } from "next/navigation";
import { Storefront } from "@/components/storefront/storefront";
import { prisma } from "@/lib/db/prisma";
import { openTableSession } from "@/lib/db/tables";

export default async function QrTablePage({
  params,
}: {
  params: Promise<{ restaurantSlug: string; tableNumber: string }>;
}) {
  const { restaurantSlug, tableNumber } = await params;
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    include: { tables: true },
  });
  if (!restaurant || !restaurant.tables.some((t) => t.number === tableNumber)) notFound();
  await openTableSession(restaurant.id, tableNumber);
  return <Storefront slug={restaurantSlug} tableNumber={tableNumber} />;
}
