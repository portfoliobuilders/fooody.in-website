import type { DispatchProvider, DispatchRequest, DispatchResult } from "../types";
import { appOrigin } from "../types";

const UBER_BASE =
  process.env.UBER_DIRECT_BASE_URL ?? "https://api.uber.com/v1/customers";

export const uberDirectProvider: DispatchProvider = {
  type: "UBER_DIRECT",
  isConfigured: () => Boolean(process.env.UBER_DIRECT_CUSTOMER_ID && process.env.UBER_DIRECT_TOKEN),
  async quote(req: DispatchRequest) {
    if (!this.isConfigured()) {
      return { type: "UBER_DIRECT", amountPaise: 8900, etaMins: 28 };
    }
    const customerId = process.env.UBER_DIRECT_CUSTOMER_ID!;
    const res = await fetch(`${UBER_BASE}/${customerId}/delivery_quotes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UBER_DIRECT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pickup_address: req.pickupAddress,
        dropoff_address: req.dropAddress,
      }),
    });
    if (!res.ok) {
      return { type: "UBER_DIRECT", amountPaise: 8900, etaMins: 28 };
    }
    const data = (await res.json()) as { fee?: number; dropoff_eta?: number };
    return {
      type: "UBER_DIRECT",
      amountPaise: Math.round((data.fee ?? 89) * 100),
      etaMins: data.dropoff_eta ?? 28,
    };
  },
  async create(req: DispatchRequest): Promise<DispatchResult> {
    if (!this.isConfigured()) {
      return {
        type: "UBER_DIRECT",
        status: "ASSIGNED",
        trackingUrl: `${appOrigin()}/track/${req.orderId}`,
        providerJobId: `uber_sim_${req.orderId.slice(-6)}`,
        providerQuotePaise: 8900,
        metadata: { mode: "sandbox-unconfigured" },
      };
    }
    const customerId = process.env.UBER_DIRECT_CUSTOMER_ID!;
    const res = await fetch(`${UBER_BASE}/${customerId}/deliveries`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UBER_DIRECT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pickup_name: "Restaurant",
        pickup_address: req.pickupAddress,
        dropoff_name: req.customerName,
        dropoff_address: req.dropAddress,
        dropoff_phone_number: req.customerPhone,
        manifest_items: [{ name: "Fooody order", quantity: 1 }],
      }),
    });
    const data = (await res.json()) as { id?: string; tracking_url?: string; fee?: number };
    return {
      type: "UBER_DIRECT",
      status: "ASSIGNED",
      trackingUrl: data.tracking_url ?? `${appOrigin()}/track/${req.orderId}`,
      providerJobId: data.id,
      providerQuotePaise: data.fee ? Math.round(data.fee * 100) : undefined,
    };
  },
};
