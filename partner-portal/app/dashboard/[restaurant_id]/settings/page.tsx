import { RestaurantSettings } from "@/components/settings/restaurant-settings";
import { requireMembership, MUTATE_ROLES } from "@/lib/auth/rbac";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ restaurant_id: string }>;
}) {
  const { restaurant_id } = await params;
  await requireMembership(restaurant_id, MUTATE_ROLES);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-extrabold">Store & listing</h1>
      <p className="text-mist">
        Change menu hours, brand colours, UPI, WhatsApp and Fooody marketplace listing anytime. Table QR lives under Tables.
      </p>
      <RestaurantSettings restaurantId={restaurant_id} />
    </div>
  );
}
