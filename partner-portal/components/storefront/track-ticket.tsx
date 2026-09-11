"use client";

import { useEffect, useState } from "react";
import { CHANNEL_LABEL, ORDER_STATUS_LABEL } from "@/lib/tenant/host";
import { paiseToRupees } from "@/lib/money";

type PublicOrder = {
  id: string;
  orderNumber: number;
  status: keyof typeof ORDER_STATUS_LABEL;
  channel: keyof typeof CHANNEL_LABEL;
  customerName: string;
  customerNotes: string;
  deliveryAddress: string;
  placedAt: string;
  subtotalPaise: number;
  discountPaise: number;
  packagingFeePaise: number;
  deliveryFeePaise: number;
  gstPaise: number;
  totalPaise: number;
  items: { id: string; title: string; variantName: string | null; quantity: number; notes: string }[];
  payment: { gateway: string; status: string } | null;
  table: { number: string } | null;
  restaurant: { name: string; slug: string; phone: string; whatsappPhone: string | null; brandPrimary: string };
};

export function TrackTicket({ orderId, initial }: { orderId: string; initial: PublicOrder }) {
  const [order, setOrder] = useState(initial);

  useEffect(() => {
    const timer = setInterval(() => {
      void fetch(`/api/public/orders/${orderId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.order) setOrder(data.order);
        });
    }, 5000);
    return () => clearInterval(timer);
  }, [orderId]);

  const wa = (order.restaurant.whatsappPhone ?? order.restaurant.phone).replace(/\D/g, "");
  const intl = wa.length === 10 ? `91${wa}` : wa;

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 py-10" style={{ color: order.restaurant.brandPrimary }}>
      <p className="text-xs uppercase tracking-[0.16em] opacity-60">{order.restaurant.name}</p>
      <h1 className="font-display mt-2 text-4xl font-extrabold">Order #{order.orderNumber}</h1>
      <p className="mt-2 text-lg font-semibold">
        {ORDER_STATUS_LABEL[order.status]} · {CHANNEL_LABEL[order.channel]}
      </p>
      <p className="text-sm opacity-70">
        {order.customerName}
        {order.table ? ` · Table ${order.table.number}` : ""}
      </p>
      <ol className="mt-6 grid grid-cols-4 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide">
        {["PENDING", "ACCEPTED", "PREPARING", "READY"].map((step) => {
          const active =
            ["PENDING", "ACCEPTED", "PREPARING", "READY", "DISPATCHED", "COMPLETED"].indexOf(order.status) >=
            ["PENDING", "ACCEPTED", "PREPARING", "READY"].indexOf(step);
          return (
            <li key={step} className={`rounded-full py-1 ${active ? "text-white" : "bg-black/5"}`} style={active ? { background: order.restaurant.brandPrimary } : undefined}>
              {step === "PENDING" ? "Received" : step === "ACCEPTED" ? "Accepted" : step === "PREPARING" ? "Cooking" : "Ready"}
            </li>
          );
        })}
      </ol>
      <ul className="mt-6 space-y-2 rounded-2xl bg-white p-4 text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-2">
            <span>
              {item.quantity}× {item.title}
              {item.variantName ? ` (${item.variantName})` : ""}
            </span>
          </li>
        ))}
      </ul>
      {order.deliveryAddress ? <p className="mt-3 text-sm">Deliver to {order.deliveryAddress}</p> : null}
      {order.customerNotes ? <p className="mt-2 text-sm">Note: {order.customerNotes}</p> : null}
      <dl className="mt-4 grid grid-cols-2 gap-1 text-sm">
        <dt>Subtotal</dt>
        <dd className="text-right">{paiseToRupees(order.subtotalPaise)}</dd>
        <dt>GST</dt>
        <dd className="text-right">{paiseToRupees(order.gstPaise)}</dd>
        <dt>Total</dt>
        <dd className="text-right font-bold">{paiseToRupees(order.totalPaise)}</dd>
        <dt>Payment</dt>
        <dd className="text-right">
          {order.payment?.status === "PAID"
            ? "Paid"
            : order.payment?.status === "CASH_ON_DELIVERY"
              ? "Pay on collection"
              : "Waiting at counter"}
        </dd>
      </dl>
      {intl && (
        <a className="mt-6 inline-block text-sm underline" href={`https://wa.me/${intl}`}>
          WhatsApp the cafe
        </a>
      )}
      <p className="mt-6 text-sm opacity-60">Keep this page open — kitchen and rider updates land on the same ticket.</p>
    </div>
  );
}
