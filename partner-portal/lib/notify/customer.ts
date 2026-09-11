import { prisma } from "@/lib/db/prisma";
import { sendWhatsAppText } from "@/lib/whatsapp/client";
import { paiseToRupees } from "@/lib/money";
import { CHANNEL_LABEL, ORDER_STATUS_LABEL } from "@/lib/tenant/host";

type NotifyOrder = {
  id: string;
  restaurantId: string;
  orderNumber: number;
  status: string;
  channel: string;
  customerName: string;
  customerPhone: string;
  totalPaise: number;
  items?: { quantity: number; title: string; variantName?: string | null }[];
  dispatch?: { trackingUrl: string | null; type: string } | null;
};

function trackUrl(orderId: string) {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${origin.replace(/\/$/, "")}/track/${orderId}`;
}

export async function notifyOrderPlaced(order: NotifyOrder) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: order.restaurantId } });
  if (!restaurant) return;
  const channel = CHANNEL_LABEL[order.channel as keyof typeof CHANNEL_LABEL] ?? order.channel;
  const lines = (order.items ?? [])
    .map((item) => `${item.quantity}× ${item.title}${item.variantName ? ` (${item.variantName})` : ""}`)
    .join("\n");
  const body = [
    `${restaurant.name}: order #${order.orderNumber} received.`,
    channel,
    lines,
    `Total ${paiseToRupees(order.totalPaise)}.`,
    `Track: ${trackUrl(order.id)}`,
    "Kitchen has the ticket. We will update you as it cooks.",
  ]
    .filter(Boolean)
    .join("\n");
  await sendWhatsAppText(order.customerPhone, body);
}

export async function notifyCustomerStatus(order: NotifyOrder) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: order.restaurantId } });
  if (!restaurant) return;

  const status = ORDER_STATUS_LABEL[order.status as keyof typeof ORDER_STATUS_LABEL] ?? order.status;
  const channel = CHANNEL_LABEL[order.channel as keyof typeof CHANNEL_LABEL] ?? order.channel;
  let body = `${restaurant.name}: order #${order.orderNumber} is ${status}. ${channel} · ${paiseToRupees(order.totalPaise)}.`;
  body += ` Track: ${order.dispatch?.trackingUrl ?? trackUrl(order.id)}`;

  const sent = await sendWhatsAppText(order.customerPhone, body);
  if (sent && order.dispatch) {
    await prisma.deliveryDispatch.updateMany({
      where: { orderId: order.id },
      data: { customerNotifiedAt: new Date() },
    });
  }
}
