import { ReservationDesk } from "@/components/tables/table-matrix";
import { requireMembership, CASH_ROLES } from "@/lib/auth/rbac";

export default async function ReservationsPage({
  params,
}: {
  params: Promise<{ restaurant_id: string }>;
}) {
  const { restaurant_id } = await params;
  await requireMembership(restaurant_id, CASH_ROLES);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-extrabold">Reservations</h1>
      <p className="text-mist">Upcoming covers — confirm, seat, or cancel.</p>
      <ReservationDesk restaurantId={restaurant_id} />
    </div>
  );
}
