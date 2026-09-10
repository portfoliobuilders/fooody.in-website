"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Bike, ChefHat, QrCode, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import type { FulfillmentChannel, OrderStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CHANNEL_LABEL, ORDER_STATUS_LABEL, ORDER_FLOW } from "@/lib/tenant/host";
import { paiseToRupees } from "@/lib/money";
import { formatTime } from "@/lib/utils";

function suggestedNext(status: OrderStatus): OrderStatus | null {
  const index = ORDER_FLOW.indexOf(status as (typeof ORDER_FLOW)[number]);
  if (index < 0 || index >= ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[index + 1];
}

type Modifier = { name: string; pricePaise: number };

export type OrderCard = {
  id: string;
  orderNumber: number;
  channel: FulfillmentChannel;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerNotes: string;
  placedAt: string;
  subtotalPaise: number;
  discountPaise: number;
  packagingFeePaise: number;
  deliveryFeePaise: number;
  platformFeePaise: number;
  gstPaise: number;
  netPayoutPaise: number;
  totalPaise: number;
  items: {
    id: string;
    title: string;
    variantName: string | null;
    quantity: number;
    notes: string;
    diet: string;
    modifiersJson: Modifier[] | string;
  }[];
  payment: { gateway: string; status: string } | null;
  table: { number: string } | null;
  dispatch: { trackingUrl: string | null; type: string; status: string } | null;
};

function playChime() {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  const now = ctx.currentTime;
  [880, 1174].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = "triangle";
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.02 + i * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28 + i * 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.12);
    osc.stop(now + 0.32 + i * 0.12);
  });
}

function modifiersOf(value: OrderCard["items"][number]["modifiersJson"]): Modifier[] {
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value) as Modifier[];
  } catch {
    return [];
  }
}

const CHANNELS: Array<FulfillmentChannel | "ALL"> = [
  "ALL",
  "ONLINE_DELIVERY",
  "TAKEAWAY",
  "DINE_IN",
  "SELF_DELIVERY",
  "WHATSAPP",
];

export function OrderBoard({
  restaurantId,
  kds = false,
}: {
  restaurantId: string;
  kds?: boolean;
}) {
  const [orders, setOrders] = useState<OrderCard[]>([]);
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]>("ALL");
  const [selected, setSelected] = useState<OrderCard | null>(null);
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
        toast.message("New incoming order", { icon: <Bell className="size-4" /> });
        void load();
      }
      if (payload.type === "order.updated") void load();
    };
    return () => source.close();
  }, [restaurantId, load]);

  const visible = useMemo(() => {
    const list = channel === "ALL" ? orders : orders.filter((o) => o.channel === channel);
    if (kds) {
      return list.filter((o) => ["ACCEPTED", "PREPARING", "READY"].includes(o.status));
    }
    return list.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status) || true).slice(0, 40);
  }, [orders, channel, kds]);

  async function setStatus(order: OrderCard, status: OrderStatus) {
    const res = await fetch(`/api/tenant/${restaurantId}/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error("Could not update order");
      return;
    }
    toast.success(`Order #${order.orderNumber} → ${ORDER_STATUS_LABEL[status]}`);
    void load();
  }

  async function simulate() {
    await fetch(`/api/tenant/${restaurantId}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: "ONLINE_DELIVERY",
        customerName: "Walk-in test guest",
        customerPhone: "9000000000",
        customerNotes: "Simulated from POS",
        paymentGateway: "RAZORPAY",
        paymentStatus: "PAID",
        simulate: true,
      }),
    });
  }

  const iconFor = (c: FulfillmentChannel) =>
    c === "ONLINE_DELIVERY" || c === "SELF_DELIVERY"
      ? Bike
      : c === "DINE_IN"
        ? QrCode
        : c === "WHATSAPP"
          ? MessageCircle
          : ChefHat;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${live ? "bg-emerald-500" : "bg-mist"}`} />
          <p className="text-sm text-mist">{live ? "Live switchboard" : "Reconnecting…"}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void simulate().then(load)}>
          Simulate incoming order
        </Button>
      </div>
      <Tabs value={channel} onValueChange={(v) => setChannel(v as (typeof CHANNELS)[number])}>
        <TabsList>
          {CHANNELS.map((c) => (
            <TabsTrigger key={c} value={c}>
              {c === "ALL" ? "All channels" : CHANNEL_LABEL[c]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className={kds ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "grid gap-3 lg:grid-cols-[1fr_22rem]"}>
        <div className={kds ? "contents" : "space-y-3"}>
          {visible.map((order) => {
            const Icon = iconFor(order.channel);
            const next = suggestedNext(order.status);
            return (
              <Card
                key={order.id}
                className={`cursor-pointer ${order.status === "PENDING" ? "ring-2 ring-flame/50" : ""} ${kds ? "min-h-64" : ""}`}
                onClick={() => setSelected(order)}
              >
                <CardContent className={kds ? "space-y-3 p-6" : "space-y-3"}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`font-display font-bold ${kds ? "text-3xl" : "text-lg"}`}>#{order.orderNumber}</p>
                      <p className="text-sm text-mist">
                        {order.customerName}
                        {order.table ? ` · Table ${order.table.number}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge tone={order.status === "PENDING" ? "danger" : "gold"}>
                        {ORDER_STATUS_LABEL[order.status]}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-xs text-mist">
                        <Icon className="size-3" /> {CHANNEL_LABEL[order.channel]} · {formatTime(order.placedAt)}
                      </span>
                    </div>
                  </div>
                  <ul className={`space-y-1 ${kds ? "text-lg" : "text-sm"}`}>
                    {order.items.map((item) => (
                      <li key={item.id}>
                        <span className="font-semibold">{item.quantity}×</span> {item.title}
                        {item.variantName ? ` (${item.variantName})` : ""}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{paiseToRupees(order.totalPaise)}</p>
                    <Badge tone={order.payment?.status === "PAID" ? "success" : "warn"}>
                      {order.payment?.status === "PAID" ? "Paid" : "Cash on delivery"}
                    </Badge>
                  </div>
                  {next && (
                    <Button
                      className="w-full"
                      size={kds ? "lg" : "default"}
                      onClick={(e) => {
                        e.stopPropagation();
                        void setStatus(order, next);
                      }}
                    >
                      Mark {ORDER_STATUS_LABEL[next]}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        {!kds && selected && (
          <Card className="h-fit">
            <CardContent className="space-y-3">
              <p className="font-display text-xl font-bold">Order #{selected.orderNumber}</p>
              <p className="text-sm">
                {selected.customerName} · {selected.customerPhone}
              </p>
              {selected.customerNotes && (
                <p className="rounded-xl bg-amber-50 p-3 text-sm dark:bg-amber-500/10">
                  Note: {selected.customerNotes}
                </p>
              )}
              <ul className="space-y-2 text-sm">
                {selected.items.map((item) => (
                  <li key={item.id} className="border-b border-black/5 pb-2 dark:border-white/10">
                    <p>
                      {item.quantity}× {item.title} {item.variantName ? `· ${item.variantName}` : ""}
                    </p>
                    {modifiersOf(item.modifiersJson).map((m) => (
                      <p key={m.name} className="text-mist">
                        + {m.name}
                        {m.pricePaise ? ` (${paiseToRupees(m.pricePaise)})` : ""}
                      </p>
                    ))}
                  </li>
                ))}
              </ul>
              <dl className="grid grid-cols-2 gap-1 text-xs">
                <dt>Subtotal</dt>
                <dd className="text-right">{paiseToRupees(selected.subtotalPaise)}</dd>
                <dt>Discount</dt>
                <dd className="text-right">{paiseToRupees(selected.discountPaise)}</dd>
                <dt>Packaging</dt>
                <dd className="text-right">{paiseToRupees(selected.packagingFeePaise)}</dd>
                <dt>Delivery</dt>
                <dd className="text-right">{paiseToRupees(selected.deliveryFeePaise)}</dd>
                <dt>GST</dt>
                <dd className="text-right">{paiseToRupees(selected.gstPaise)}</dd>
                <dt>Net payout</dt>
                <dd className="text-right font-semibold">{paiseToRupees(selected.netPayoutPaise)}</dd>
              </dl>
              {selected.dispatch?.trackingUrl && (
                <a className="block text-sm text-gold underline" href={selected.dispatch.trackingUrl}>
                  Track {selected.dispatch.type}
                </a>
              )}
              <div className="flex gap-2">
                {suggestedNext(selected.status) && (
                  <Button onClick={() => void setStatus(selected, suggestedNext(selected.status)!)}>Advance</Button>
                )}
                {selected.status === "PENDING" && (
                  <Button variant="danger" onClick={() => void setStatus(selected, "CANCELLED")}>
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
