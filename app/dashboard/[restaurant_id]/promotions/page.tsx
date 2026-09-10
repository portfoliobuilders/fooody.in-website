import { CouponBuilder } from "@/components/promotions/engines";
import { requireMembership, MENU_ROLES } from "@/lib/auth/rbac";

export default async function PromotionsPage({
  params,
}: {
  params: Promise<{ restaurant_id: string }>;
}) {
  const { restaurant_id } = await params;
  await requireMembership(restaurant_id, MENU_ROLES);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-extrabold">Promotions</h1>
      <p className="text-mist">Percentage or flat coupons, min order, cap, and dine-in vs delivery rules.</p>
      <CouponBuilder restaurantId={restaurant_id} />
    </div>
  );
}
