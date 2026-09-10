import { notFound } from "next/navigation";
import { Storefront } from "@/components/storefront/storefront";
import { prisma } from "@/lib/db/prisma";
import { openTableSession } from "@/lib/db/tables";

export default async function TableOrderPage({
  params,
}: {
  params: Promise<{ restaurant_slug: string; table_number: string }>;
}) {
  const { restaurant_slug, table_number } = await params;
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurant_slug },
    include: { tables: true },
  });
  if (!restaurant || !restaurant.tables.some((t) => t.number === table_number)) notFound();
  await openTableSession(restaurant.id, table_number);
  return <Storefront slug={restaurant_slug} tableNumber={table_number} />;
}
