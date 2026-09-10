import { PaymentsLedger } from "@/components/payments/ledger";
import { requireMembership, FINANCE_ROLES } from "@/lib/auth/rbac";

export default async function PaymentsPage({
  params,
}: {
  params: Promise<{ restaurant_id: string }>;
}) {
  const { restaurant_id } = await params;
  await requireMembership(restaurant_id, FINANCE_ROLES);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-extrabold">Settlement ledger</h1>
      <p className="text-mist">Razorpay, Stripe, UPI, and cash — with order-level GST and net payout.</p>
      <PaymentsLedger restaurantId={restaurant_id} />
    </div>
  );
}
