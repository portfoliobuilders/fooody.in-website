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
  dispatch?: { trackingUrl: string | null; type: string } | null;
};

export async function notifyCustomerStatus(order: NotifyOrder) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: order.restaurantId } });
  if (!restaurant) return;

  const status = ORDER_STATUS_LABEL[order.status as keyof typeof ORDER_STATUS_LABEL] ?? order.status;
  const channel = CHANNEL_LABEL[order.channel as keyof typeof CHANNEL_LABEL] ?? order.channel;
  let body = `${restaurant.name}: order #${order.orderNumber} is ${status}. ${channel} · ${paiseToRupees(order.totalPaise)}.`;
  if (order.dispatch?.trackingUrl) {
    body += ` Track: ${order.dispatch.trackingUrl}`;
  }

  const sent = await sendWhatsAppText(order.customerPhone, body);
  if (sent && order.dispatch) {
    await prisma.deliveryDispatch.updateMany({
      where: { orderId: order.id },
      data: { customerNotifiedAt: new Date() },
    });
  }
}
