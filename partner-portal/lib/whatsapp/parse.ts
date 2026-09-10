import { createHmac, timingSafeEqual } from "node:crypto";

export type WhatsAppInbound = {
  from: string;
  name: string;
  text: string;
  interactiveId?: string;
};

type MetaPayload = {
  object?: string;
  entry?: Array<{
    changes?: Array<{
      value?: {
        contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>;
        messages?: Array<{
          from?: string;
          type?: string;
          text?: { body?: string };
          interactive?: {
            type?: string;
            list_reply?: { id?: string; title?: string };
            button_reply?: { id?: string; title?: string };
          };
        }>;
      };
    }>;
  }>;
};

export function verifyWhatsAppSignature(rawBody: string, signatureHeader: string | null) {
  const secret = process.env.WHATSAPP_APP_SECRET?.trim();
  if (!secret) return false;
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = signatureHeader.slice("sha256=".length);
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function parseInbound(payload: MetaPayload): WhatsAppInbound[] {
  const out: WhatsAppInbound[] = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      const name = value?.contacts?.[0]?.profile?.name ?? "Guest";
      for (const message of value?.messages ?? []) {
        const from = message.from ?? value?.contacts?.[0]?.wa_id;
        if (!from) continue;
        if (message.type === "text" && message.text?.body) {
          out.push({ from, name, text: message.text.body.trim() });
        } else if (message.type === "interactive") {
          const reply = message.interactive?.list_reply ?? message.interactive?.button_reply;
          out.push({
            from,
            name,
            text: reply?.title ?? "",
            interactiveId: reply?.id,
          });
        }
      }
    }
  }
  return out;
}
