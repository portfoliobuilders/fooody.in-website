import { RequisitionBoard } from "@/components/inventory/requisition-board";
import { requireMembership, KITCHEN_ROLES } from "@/lib/auth/rbac";

export default async function RequisitionsPage({
  params,
}: {
  params: Promise<{ restaurant_id: string }>;
}) {
  const { restaurant_id } = await params;
  await requireMembership(restaurant_id, KITCHEN_ROLES);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-extrabold">Stock requisitions</h1>
      <p className="text-mist">
        Restock from a sister kitchen when they have surplus, or raise an external purchase for owner approval.
      </p>
      <RequisitionBoard restaurantId={restaurant_id} />
    </div>
  );
}
