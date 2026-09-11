import Link from "next/link";
import { requireMembership } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { lowStockItems } from "@/lib/db/inventory";
import { paiseToRupees } from "@/lib/money";
import { Card, CardContent } from "@/components/ui/card";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ restaurant_id: string }>;
}) {
  const { restaurant_id } = await params;
  await requireMembership(restaurant_id);
  const [pending, today, alerts, restaurant] = await Promise.all([
    prisma.order.count({ where: { restaurantId: restaurant_id, status: "PENDING" } }),
    prisma.order.findMany({
      where: {
        restaurantId: restaurant_id,
        placedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    lowStockItems(restaurant_id),
    prisma.restaurant.findUnique({ where: { id: restaurant_id } }),
  ]);
  const sales = today.reduce((s, o) => s + o.totalPaise, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-[0.16em] text-gold uppercase">Live kitchen</p>
        <h1 className="font-display text-3xl font-extrabold">{restaurant?.name}</h1>
        <p className="text-mist">
          Direct store <span className="text-foreground">fooody.in/{restaurant?.slug}</span> · also listed on the Fooody marketplace
        </p>
      </div>
      {alerts.length > 0 && (
        <div className="rounded-2xl border border-flame/40 bg-flame/10 p-4">
          <p className="font-semibold">Low-stock alert</p>
          <p className="text-sm">
            {alerts.map((a) => `${a.name} (${a.onHand}${a.unit})`).join(" · ")}
          </p>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-mist">Pending tickets</p>
            <p className="font-display text-3xl font-bold">{pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-mist">Today&apos;s orders</p>
            <p className="font-display text-3xl font-bold">{today.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-mist">Today&apos;s sales</p>
            <p className="font-display text-3xl font-bold">{paiseToRupees(sales)}</p>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link className="rounded-full bg-gradient-to-br from-flame to-ember px-4 py-2 text-sm font-semibold text-white" href={`/dashboard/${restaurant_id}/pos`}>
          Open counter POS
        </Link>
        <Link className="rounded-full bg-gradient-to-br from-flame to-ember px-4 py-2 text-sm font-semibold text-white" href={`/dashboard/${restaurant_id}/orders`}>
          Open order hub
        </Link>
        <Link className="rounded-full border border-black/10 px-4 py-2 text-sm dark:border-white/10" href={`/dashboard/${restaurant_id}/inventory/requisitions`}>
          Stock requisitions
        </Link>
        <Link className="rounded-full border border-black/10 px-4 py-2 text-sm dark:border-white/10" href={`/${restaurant?.slug}`}>
          View branded storefront
        </Link>
        <Link className="rounded-full border border-black/10 px-4 py-2 text-sm dark:border-white/10" href="/marketplace">
          Marketplace listing
        </Link>
      </div>
    </div>
  );
}
