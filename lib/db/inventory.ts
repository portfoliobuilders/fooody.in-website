import type { InventoryUnit } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { publishTenantEvent } from "@/lib/realtime/order-bus";

export function parseInventoryUnit(raw: string): InventoryUnit {
  const value = raw.trim().toUpperCase();
  if (value === "KG" || value === "KILO" || value === "KILOS") return "KG";
  if (value === "G" || value === "GM" || value === "GRAM") return "G";
  if (value === "L" || value === "LT" || value === "LITRE" || value === "LITER") return "L";
  if (value === "ML") return "ML";
  return "UNIT";
}

export async function listInventory(restaurantId: string) {
  return prisma.inventoryItem.findMany({
    where: { restaurantId },
    include: { recipeLines: { include: { menuItem: true } }, movements: { take: 8, orderBy: { createdAt: "desc" } } },
    orderBy: { name: "asc" },
  });
}

export async function lowStockItems(restaurantId: string) {
  const items = await prisma.inventoryItem.findMany({ where: { restaurantId } });
  return items.filter((item) => item.onHand <= item.lowStockAt);
}

export async function upsertInventory(
  restaurantId: string,
  data: { id?: string; name: string; unit: string | InventoryUnit; onHand: number; lowStockAt: number },
) {
  const unit = typeof data.unit === "string" ? parseInventoryUnit(data.unit) : data.unit;
  const payload = {
    restaurantId,
    name: data.name,
    unit,
    onHand: data.onHand,
    lowStockAt: data.lowStockAt,
  };
  const item = data.id
    ? await prisma.inventoryItem.update({ where: { id: data.id }, data: payload })
    : await prisma.inventoryItem.create({ data: payload });
  publishTenantEvent(restaurantId, { type: "inventory.updated" });
  return item;
}

export async function mapRecipe(
  restaurantId: string,
  menuItemId: string,
  inventoryItemId: string,
  qtyPerPortion: number,
) {
  const [item, inv] = await Promise.all([
    prisma.menuItem.findFirst({ where: { id: menuItemId, restaurantId } }),
    prisma.inventoryItem.findFirst({ where: { id: inventoryItemId, restaurantId } }),
  ]);
  if (!item || !inv) throw new Error("Item not found for this restaurant");
  const line = await prisma.recipeLine.upsert({
    where: { menuItemId_inventoryItemId: { menuItemId, inventoryItemId } },
    update: { qtyPerPortion },
    create: { menuItemId, inventoryItemId, qtyPerPortion },
  });
  publishTenantEvent(restaurantId, { type: "inventory.updated" });
  return line;
}
