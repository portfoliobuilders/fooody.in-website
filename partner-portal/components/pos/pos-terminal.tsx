"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { paiseToRupees } from "@/lib/money";

type CatalogItem = {
  id: string;
  title: string;
  basePricePaise: number;
  taxRateBps: number;
  inStock: boolean;
  diet: string;
  category: { id: string; name: string };
  variants: { name: string; pricePaise: number; isDefault: boolean; inStock: boolean }[];
};

type CartLine = {
  key: string;
  menuItemId: string;
  title: string;
  variantName?: string;
  quantity: number;
  unitPricePaise: number;
};

type TenderKey = "CASH" | "UPI" | "CARD";

export function PosTerminal({ restaurantId }: { restaurantId: string }) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [tables, setTables] = useState<{ number: string; status: string }[]>([]);
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState<"DINE_IN" | "TAKEAWAY">("DINE_IN");
  const [tableNumber, setTableNumber] = useState("");
  const [guestName, setGuestName] = useState("Walk-in");
  const [guestPhone, setGuestPhone] = useState("9000000000");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [split, setSplit] = useState(false);
  const [tenders, setTenders] = useState<Record<TenderKey, number>>({ CASH: 0, UPI: 0, CARD: 0 });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void Promise.all([
      fetch(`/api/tenant/${restaurantId}/menu`).then((res) => res.json()),
      fetch(`/api/tenant/${restaurantId}/tables`).then((res) => res.json()),
    ]).then(([menu, floor]) => {
      setItems(menu.items ?? []);
      const nextTables = (floor.zones ?? []).flatMap(
        (zone: { tables?: { number: string; status: string }[] }) => zone.tables ?? [],
      );
      setTables(nextTables);
    });
  }, [restaurantId]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => item.inStock && (!q || item.title.toLowerCase().includes(q)));
  }, [items, query]);

  const subtotal = cart.reduce((sum, line) => sum + line.unitPricePaise * line.quantity, 0);
  const gstPaise = cart.reduce((sum, line) => {
    const item = items.find((row) => row.id === line.menuItemId);
    return sum + Math.round((line.unitPricePaise * line.quantity * (item?.taxRateBps ?? 500)) / 10000);
  }, 0);
  const packagingPaise = channel === "DINE_IN" ? 0 : 1500;
  const billTotal = subtotal + gstPaise + packagingPaise;
  const tenderPaise = (Object.values(tenders) as number[]).reduce((sum, rupees) => sum + Math.round(rupees * 100), 0);

  function addItem(item: CatalogItem) {
    const variant = item.variants.find((row) => row.isDefault && row.inStock) ?? item.variants.find((row) => row.inStock);
    const unit = variant?.pricePaise ?? item.basePricePaise;
    const key = `${item.id}:${variant?.name ?? ""}`;
    setCart((current) => {
      const found = current.find((line) => line.key === key);
      if (found) {
        return current.map((line) => (line.key === key ? { ...line, quantity: line.quantity + 1 } : line));
      }
      return [
        ...current,
        {
          key,
          menuItemId: item.id,
          title: item.title,
          variantName: variant?.name,
          quantity: 1,
          unitPricePaise: unit,
        },
      ];
    });
  }

  async function printTicket(orderId: string, kind: "kot" | "receipt") {
    const res = await fetch(`/api/tenant/${restaurantId}/orders/${orderId}/print?kind=${kind}`);
    const data = await res.json();
    const win = window.open("", "_blank", "width=420,height=640");
    if (!win) return data;
    win.document.write(
      `<pre style="font:14px/1.4 ui-monospace,monospace;padding:16px">${String(data.text ?? "")
        .replaceAll("<", "&lt;")
        .replaceAll("\n", "<br/>")}</pre>`,
    );
    win.document.close();
    win.focus();
    win.print();
    return data;
  }

  async function charge() {
    if (!cart.length) {
      toast.error("Add items first");
      return;
    }
    if (channel === "DINE_IN" && !tableNumber) {
      toast.error("Pick a table or switch to takeaway");
      return;
    }
    const activeTenders = (Object.entries(tenders) as [TenderKey, number][])
      .filter(([, rupees]) => rupees > 0)
      .map(([gateway, rupees]) => ({ gateway, amountPaise: Math.round(rupees * 100) }));
    if (split && activeTenders.length && activeTenders.reduce((sum, row) => sum + row.amountPaise, 0) !== billTotal) {
      toast.error("Split amounts must add up to the bill total");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/tenant/${restaurantId}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          tableNumber: channel === "DINE_IN" ? tableNumber : undefined,
          customerName: guestName || (channel === "DINE_IN" ? `Table ${tableNumber}` : "Takeaway"),
          customerPhone: guestPhone,
          paymentGateway: activeTenders[0]?.gateway ?? (channel === "DINE_IN" ? "UPI" : "CASH"),
          paymentStatus: "PAID",
          tenders: split && activeTenders.length ? activeTenders : undefined,
          lines: cart.map((line) => ({
            menuItemId: line.menuItemId,
            variantName: line.variantName,
            quantity: line.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not bill");
        return;
      }
      toast.success(`Ticket #${data.order.orderNumber} sent to kitchen`);
      await printTicket(data.order.id, "kot");
      await printTicket(data.order.id, "receipt");
      setCart([]);
      setTenders({ CASH: 0, UPI: 0, CARD: 0 });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
      <section className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search menu" className="max-w-xs" />
          <Button variant={channel === "DINE_IN" ? "default" : "outline"} onClick={() => setChannel("DINE_IN")}>
            Dine-in
          </Button>
          <Button variant={channel === "TAKEAWAY" ? "default" : "outline"} onClick={() => setChannel("TAKEAWAY")}>
            Takeaway
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => addItem(item)}
              className="rounded-2xl border border-black/10 bg-white p-4 text-left hover:border-flame/40 dark:border-white/10 dark:bg-charcoal"
            >
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-mist">{item.category.name}</p>
              <p className="mt-2 font-display text-xl font-bold">{paiseToRupees(item.basePricePaise)}</p>
            </button>
          ))}
        </div>
      </section>
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Running bill</h2>
            <Badge>{channel === "DINE_IN" ? "Dine-in" : "Takeaway"}</Badge>
          </div>
          {channel === "DINE_IN" && (
            <select
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm dark:border-white/10 dark:bg-obsidian/60"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
            >
              <option value="">Table</option>
              {tables.map((table) => (
                <option key={table.number} value={table.number}>
                  Table {table.number} · {table.status}
                </option>
              ))}
            </select>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Guest name" />
            <Input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="Phone" />
          </div>
          <ul className="space-y-2">
            {cart.map((line) => (
              <li key={line.key} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  {line.quantity}× {line.title}
                  {line.variantName ? ` (${line.variantName})` : ""}
                </span>
                <span className="font-semibold">{paiseToRupees(line.unitPricePaise * line.quantity)}</span>
              </li>
            ))}
            {!cart.length && <li className="text-sm text-mist">Tap items on the left.</li>}
          </ul>
          <p className="font-display text-3xl font-extrabold">{paiseToRupees(billTotal)}</p>
          <p className="text-xs text-mist">
            Items {paiseToRupees(subtotal)}
            {gstPaise ? ` · GST ${paiseToRupees(gstPaise)}` : ""}
            {packagingPaise ? ` · pack ${paiseToRupees(packagingPaise)}` : ""}
          </p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={split} onChange={(e) => setSplit(e.target.checked)} />
            Split bill (Cash / UPI / Card)
          </label>
          {split && (
            <div className="grid grid-cols-3 gap-2">
              {(["CASH", "UPI", "CARD"] as TenderKey[]).map((key) => (
                <label key={key} className="text-xs uppercase text-mist">
                  {key}
                  <Input
                    type="number"
                    min={0}
                    value={tenders[key] || ""}
                    onChange={(e) => setTenders((current) => ({ ...current, [key]: Number(e.target.value) }))}
                  />
                </label>
              ))}
              <p className="col-span-3 text-xs text-mist">
                Tendered {paiseToRupees(tenderPaise)}. Must equal {paiseToRupees(billTotal)}.
              </p>
            </div>
          )}
          <Button className="w-full" size="lg" disabled={busy} onClick={() => void charge()}>
            Charge & send KOT
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
