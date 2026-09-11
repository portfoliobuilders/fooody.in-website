import { paiseToRupees } from "@/lib/money";
import { CHANNEL_LABEL } from "@/lib/tenant/host";

const ESC = "\x1b";
const GS = "\x1d";

type PrintOrder = {
  orderNumber: number;
  channel: keyof typeof CHANNEL_LABEL | string;
  customerName: string;
  customerNotes?: string;
  table?: { number: string } | null;
  placedAt: Date | string;
  totalPaise: number;
  items: {
    quantity: number;
    title: string;
    variantName?: string | null;
    notes?: string;
  }[];
  restaurantName: string;
  tenders?: { gateway: string; amountPaise: number }[];
};

function encode(commands: string) {
  return Buffer.from(commands, "binary").toString("base64");
}

function line(text: string, width = 32) {
  return text.slice(0, width).padEnd(width, " ") + "\n";
}

export function buildKotPayload(order: PrintOrder) {
  const when = new Date(order.placedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const channel = CHANNEL_LABEL[order.channel as keyof typeof CHANNEL_LABEL] ?? order.channel;
  const table = order.table ? `TBL ${order.table.number}` : "COUNTER";
  const body = [
    `${ESC}@`,
    `${ESC}a\x01`,
    `${ESC}!\x30KOT #${order.orderNumber}\n`,
    `${ESC}!\x00`,
    `${channel} · ${table}\n`,
    `${order.customerName} · ${when}\n`,
    "--------------------------------\n",
    ...order.items.map(
      (item) =>
        `${item.quantity}x ${item.title}${item.variantName ? ` (${item.variantName})` : ""}\n` +
        (item.notes ? `   ${item.notes}\n` : ""),
    ),
    order.customerNotes ? `NOTE: ${order.customerNotes}\n` : "",
    "--------------------------------\n",
    `${GS}V\x41\x03`,
  ].join("");
  return { kind: "kot" as const, text: body.replaceAll(ESC, "").replaceAll(GS, ""), escposBase64: encode(body) };
}

export function buildReceiptPayload(order: PrintOrder) {
  const body = [
    `${ESC}@`,
    `${ESC}a\x01`,
    `${ESC}!\x10${order.restaurantName}\n`,
    `${ESC}!\x00`,
    `Bill #${order.orderNumber}\n`,
    `${ESC}a\x00`,
    "--------------------------------\n",
    ...order.items.map((item) => line(`${item.quantity}x ${item.title}`)),
    "--------------------------------\n",
    `${ESC}a\x02TOTAL ${paiseToRupees(order.totalPaise)}\n`,
    `${ESC}a\x00`,
    ...(order.tenders ?? []).map((tender) => `${tender.gateway} ${paiseToRupees(tender.amountPaise)}\n`),
    "Thank you · fooody.in\n",
    `${GS}V\x41\x03`,
  ].join("");
  return { kind: "receipt" as const, text: body.replaceAll(ESC, "").replaceAll(GS, ""), escposBase64: encode(body) };
}
