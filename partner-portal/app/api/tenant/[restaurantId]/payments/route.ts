import type { PaymentGateway } from "@prisma/client";
import { jsonError, requireMembership, FINANCE_ROLES } from "@/lib/auth/rbac";
import { listPayments, paymentSummary, paymentsToCsv } from "@/lib/db/payments";

type Params = { params: Promise<{ restaurantId: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, FINANCE_ROLES);
    const url = new URL(request.url);
    const gateway = url.searchParams.get("gateway") as PaymentGateway | null;
    const format = url.searchParams.get("format");
    const payments = await listPayments(restaurantId, gateway || undefined);
    if (format === "csv") {
      const csv = paymentsToCsv(payments);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="fooody-ledger-${restaurantId}.csv"`,
        },
      });
    }
    return Response.json({
      payments,
      summary: await paymentSummary(restaurantId),
    });
  } catch (error) {
    return jsonError(error);
  }
}
