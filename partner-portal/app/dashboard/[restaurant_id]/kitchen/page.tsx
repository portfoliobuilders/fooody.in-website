import { KdsBoard } from "@/components/kitchen/kds-board";
import { requireMembership, KITCHEN_ROLES } from "@/lib/auth/rbac";

export default async function KitchenPage({
  params,
}: {
  params: Promise<{ restaurant_id: string }>;
}) {
  const { restaurant_id } = await params;
  await requireMembership(restaurant_id, KITCHEN_ROLES);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-extrabold">Kitchen display</h1>
      <p className="text-mist">New → In kitchen → Ready. Packaging a delivery ticket fires dispatch automatically.</p>
      <KdsBoard restaurantId={restaurant_id} />
    </div>
  );
}