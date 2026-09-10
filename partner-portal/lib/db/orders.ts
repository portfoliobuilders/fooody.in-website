import {
  type FulfillmentChannel,
  type InventoryMoveReason,
  type OrderStatus,
  type Prisma,
  type TableStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { settleOrderMoney, gstFromBps } from "@/lib/money";
import { publishTenantEvent } from "@/lib/realtime/order-bus";
import { dispatchOrder, isDeliveryChannel } from "@/lib/dispatch";
import { notifyCustomerStatus } from "@/lib/notify/customer";

const orderInclude = {
  items: true,
  payment: true,
  table: true,
  dispatch: true,
} satisfies Prisma.OrderInclude;

export type OrderWithDetails = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export async function listOrders(
  restaurantId: string,
  filters?: { channel?: FulfillmentChannel; status?: OrderStatus },
) {
  return prisma.order.findMany({
    where: {
      restaurantId,
      channel: filters?.channel,
      status: filters?.status,
    },
    include: orderInclude,
    orderBy: { placedAt: "desc" },
  });
}

export async function getOrder(restaurantId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, restaurantId },
    include: orderInclude,
  });
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "ACCEPTED",
  ACCEPTED: "PREPARING",
  PREPARING: "READY",
  READY: "DISPATCHED",
  DISPATCHED: "COMPLETED",
};

export function suggestedNext(status: OrderStatus) {
  return NEXT_STATUS[status] ?? null;
}

async function applyRecipeDelta(
  tx: Prisma.TransactionClient,
  restaurantId: string,
  orderId: string,
  items: { menuItemId: string | null; quantity: number }[],
  reason: InventoryMoveReason,
  multiplier: 1 | -1,
) {
  for (const line of items) {
    if (!line.menuItemId) continue;
    const recipes = await tx.recipeLine.findMany({
      where: { menuItemId: line.menuItemId },
    });
    for (const recipe of recipes) {
      const qty = recipe.qtyPerPortion * line.quantity * multiplier;
      await tx.inventoryItem.update({
        where: { id: recipe.inventoryItemId },
        data: { onHand: { increment: qty } },
      });
      await tx.inventoryMovement.create({
        data: {
          restaurantId,
          inventoryItemId: recipe.inventoryItemId,
          orderId,
          qty,
          reason,
        },
      });
    }
  }
}

export async function transitionOrder(
  restaurantId: string,
  orderId: string,
  status: OrderStatus,
  cancelReason?: string,
) {
  const existing = await prisma.order.findFirst({
    where: { id: orderId, restaurantId },
    include: { items: true, table: true, dispatch: true, restaurant: true },
  });
  if (!existing) return null;

  const updated = await prisma.$transaction(async (tx) => {
    if (status === "ACCEPTED" && !existing.inventoryDeducted) {
      await applyRecipeDelta(
        tx,
        restaurantId,
        existing.id,
        existing.items,
        "ORDER_ACCEPTED",
        -1,
      );
    }
    if (status === "CANCELLED" && existing.inventoryDeducted) {
      await applyRecipeDelta(
        tx,
        restaurantId,
        existing.id,
        existing.items,
        "ORDER_CANCELLED",
        1,
      );
    }

    const order = await tx.order.update({
      where: { id: existing.id },
      data: {
        status,
        acceptedAt: status === "ACCEPTED" ? new Date() : existing.acceptedAt,
        readyAt: status === "READY" ? new Date() : existing.readyAt,
        completedAt: status === "COMPLETED" ? new Date() : existing.completedAt,
        cancelledAt: status === "CANCELLED" ? new Date() : existing.cancelledAt,
        cancelReason:
          status === "CANCELLED"
            ? cancelReason ?? "Cancelled by restaurant"
            : existing.cancelReason,
        inventoryDeducted:
          status === "ACCEPTED"
            ? true
            : status === "CANCELLED"
              ? false
              : existing.inventoryDeducted,
        billPrintedAt:
          status === "READY" && existing.channel === "DINE_IN"
            ? new Date()
            : existing.billPrintedAt,
      },
      include: orderInclude,
    });

    if (existing.tableId) {
      const nextTable: TableStatus =
        status === "CANCELLED" || status === "COMPLETED"
          ? "VACANT"
          : status === "READY" || status === "DISPATCHED"
            ? "BILL_PRINTED"
            : "OCCUPIED";
      await tx.diningTable.update({
        where: { id: existing.tableId },
        data: { status: nextTable },
      });
    }

    return order;
  });

  publishTenantEvent(restaurantId, { type: "order.updated", payload: updated });
  if (status === "ACCEPTED" || status === "CANCELLED") {
    publishTenantEvent(restaurantId, { type: "inventory.updated" });
  }
  if (existing.tableId) {
    publishTenantEvent(restaurantId, { type: "table.updated" });
  }

  if (status === "READY" && isDeliveryChannel(existing.channel) && !existing.dispatch) {
    await dispatchOrder(updated.id);
  }

  await notifyCustomerStatus(updated);
  return getOrder(restaurantId, updated.id);
}

type IncomingLine = {
  menuItemId: string;
  variantName?: string;
  quantity: number;
  notes?: string;
  modifiers?: { name: string; pricePaise: number }[];
};

export async function createDemoOrder(restaurantId: string) {
  const item = await prisma.menuItem.findFirst({
    where: { restaurantId, inStock: true },
    include: { variants: true },
  });
  if (!item) throw new Error("No in-stock items to simulate");
  const variant = item.variants.find((v) => v.isDefault) ?? item.variants[0];
  return createOrder({
    restaurantId,
    channel: "ONLINE_DELIVERY",
    customerName: "Walk-in test guest",
    customerPhone: "9000000000",
    customerNotes: "Simulated from the POS switchboard",
    deliveryAddress: "12 MG Road, Kochi",
    paymentGateway: "RAZORPAY",
    paymentStatus: "PAID",
    lines: [
      {
        menuItemId: item.id,
        variantName: variant?.name,
        quantity: 1,
        modifiers: [],
      },
    ],
  });
}

function couponMatchesChannel(couponChannel: string, orderChannel: FulfillmentChannel) {
  if (couponChannel === "ALL") return true;
  if (couponChannel === orderChannel) return true;
  if (couponChannel === "ONLINE_DELIVERY" && orderChannel === "WHATSAPP") return true;
  return false;
}

export type OrderPaymentStatus = "PENDING" | "CASH_ON_DELIVERY" | "PAID";

export async function createOrder(input: {
  restaurantId: string;
  channel: FulfillmentChannel;
  customerName: string;
  customerPhone: string;
  customerNotes?: string;
  deliveryAddress?: string;
  tableNumber?: string;
  couponCode?: string;
  paymentGateway?: "RAZORPAY" | "CASHFREE" | "STRIPE" | "UPI" | "CASH";
  /** Defaults to PENDING. PAID is only for verified webhooks or authenticated staff. */
  paymentStatus?: OrderPaymentStatus;
  lines: IncomingLine[];
  marketplace?: boolean;
}) {
  const paymentStatus: OrderPaymentStatus = input.paymentStatus ?? "PENDING";
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: input.restaurantId },
    include: { commissionRules: true },
  });
  if (!restaurant) throw new Error("Restaurant not found");

  const table = input.tableNumber
    ? await prisma.diningTable.findUnique({
        where: {
          restaurantId_number: {
            restaurantId: input.restaurantId,
            number: input.tableNumber,
          },
        },
      })
    : null;

  const items = await prisma.menuItem.findMany({
    where: {
      restaurantId: input.restaurantId,
      id: { in: input.lines.map((l) => l.menuItemId) },
    },
    include: { variants: true },
  });

  const built = input.lines.map((line) => {
    const item = items.find((i) => i.id === line.menuItemId);
    if (!item || !item.inStock) {
      throw new Error("An item is unavailable");
    }
    const variant = line.variantName
      ? item.variants.find((v) => v.name === line.variantName)
      : item.variants.find((v) => v.isDefault);
    if (variant && !variant.inStock) {
      throw new Error(`${item.title} (${variant.name}) is unavailable`);
    }
    const unit = variant?.pricePaise ?? item.basePricePaise;
    const mods = line.modifiers ?? [];
    const lineTotal = (unit + mods.reduce((s, m) => s + m.pricePaise, 0)) * line.quantity;
    return {
      item,
      variantName: variant?.name ?? line.variantName,
      quantity: line.quantity,
      unitPricePaise: unit,
      lineTotalPaise: lineTotal,
      notes: line.notes ?? "",
      modifiers: mods,
    };
  });

  const subtotalPaise = built.reduce((s, l) => s + l.lineTotalPaise, 0);
  let discountPaise = 0;
  if (input.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: {
        restaurantId_code: {
          restaurantId: input.restaurantId,
          code: input.couponCode.toUpperCase(),
        },
      },
    });
    if (coupon?.isActive && subtotalPaise >= coupon.minOrderPaise) {
      if (couponMatchesChannel(coupon.channel, input.channel)) {
        discountPaise =
          coupon.type === "PERCENTAGE"
            ? Math.round((subtotalPaise * coupon.value) / 100)
            : coupon.value;
        if (coupon.maxDiscountPaise) {
          discountPaise = Math.min(discountPaise, coupon.maxDiscountPaise);
        }
      }
    }
  }

  const gstPaise = built.reduce(
    (s, l) => s + gstFromBps(l.lineTotalPaise, l.item.taxRateBps),
    0,
  );
  const packagingFeePaise = input.channel === "DINE_IN" ? 0 : 1500;
  const deliveryFeePaise = isDeliveryChannel(input.channel) ? 4000 : 0;
  const rule =
    restaurant.commissionRules.find((r) => r.channel === input.channel) ??
    restaurant.commissionRules.find((r) => r.channel == null);
  const commissionBps = rule?.commissionBps ?? (input.marketplace ? restaurant.commissionBps : 0);
  const platformFeePaise =
    (rule?.platformFeePaise ?? 0) + Math.round((subtotalPaise * commissionBps) / 10000);
  const money = settleOrderMoney({
    subtotalPaise,
    discountPaise,
    packagingFeePaise,
    deliveryFeePaise,
    platformFeePaise,
    gstPaise,
    gatewayFeePaise: paymentStatus === "PAID" ? Math.round(subtotalPaise * 0.018) : 0,
  });

  const order = await prisma.$transaction(async (tx) => {
    const updatedRestaurant = await tx.restaurant.update({
      where: { id: input.restaurantId },
      data: { nextOrderNumber: { increment: 1 } },
    });
    if (table) {
      await tx.diningTable.update({
        where: { id: table.id },
        data: { status: "OCCUPIED" },
      });
      await tx.tableSession.updateMany({
        where: { tableId: table.id, status: "OPEN" },
        data: { status: "CHECKED_OUT", closedAt: new Date() },
      });
    }
    return tx.order.create({
      data: {
        restaurantId: input.restaurantId,
        orderNumber: updatedRestaurant.nextOrderNumber,
        channel: input.channel,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerNotes: input.customerNotes ?? "",
        deliveryAddress: input.deliveryAddress ?? "",
        tableId: table?.id,
        couponCode: input.couponCode?.toUpperCase(),
        subtotalPaise,
        ...money,
        items: {
          create: built.map((line) => ({
            menuItemId: line.item.id,
            title: line.item.title,
            variantName: line.variantName,
            quantity: line.quantity,
            unitPricePaise: line.unitPricePaise,
            lineTotalPaise: line.lineTotalPaise,
            notes: line.notes,
            diet: line.item.diet,
            modifiersJson: line.modifiers,
          })),
        },
        payment: {
          create: {
            restaurantId: input.restaurantId,
            gateway: input.paymentGateway ?? (input.channel === "DINE_IN" ? "UPI" : "RAZORPAY"),
            status: paymentStatus,
            amountPaise: money.totalPaise,
            reference: paymentStatus === "CASH_ON_DELIVERY" ? null : `pay_${Date.now()}`,
            settled: paymentStatus === "PAID",
          },
        },
      },
      include: orderInclude,
    });
  });

  publishTenantEvent(input.restaurantId, { type: "order.created", payload: order });
  if (table) publishTenantEvent(input.restaurantId, { type: "table.updated" });
  return order;
}

export async function printBill(restaurantId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, restaurantId },
  });
  if (!order) return null;
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { billPrintedAt: new Date() },
    include: orderInclude,
  });
  if (order.tableId) {
    await prisma.diningTable.update({
      where: { id: order.tableId },
      data: { status: "BILL_PRINTED" },
    });
    publishTenantEvent(restaurantId, { type: "table.updated" });
  }
  publishTenantEvent(restaurantId, { type: "order.updated", payload: updated });
  return updated;
}
