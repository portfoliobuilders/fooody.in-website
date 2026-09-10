export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost";

export const RESERVED_SLUGS = new Set([
  "www",
  "app",
  "api",
  "partners",
  "partner",
  "dashboard",
  "login",
  "signup",
  "marketplace",
  "staff",
  "kitchen",
  "for-restaurants",
  "our-story",
  "about",
  "contact",
  "terms",
  "privacy",
  "cookies",
  "disclaimer",
  "refunds",
  "admin",
  "static",
  "qr",
  "track",
  "webhooks",
]);

export const ROLE_LABEL = {
  SUPER_ADMIN: "Super admin",
  OWNER: "Owner",
  MANAGER: "Manager",
  KITCHEN_STAFF: "Kitchen",
  BILLING_CASHIER: "Cashier",
  DELIVERY_DRIVER: "Driver",
} as const;

export const CHANNEL_LABEL = {
  DINE_IN: "Dine-in",
  ONLINE_DELIVERY: "Delivery",
  TAKEAWAY: "Takeaway",
  SELF_DELIVERY: "Self delivery",
  WHATSAPP: "WhatsApp",
} as const;

export const ORDER_STATUS_LABEL = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  READY: "Ready",
  DISPATCHED: "Dispatched",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
} as const;

export const ORDER_FLOW = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "DISPATCHED",
  "COMPLETED",
] as const;

export const TABLE_STATUS_LABEL = {
  VACANT: "Vacant",
  OCCUPIED: "Occupied",
  BILL_PRINTED: "Bill printed",
  RESERVED: "Reserved",
} as const;

export const DISPATCH_TYPE_LABEL = {
  IN_HOUSE: "In-house rider",
  UBER_DIRECT: "Uber Direct",
  PORTER: "Porter",
  FOOODY_POOL: "Fooody pool",
} as const;

export function tableQrPath(slug: string, tableNumber: string) {
  return `/qr/${slug}/table/${tableNumber}`;
}

export function extractSubdomain(host: string | null): string | null {
  if (!host) return null;
  const hostname = host.split(":")[0].toLowerCase();
  if (hostname.endsWith(".localhost")) {
    const sub = hostname.slice(0, -".localhost".length);
    if (sub && !RESERVED_SLUGS.has(sub)) return sub;
    return null;
  }
  const root = ROOT_DOMAIN.replace(/^www\./, "");
  if (hostname === root || hostname === `www.${root}`) return null;
  if (hostname.endsWith(`.${root}`)) {
    const sub = hostname.slice(0, -(root.length + 1));
    if (sub && !sub.includes(".") && !RESERVED_SLUGS.has(sub)) return sub;
  }
  return null;
}
