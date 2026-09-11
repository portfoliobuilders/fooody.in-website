import { PosTerminal } from "@/components/pos/pos-terminal";
import { requireMembership, CASH_ROLES } from "@/lib/auth/rbac";

export default async function PosPage({
  params,
}: {
  params: Promise<{ restaurant_id: string }>;
}) {
  const { restaurant_id } = await params;
  await requireMembership(restaurant_id, CASH_ROLES);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-extrabold">Counter POS</h1>
      <p className="text-mist">
        Quick-tap billing. Kitchen receives a live KOT; recipe stock deducts when the ticket is accepted.
      </p>
      <PosTerminal restaurantId={restaurant_id} />
    </div>
  );
}
