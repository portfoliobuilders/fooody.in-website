import type { DispatchProvider, DispatchRequest, DispatchResult } from "../types";
import { appOrigin } from "../types";

export const fooodyPoolProvider: DispatchProvider = {
  type: "FOOODY_POOL",
  isConfigured: () => true,
  async quote() {
    return { type: "FOOODY_POOL", amountPaise: 4500, etaMins: 30 };
  },
  async create(req: DispatchRequest): Promise<DispatchResult> {
    return {
      type: "FOOODY_POOL",
      status: "ASSIGNED",
      trackingUrl: `${appOrigin()}/track/${req.orderId}`,
      providerJobId: `pool_${req.orderId.slice(-8)}`,
      providerQuotePaise: 4500,
      metadata: { fleet: "fooody-pooled" },
    };
  },
};
