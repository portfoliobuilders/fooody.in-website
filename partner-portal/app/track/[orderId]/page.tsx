import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { TrackTicket } from "@/components/storefront/track-ticket";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payment: true,
      table: true,
      dispatch: true,
      restaurant: {
        select: {
          name: true,
          slug: true,
          phone: true,
          whatsappPhone: true,
          brandPrimary: true,
        },
      },
    },
  });
  if (!order) notFound();

  return (
    <TrackTicket
      orderId={order.id}
      initial={{
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        channel: order.channel,
        customerName: order.customerName,
        customerNotes: order.customerNotes,
        deliveryAddress: order.deliveryAddress,
        placedAt: order.placedAt.toISOString(),
        subtotalPaise: order.subtotalPaise,
        discountPaise: order.discountPaise,
        packagingFeePaise: order.packagingFeePaise,
        deliveryFeePaise: order.deliveryFeePaise,
        gstPaise: order.gstPaise,
        totalPaise: order.totalPaise,
        items: order.items,
        payment: order.payment ? { gateway: order.payment.gateway, status: order.payment.status } : null,
        table: order.table ? { number: order.table.number } : null,
        restaurant: order.restaurant,
      }}
    />
  );
}
