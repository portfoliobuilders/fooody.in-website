import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { publishTenantEvent } from "@/lib/realtime/order-bus";

const itemInclude = {
  category: true,
  variants: true,
  itemModifiers: { include: { group: { include: { options: true } } } },
} satisfies Prisma.MenuItemInclude;

export async function getCatalog(restaurantId: string) {
  const [categories, items, modifierGroups] = await Promise.all([
    prisma.menuCategory.findMany({
      where: { restaurantId },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.menuItem.findMany({
      where: { restaurantId },
      include: itemInclude,
      orderBy: { sortOrder: "asc" },
    }),
    prisma.modifierGroup.findMany({
      where: { restaurantId },
      include: { options: true },
    }),
  ]);
  return { categories, items, modifierGroups };
}

export async function getPublicCatalog(slug: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      categories: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      items: {
        where: { listedOnStorefront: true },
        include: itemInclude,
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      },
      tables: { select: { number: true, seats: true, status: true } },
      hours: { orderBy: { weekday: "asc" } },
    },
  });
  return restaurant;
}

export async function toggleItemStock(restaurantId: string, itemId: string, inStock: boolean) {
  const item = await prisma.menuItem.findFirst({
    where: { id: itemId, restaurantId },
  });
  if (!item) return null;
  const updated = await prisma.menuItem.update({
    where: { id: item.id },
    data: { inStock },
    include: itemInclude,
  });
  publishTenantEvent(restaurantId, { type: "menu.updated", payload: updated });
  return updated;
}

export async function upsertMenuItem(
  restaurantId: string,
  data: {
    id?: string;
    categoryId: string;
    title: string;
    description?: string;
    imageUrl?: string;
    basePricePaise: number;
    taxRateBps?: number;
    diet: "VEG" | "NON_VEG" | "EGG";
    prepTimeMins?: number;
    variants?: { name: string; pricePaise: number; isDefault?: boolean }[];
  },
) {
  const category = await prisma.menuCategory.findFirst({
    where: { id: data.categoryId, restaurantId },
  });
  if (!category) throw new Error("Category not found");

  const payload = {
    restaurantId,
    categoryId: data.categoryId,
    title: data.title,
    description: data.description ?? "",
    imageUrl: data.imageUrl,
    basePricePaise: data.basePricePaise,
    taxRateBps: data.taxRateBps ?? 500,
    diet: data.diet,
    prepTimeMins: data.prepTimeMins ?? 20,
  };

  const item = data.id
    ? await prisma.menuItem.update({
        where: { id: data.id },
        data: payload,
      })
    : await prisma.menuItem.create({ data: payload });

  if (data.variants) {
    await prisma.menuVariant.deleteMany({ where: { menuItemId: item.id } });
    if (data.variants.length) {
      await prisma.menuVariant.createMany({
        data: data.variants.map((v) => ({
          menuItemId: item.id,
          name: v.name,
          pricePaise: v.pricePaise,
          isDefault: v.isDefault ?? false,
        })),
      });
    }
  }

  publishTenantEvent(restaurantId, { type: "menu.updated", payload: { id: item.id } });
  return prisma.menuItem.findUnique({ where: { id: item.id }, include: itemInclude });
}

export async function createCategory(restaurantId: string, name: string) {
  const last = await prisma.menuCategory.findFirst({
    where: { restaurantId },
    orderBy: { sortOrder: "desc" },
  });
  const category = await prisma.menuCategory.create({
    data: { restaurantId, name, sortOrder: (last?.sortOrder ?? 0) + 1 },
  });
  publishTenantEvent(restaurantId, { type: "menu.updated" });
  return category;
}
