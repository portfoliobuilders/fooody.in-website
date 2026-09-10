import type { PaymentGateway } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function listPayments(restaurantId: string, gateway?: PaymentGateway) {
  return prisma.payment.findMany({
    where: { restaurantId, gateway },
    include: { order: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function paymentSummary(restaurantId: string) {
  const payments = await prisma.payment.findMany({
    where: { restaurantId },
    include: { order: true },
  });
  const byGateway = new Map<string, { count: number; amountPaise: number }>();
  let gross = 0;
  let payout = 0;
  let discounts = 0;
  for (const payment of payments) {
    const bucket = byGateway.get(payment.gateway) ?? { count: 0, amountPaise: 0 };
    bucket.count += 1;
    bucket.amountPaise += payment.amountPaise;
    byGateway.set(payment.gateway, bucket);
    gross += payment.order.subtotalPaise;
    payout += payment.order.netPayoutPaise;
    discounts += payment.order.discountPaise;
  }
  return {
    count: payments.length,
    grossPaise: gross,
    payoutPaise: payout,
    discountPaise: discounts,
    byGateway: Object.fromEntries(byGateway),
  };
}

export function paymentsToCsv(
  rows: Awaited<ReturnType<typeof listPayments>>,
) {
  const header = [
    "Order",
    "Placed",
    "Channel",
    "Gateway",
    "Status",
    "Subtotal",
    "Discount",
    "Packaging",
    "Delivery",
    "Platform",
    "GST",
    "Total",
    "Net Payout",
    "Customer",
  ];
  const lines = rows.map((row) =>
    [
      row.order.orderNumber,
      row.createdAt.toISOString(),
      row.order.channel,
      row.gateway,
      row.status,
      (row.order.subtotalPaise / 100).toFixed(2),
      (row.order.discountPaise / 100).toFixed(2),
      (row.order.packagingFeePaise / 100).toFixed(2),
      (row.order.deliveryFeePaise / 100).toFixed(2),
      (row.order.platformFeePaise / 100).toFixed(2),
      (row.order.gstPaise / 100).toFixed(2),
      (row.order.totalPaise / 100).toFixed(2),
      (row.order.netPayoutPaise / 100).toFixed(2),
      row.order.customerName,
    ].join(","),
  );
  return [header.join(","), ...lines].join("\n");
}
