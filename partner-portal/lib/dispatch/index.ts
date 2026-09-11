import type { DispatchType, FulfillmentChannel, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { publishTenantEvent } from "@/lib/realtime/order-bus";
import { notifyCustomerStatus } from "@/lib/notify/customer";
import { inHouseProvider } from "./providers/in-house";
import { uberDirectProvider } from "./providers/uber-direct";
import { porterProvider } from "./providers/porter";
import { fooodyPoolProvider } from "./providers/fooody-pool";
import type { DispatchProvider, DispatchRequest } from "./types";
import { isDeliveryChannel } from "./types";

export { isDeliveryChannel } from "./types";

const providers: Record<DispatchType, DispatchProvider> = {
  IN_HOUSE: inHouseProvider,
  UBER_DIRECT: uberDirectProvider,
  PORTER: porterProvider,
  FOOODY_POOL: fooodyPoolProvider,
};

function resolveType(channel: FulfillmentChannel, preferred?: DispatchType | null): DispatchType {
  if (preferred) return preferred;
  if (channel === "SELF_DELIVERY") return "IN_HOUSE";
  if (channel === "ONLINE_DELIVERY" && uberDirectProvider.isConfigured()) return "UBER_DIRECT";
  if (channel === "WHATSAPP") return "IN_HOUSE";
  return "IN_HOUSE";
}

export async function quoteDispatch(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { restaurant: true },
  });
  if (!order) throw new Error("Order not found");
  const req = toRequest(order);
  const type = resolveType(order.channel, order.restaurant.defaultDispatchType);
  return providers[type].quote(req);
}

export async function dispatchOrder(orderId: string, typeOverride?: DispatchType) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { restaurant: true, dispatch: true },
  });
  if (!order) throw new Error("Order not found");
  if (!isDeliveryChannel(order.channel)) {
    return order.dispatch;
  }
  if (order.dispatch && order.dispatch.status !== "FAILED" && order.dispatch.status !== "CANCELLED") {
    return order.dispatch;
  }

  const type = resolveType(order.channel, typeOverride ?? order.restaurant.defaultDispatchType);
  const result = await providers[type].create(toRequest(order));
  const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));

  const dispatch = await prisma.deliveryDispatch.upsert({
    where: { orderId: order.id },
    update: {
      type: result.type,
      status: result.status,
      trackingUrl: result.trackingUrl,
      providerJobId: result.providerJobId,
      providerQuotePaise: result.providerQuotePaise,
      assignedAt: new Date(),
      deliveryOtp,
      metadataJson: (result.metadata ?? {}) as Prisma.InputJsonValue,
    },
    create: {
      restaurantId: order.restaurantId,
      orderId: order.id,
      type: result.type,
      status: result.status,
      trackingUrl: result.trackingUrl,
      providerJobId: result.providerJobId,
      providerQuotePaise: result.providerQuotePaise,
      assignedAt: new Date(),
      deliveryOtp,
      metadataJson: (result.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });

  publishTenantEvent(order.restaurantId, { type: "dispatch.updated", payload: dispatch });
  await notifyCustomerStatus({
    ...order,
    status: "DISPATCHED",
    dispatch,
  });
  return dispatch;
}

function toRequest(order: {
  id: string;
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  restaurant: { address: string; name: string };
}): DispatchRequest {
  return {
    orderId: order.id,
    restaurantId: order.restaurantId,
    pickupAddress: order.restaurant.address,
    dropAddress: order.deliveryAddress || order.restaurant.address,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
  };
}
