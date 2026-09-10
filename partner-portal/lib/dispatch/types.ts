import type { DispatchType, FulfillmentChannel } from "@prisma/client";

export type DispatchQuote = {
  type: DispatchType;
  amountPaise: number;
  etaMins: number;
  trackingUrl?: string;
};

export type DispatchRequest = {
  orderId: string;
  restaurantId: string;
  pickupAddress: string;
  dropAddress: string;
  customerName: string;
  customerPhone: string;
  preferred?: DispatchType;
};

export type DispatchResult = {
  type: DispatchType;
  status: "QUOTED" | "ASSIGNED";
  trackingUrl: string;
  providerJobId?: string;
  providerQuotePaise?: number;
  metadata?: Record<string, unknown>;
};

export interface DispatchProvider {
  type: DispatchType;
  isConfigured(): boolean;
  quote(req: DispatchRequest): Promise<DispatchQuote>;
  create(req: DispatchRequest): Promise<DispatchResult>;
}

export function isDeliveryChannel(channel: FulfillmentChannel) {
  return channel === "ONLINE_DELIVERY" || channel === "SELF_DELIVERY" || channel === "WHATSAPP";
}

export function appOrigin() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
