import { MenuManager } from "@/components/menu/menu-manager";
import { requireMembership, MENU_ROLES } from "@/lib/auth/rbac";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ restaurant_id: string }>;
}) {
  const { restaurant_id } = await params;
  await requireMembership(restaurant_id, MENU_ROLES);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-extrabold">Menu catalog</h1>
      <p className="text-mist">Categories, variants, modifiers, GST, and instant 86-toggles.</p>
      <MenuManager restaurantId={restaurant_id} />
    </div>
  );
}
