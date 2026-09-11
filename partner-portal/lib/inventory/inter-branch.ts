import { prisma } from "@/lib/db/prisma";

export type SurplusBranch = {
  id: string;
  name: string;
  address: string;
  city: string;
  area: string;
  inventoryItems: {
    id: string;
    name: string;
    onHand: number;
    lowStockAt: number;
    unit: string;
    surplus: number;
  }[];
};

/**
 * Sister branches in the same organization with surplus of a named ingredient.
 * Surplus = onHand - lowStockAt (must be > 0). Name match is case-insensitive.
 */
export async function findSurplusBranches(
  organizationId: string,
  rawMaterialName: string,
  excludeBranchId: string,
): Promise<SurplusBranch[]> {
  const needle = rawMaterialName.trim().toLowerCase();
  if (!needle) return [];

  const siblings = await prisma.restaurant.findMany({
    where: {
      organizationId,
      id: { not: excludeBranchId },
    },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      area: true,
      inventoryItems: {
        select: {
          id: true,
          name: true,
          onHand: true,
          lowStockAt: true,
          unit: true,
        },
      },
    },
  });

  return siblings
    .map((branch) => {
      const inventoryItems = branch.inventoryItems
        .filter((item) => item.name.toLowerCase() === needle && item.onHand > item.lowStockAt)
        .map((item) => ({
          ...item,
          surplus: Number((item.onHand - item.lowStockAt).toFixed(3)),
        }));
      return { ...branch, inventoryItems };
    })
    .filter((branch) => branch.inventoryItems.length > 0);
}

export async function getBranchOrganizationId(restaurantId: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { organizationId: true },
  });
  return restaurant?.organizationId ?? null;
}
