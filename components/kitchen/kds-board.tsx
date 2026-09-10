"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import type { OrderStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CHANNEL_LABEL, ORDER_STATUS_LABEL } from "@/lib/tenant/host";
import { paiseToRupees } from "@/lib/money";
import { formatTime } from "@/lib/utils";
import type { OrderCard } from "@/components/orders/order-board";

function playChime() {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  const now = ctx.currentTime;
  [523, 784, 1046].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = "square";
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02 + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22 + i * 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.08);
    osc.stop(now + 0.26 + i * 0.08);
  });
}

const COLUMNS: { key: string; title: string; statuses: OrderStatus[] }[] = [
  { key: "new", title: "New", statuses: ["PENDING"] },
  { key: "kitchen", title: "In kitchen", statuses: ["ACCEPTED", "PREPARING"] },
  { key: "ready", title: "Ready", statuses: ["READY"] },
];

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "ACCEPTED",
  ACCEPTED: "PREPARING",
  PREPARING: "READY",
  READY: "DISPATCHED",
};

export function KdsBoard({ restaurantId }: { restaurantId: string }) {
  const [orders, setOrders] = useState<OrderCard[]>([]);
  const [live, setLive] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/tenant/${restaurantId}/orders`);
    const data = await res.json();
    setOrders(data.orders ?? []);
  }, [restaurantId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const source = new EventSource(`/api/tenant/${restaurantId}/orders/stream`);
    source.onopen = () => setLive(true);
    source.onerror = () => setLive(false);
    source.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { type: string };
      if (payload.type === "order.created") {
        playChime();
        toast.message("New KOT", { icon: <Bell className="size-4" /> });
        void load();
      }
      if (payload.type === "order.updated" || payload.type === "dispatch.updated") void load();
    };
    return () => source.close();
  }, [restaurantId, load]);

  const grouped = useMemo(
    () =>
      COLUMNS.map((column) => ({
        ...column,
        tickets: orders.filter((order) => column.statuses.includes(order.status)),
      })),
    [orders],
  );

  async function setStatus(order: OrderCard, status: OrderStatus) {
    const res = await fetch(`/api/tenant/${restaurantId}/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error("Could not bump ticket");
      return;
    }
    toast.success(`#${order.orderNumber} → ${ORDER_STATUS_LABEL[status]}`);
    void load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className={`size-2 rounded-full ${live ? "bg-emerald-500" : "bg-mist"}`} />
        <p className="text-sm text-mist">{live ? "KDS live" : "Reconnecting…"}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {grouped.map((column) => (
          <section key={column.key} className="min-h-[70vh] rounded-3xl bg-black/5 p-3 dark:bg-white/5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">{column.title}</h2>
              <Badge>{column.tickets.length}</Badge>
            </div>
            <div className="space-y-3">
              {column.tickets.map((order) => {
                const next = NEXT[order.status];
                return (
                  <Card key={order.id} className="min-h-52">
                    <CardContent className="space-y-3 p-5">
                      <div className="flex items-start justify-between">
                        <p className="font-display text-3xl font-extrabold">#{order.orderNumber}</p>
                        <Badge tone={order.status === "PENDING" ? "danger" : "gold"}>
                          {CHANNEL_LABEL[order.channel]}
                        </Badge>
                      </div>
                      <p className="text-sm text-mist">
                        {order.customerName}
                        {order.table ? ` · Table ${order.table.number}` : ""} · {formatTime(order.placedAt)}
                      </p>
                      <ul className="space-y-1 text-lg">
                        {order.items.map((item) => (
                          <li key={item.id}>
                            <span className="font-bold">{item.quantity}×</span> {item.title}
                            {item.variantName ? ` (${item.variantName})` : ""}
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm font-semibold">{paiseToRupees(order.totalPaise)}</p>
                      {next && (
                        <Button className="w-full" size="lg" onClick={() => void setStatus(order, next)}>
                          {next === "DISPATCHED" ? "Packaged · dispatch" : `Mark ${ORDER_STATUS_LABEL[next]}`}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
