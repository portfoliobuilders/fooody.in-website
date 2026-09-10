import { TableMatrix } from "@/components/tables/table-matrix";
import { requireMembership, CASH_ROLES } from "@/lib/auth/rbac";

export default async function TablesPage({
  params,
}: {
  params: Promise<{ restaurant_id: string }>;
}) {
  const { restaurant_id } = await params;
  await requireMembership(restaurant_id, CASH_ROLES);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-extrabold">Table matrix</h1>
      <p className="text-mist">Live vacant / occupied / bill / reserved grid. Tap a table to download `/qr/[slug]/table/[n]`.</p>
      <TableMatrix restaurantId={restaurant_id} />
    </div>
  );
}
