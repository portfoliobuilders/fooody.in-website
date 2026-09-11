import type { DispatchStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { HttpError } from "@/lib/auth/rbac";
import { publishTenantEvent } from "@/lib/realtime/order-bus";
import { isDeliveryChannel } from "@/lib/dispatch";
import { notifyCustomerStatus } from "@/lib/notify/customer";

const OPEN_DISPATCH: DispatchStatus[] = ["QUOTED", "ASSIGNED", "PICKED_UP", "IN_TRANSIT"];

export async function ensureRiderProfile(userId: string) {
  return prisma.riderProfile.upsert({
    where: { userId },
    update: {},
    create: { userId, shiftStatus: "AVAILABLE" },
  });
}

export async function listAvailableRiderOrders(userId: string, coords?: { lat?: number; lng?: number }) {
  const profile = await ensureRiderProfile(userId);
  if (coords?.lat != null && coords?.lng != null) {
    await prisma.riderProfile.update({
      where: { id: profile.id },
      data: { currentLat: coords.lat, currentLng: coords.lng, shiftStatus: "AVAILABLE" },
    });
  }

  const memberships = await prisma.restaurantMember.findMany({
    where: {
      userId,
      role: { in: ["DELIVERY_DRIVER", "MANAGER", "OWNER", "SUPER_ADMIN"] },
    },
    select: { restaurantId: true },
  });
  const restaurantIds = memberships.map((row) => row.restaurantId);
  if (!restaurantIds.length) return [];

  const orders = await prisma.order.findMany({
    where: {
      restaurantId: { in: restaurantIds },
      status: { in: ["READY", "DISPATCHED"] },
      channel: { in: ["ONLINE_DELIVERY", "SELF_DELIVERY", "WHATSAPP"] },
      OR: [
        { dispatch: null },
        {
          dispatch: {
            status: { in: OPEN_DISPATCH },
            OR: [{ driverUserId: null }, { driverUserId: userId }],
          },
        },
      ],
    },
    include: {
      restaurant: { select: { id: true, name: true, address: true, phone: true } },
      items: true,
      dispatch: true,
    },
    orderBy: { placedAt: "asc" },
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    deliveryAddress: order.deliveryAddress,
    totalPaise: order.totalPaise,
    restaurant: order.restaurant,
    items: order.items.map((item) => ({
      title: item.title,
      quantity: item.quantity,
      variantName: item.variantName,
    })),
    dispatch: order.dispatch
      ? {
          id: order.dispatch.id,
          type: order.dispatch.type,
          status: order.dispatch.status,
          trackingUrl: order.dispatch.trackingUrl,
        }
      : null,
  }));
}

export async function advanceRiderOrder(
  userId: string,
  orderId: string,
  action: "PICKED_UP" | "ARRIVED" | "DELIVERED",
  otp?: string,
) {
  const profile = await ensureRiderProfile(userId);
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { dispatch: true, items: true },
  });
  if (!order?.dispatch) throw new HttpError(404, "Delivery not found");
  if (!isDeliveryChannel(order.channel)) throw new HttpError(400, "Not a delivery ticket");

  const membership = await prisma.restaurantMember.findUnique({
    where: { restaurantId_userId: { restaurantId: order.restaurantId, userId } },
  });
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!membership && !dbUser?.isSuperAdmin) {
    throw new HttpError(403, "No access to this restaurant");
  }

  if (action === "DELIVERED") {
    if (!otp || otp !== order.dispatch.deliveryOtp) {
      throw new HttpError(400, "Proof-of-delivery OTP does not match");
    }
  }

  const dispatchStatus: DispatchStatus =
    action === "PICKED_UP" ? "PICKED_UP" : action === "ARRIVED" ? "IN_TRANSIT" : "DELIVERED";

  const dispatch = await prisma.deliveryDispatch.update({
    where: { id: order.dispatch.id },
    data: {
      status: dispatchStatus,
      driverUserId: userId,
      riderProfileId: profile.id,
      pickedUpAt: action === "PICKED_UP" ? new Date() : order.dispatch.pickedUpAt,
      arrivedAt: action === "ARRIVED" ? new Date() : order.dispatch.arrivedAt,
      deliveredAt: action === "DELIVERED" ? new Date() : order.dispatch.deliveredAt,
    },
  });

  await prisma.riderProfile.update({
    where: { id: profile.id },
    data: {
      shiftStatus: action === "DELIVERED" ? "AVAILABLE" : "ON_DELIVERY",
      activeOrderId: action === "DELIVERED" ? null : order.id,
    },
  });

  if (action === "PICKED_UP" && order.status === "READY") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "DISPATCHED" },
    });
  }
  if (action === "DELIVERED") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  }

  publishTenantEvent(order.restaurantId, { type: "dispatch.updated", payload: dispatch });
  publishTenantEvent(order.restaurantId, { type: "order.updated" });
  const fresh = await prisma.order.findUnique({
    where: { id: order.id },
    include: { dispatch: true, items: true },
  });
  if (fresh) await notifyCustomerStatus(fresh);
  return { order: fresh, dispatch };
}
