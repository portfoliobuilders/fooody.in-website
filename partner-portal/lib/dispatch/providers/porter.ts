import type { DispatchProvider, DispatchRequest, DispatchResult } from "../types";
import { appOrigin } from "../types";

export const porterProvider: DispatchProvider = {
  type: "PORTER",
  isConfigured: () => Boolean(process.env.PORTER_API_KEY),
  async quote() {
    return { type: "PORTER", amountPaise: 6900, etaMins: 32 };
  },
  async create(req: DispatchRequest): Promise<DispatchResult> {
    if (!this.isConfigured()) {
      return {
        type: "PORTER",
        status: "ASSIGNED",
        trackingUrl: `${appOrigin()}/track/${req.orderId}`,
        providerJobId: `porter_sim_${req.orderId.slice(-6)}`,
        providerQuotePaise: 6900,
        metadata: { mode: "sandbox-unconfigured" },
      };
    }
    const res = await fetch(process.env.PORTER_API_URL ?? "https://pfe-apigw.porter.in/v1/orders/create", {
      method: "POST",
      headers: {
        "x-api-key": process.env.PORTER_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pickup_details: { address: req.pickupAddress },
        drop_details: { address: req.dropAddress, contact: { name: req.customerName, phone: req.customerPhone } },
      }),
    });
    const data = (await res.json()) as { order_id?: string; tracking_url?: string; fare?: number };
    return {
      type: "PORTER",
      status: "ASSIGNED",
      trackingUrl: data.tracking_url ?? `${appOrigin()}/track/${req.orderId}`,
      providerJobId: data.order_id,
      providerQuotePaise: data.fare ? Math.round(data.fare * 100) : 6900,
    };
  },
};
