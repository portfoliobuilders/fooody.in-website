import { StaffPanel } from "@/components/promotions/engines";
import { requireMembership } from "@/lib/auth/rbac";

export default async function StaffPage({
  params,
}: {
  params: Promise<{ restaurant_id: string }>;
}) {
  const { restaurant_id } = await params;
  await requireMembership(restaurant_id, ["OWNER"]);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-extrabold">Staff & roles</h1>
      <p className="text-mist">OWNER, MANAGER, KITCHEN_STAFF, BILLING_CASHIER, DELIVERY_DRIVER — scoped to this restaurant. SUPER_ADMIN is platform-wide.</p>
      <StaffPanel restaurantId={restaurant_id} />
    </div>
  );
}
