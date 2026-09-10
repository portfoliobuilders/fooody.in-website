import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { CHANNEL_LABEL, DISPATCH_TYPE_LABEL, ORDER_STATUS_LABEL } from "@/lib/tenant/host";
import { paiseToRupees } from "@/lib/money";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { restaurant: true, dispatch: true },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 py-10">
      <p className="text-xs uppercase tracking-[0.16em] text-gold">{order.restaurant.name}</p>
      <h1 className="font-display mt-2 text-3xl font-extrabold">Order #{order.orderNumber}</h1>
      <p className="mt-2 text-mist">
        {ORDER_STATUS_LABEL[order.status]} · {CHANNEL_LABEL[order.channel]} · {paiseToRupees(order.totalPaise)}
      </p>
      {order.dispatch && (
        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-obsidian">
          <p className="text-sm text-mist">Dispatch</p>
          <p className="font-semibold">{DISPATCH_TYPE_LABEL[order.dispatch.type]}</p>
          <p className="text-sm">{order.dispatch.status.replaceAll("_", " ")}</p>
        </div>
      )}
      <p className="mt-6 text-sm text-mist">Keep this page open — kitchen and rider updates land on the same ticket.</p>
    </div>
  );
}
