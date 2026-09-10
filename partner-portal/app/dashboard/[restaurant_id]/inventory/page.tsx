import { InventoryBoard } from "@/components/payments/ledger";
import { requireMembership, KITCHEN_ROLES } from "@/lib/auth/rbac";

export default async function InventoryPage({
  params,
}: {
  params: Promise<{ restaurant_id: string }>;
}) {
  const { restaurant_id } = await params;
  await requireMembership(restaurant_id, KITCHEN_ROLES);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-extrabold">Inventory & recipes</h1>
      <p className="text-mist">Stock deducts the moment a ticket is accepted, using recipe mapping.</p>
      <InventoryBoard restaurantId={restaurant_id} />
    </div>
  );
}
