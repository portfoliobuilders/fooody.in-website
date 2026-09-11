import type { InventoryMoveReason, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { publishTenantEvent } from "@/lib/realtime/order-bus";

type OrderLine = { menuItemId: string | null; quantity: number };

/**
 * Recipe-level stock movement. Multiplier -1 deducts on accept, +1 restores on cancel.
 * Uses existing InventoryItem + RecipeLine (qtyPerPortion), not a parallel raw-material table.
 */
export async function applyRecipeInventoryDelta(
  tx: Prisma.TransactionClient,
  restaurantId: string,
  orderId: string,
  items: OrderLine[],
  reason: InventoryMoveReason,
  multiplier: 1 | -1,
) {
  const reductions = new Map<string, number>();

  for (const line of items) {
    if (!line.menuItemId) continue;
    const recipes = await tx.recipeLine.findMany({
      where: { menuItemId: line.menuItemId },
    });
    for (const recipe of recipes) {
      const qty = recipe.qtyPerPortion * line.quantity * multiplier;
      reductions.set(recipe.inventoryItemId, (reductions.get(recipe.inventoryItemId) ?? 0) + qty);
    }
  }

  for (const [inventoryItemId, qty] of reductions) {
    const updated = await tx.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { onHand: { increment: qty } },
    });
    await tx.inventoryMovement.create({
      data: {
        restaurantId,
        inventoryItemId,
        orderId,
        qty,
        reason,
      },
    });

    if (multiplier !== -1) continue;

    const onHand = Number(updated.onHand);
    if (onHand > Number(updated.lowStockAt)) continue;

    const open = await tx.inventoryAlert.findFirst({
      where: {
        restaurantId,
        inventoryItemId,
        acknowledged: false,
        alertType: onHand <= 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
      },
    });
    if (open) continue;

    await tx.inventoryAlert.create({
      data: {
        restaurantId,
        inventoryItemId,
        alertType: onHand <= 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
        message: `CRITICAL: ${updated.name} has reached ${onHand} ${updated.unit}. Requisition recommended.`,
      },
    });
  }
}

/** Standalone entry used when KDS / POS accepts a ticket. */
export async function processOrderInventorySOP(orderId: string, restaurantId: string) {
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, restaurantId },
      include: { items: true },
    });
    if (!order) throw new Error("Order not found");
    if (order.inventoryDeducted) return { skipped: true as const, orderId };
    await applyRecipeInventoryDelta(
      tx,
      restaurantId,
      order.id,
      order.items,
      "ORDER_ACCEPTED",
      -1,
    );
    await tx.order.update({
      where: { id: order.id },
      data: { inventoryDeducted: true },
    });
    return { skipped: false as const, orderId };
  });
  publishTenantEvent(restaurantId, { type: "inventory.updated" });
  return result;
}
