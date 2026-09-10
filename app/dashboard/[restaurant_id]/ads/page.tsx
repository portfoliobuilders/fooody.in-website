import { AdManager } from "@/components/promotions/engines";
import { requireMembership, MENU_ROLES } from "@/lib/auth/rbac";

export default async function AdsPage({
  params,
}: {
  params: Promise<{ restaurant_id: string }>;
}) {
  const { restaurant_id } = await params;
  await requireMembership(restaurant_id, MENU_ROLES);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-extrabold">Fooody ad engine</h1>
      <p className="text-mist">Self-serve daily budgets that lift marketplace ranking.</p>
      <AdManager restaurantId={restaurant_id} />
    </div>
  );
}
