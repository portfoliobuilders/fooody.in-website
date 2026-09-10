import { OrderBoard } from "@/components/orders/order-board";
import { requireMembership, ORDER_ROLES } from "@/lib/auth/rbac";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ restaurant_id: string }>;
}) {
  const { restaurant_id } = await params;
  await requireMembership(restaurant_id, ORDER_ROLES);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-extrabold">Live orders</h1>
      <p className="text-mist">POS + KDS switchboard. New tickets chime instantly over SSE.</p>
      <OrderBoard restaurantId={restaurant_id} />
    </div>
  );
}
