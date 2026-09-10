import type { DispatchProvider, DispatchRequest, DispatchResult } from "../types";
import { appOrigin } from "../types";

export const inHouseProvider: DispatchProvider = {
  type: "IN_HOUSE",
  isConfigured: () => true,
  async quote() {
    return { type: "IN_HOUSE", amountPaise: 0, etaMins: 25 };
  },
  async create(req: DispatchRequest): Promise<DispatchResult> {
    return {
      type: "IN_HOUSE",
      status: "ASSIGNED",
      trackingUrl: `${appOrigin()}/track/${req.orderId}`,
      metadata: { fleet: "restaurant" },
    };
  },
};
