"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { paiseToRupees } from "@/lib/money";

type PaymentRow = {
  id: string;
  gateway: string;
  status: string;
  amountPaise: number;
  createdAt: string;
  order: {
    orderNumber: number;
    channel: string;
    customerName: string;
    subtotalPaise: number;
    discountPaise: number;
    packagingFeePaise: number;
    deliveryFeePaise: number;
    platformFeePaise: number;
    gstPaise: number;
    netPayoutPaise: number;
    totalPaise: number;
  };
};

export function PaymentsLedger({ restaurantId }: { restaurantId: string }) {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [summary, setSummary] = useState<{
    count: number;
    grossPaise: number;
    payoutPaise: number;
    byGateway: Record<string, { count: number; amountPaise: number }>;
  } | null>(null);

  async function load() {
    const res = await fetch(`/api/tenant/${restaurantId}/payments`);
    const data = await res.json();
    setPayments(data.payments ?? []);
    setSummary(data.summary ?? null);
  }

  useEffect(() => {
    void load();
  }, [restaurantId]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-mist">Gross captured</p>
            <p className="font-display text-2xl font-bold">{paiseToRupees(summary?.grossPaise ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-mist">Net payout</p>
            <p className="font-display text-2xl font-bold">{paiseToRupees(summary?.payoutPaise ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-mist">Transactions</p>
            <p className="font-display text-2xl font-bold">{summary?.count ?? 0}</p>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(summary?.byGateway ?? {}).map(([gateway, bucket]) => (
          <Card key={gateway} className="px-4 py-3">
            <p className="text-xs uppercase text-mist">{gateway}</p>
            <p className="font-semibold">
              {paiseToRupees(bucket.amountPaise)} · {bucket.count}
            </p>
          </Card>
        ))}
        <Button asChild variant="outline">
          <a href={`/api/tenant/${restaurantId}/payments?format=csv`}>Export CSV / Excel</a>
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-black/8 dark:border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-black/5 text-xs uppercase text-mist dark:bg-white/5">
            <tr>
              {["Order", "Guest", "Gateway", "Status", "GST", "Total", "Net payout"].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.map((row) => (
              <tr key={row.id} className="border-t border-black/5 dark:border-white/10">
                <td className="px-3 py-2">#{row.order.orderNumber}</td>
                <td className="px-3 py-2">{row.order.customerName}</td>
                <td className="px-3 py-2">{row.gateway}</td>
                <td className="px-3 py-2">{row.status}</td>
                <td className="px-3 py-2">{paiseToRupees(row.order.gstPaise)}</td>
                <td className="px-3 py-2">{paiseToRupees(row.order.totalPaise)}</td>
                <td className="px-3 py-2 font-semibold">{paiseToRupees(row.order.netPayoutPaise)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function InventoryBoard({ restaurantId }: { restaurantId: string }) {
  const [items, setItems] = useState<
    { id: string; name: string; unit: string; onHand: number; lowStockAt: number; recipeLines: { qtyPerPortion: number; menuItem: { title: string } }[] }[]
  >([]);

  async function load() {
    const res = await fetch(`/api/tenant/${restaurantId}/inventory`);
    const data = await res.json();
    setItems(data.items ?? []);
  }

  useEffect(() => {
    void load();
  }, [restaurantId]);

  async function add() {
    const name = prompt("Ingredient?");
    const unit = prompt("Unit? (kg / L)", "kg");
    const onHand = prompt("On hand?", "10");
    const low = prompt("Low-stock at?", "4");
    if (!name || !unit || !onHand || !low) return;
    await fetch(`/api/tenant/${restaurantId}/inventory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, unit, onHand: Number(onHand), lowStockAt: Number(low) }),
    });
    void load();
  }

  const alerts = items.filter((i) => i.onHand <= i.lowStockAt);

  return (
    <div className="space-y-4">
      {alerts.length > 0 && (
        <div className="rounded-2xl border border-flame/40 bg-flame/10 p-4">
          <p className="font-semibold text-flame">Low stock — kitchen risk</p>
          <p className="text-sm">
            {alerts.map((a) => `${a.name} (${a.onHand}${a.unit})`).join(" · ")}
          </p>
        </div>
      )}
      <Button onClick={() => void add()}>Add ingredient</Button>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className={item.onHand <= item.lowStockAt ? "ring-1 ring-flame/40" : ""}>
            <CardContent>
              <CardTitle>{item.name}</CardTitle>
              <p className="mt-1 text-2xl font-bold">
                {item.onHand} <span className="text-sm font-normal text-mist">{item.unit}</span>
              </p>
              <p className="text-xs text-mist">Alert below {item.lowStockAt}{item.unit}</p>
              <ul className="mt-2 text-xs text-mist">
                {item.recipeLines.map((line) => (
                  <li key={line.menuItem.title}>
                    {line.menuItem.title}: −{line.qtyPerPortion}
                    {item.unit}/plate
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
