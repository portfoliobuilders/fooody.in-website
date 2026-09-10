import { NextResponse } from "next/server";
import { handleWhatsAppInbound } from "@/lib/whatsapp/engine";
import { parseInbound, verifyWhatsAppSignature } from "@/lib/whatsapp/parse";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifyWhatsAppSignature(raw, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  let payload: unknown = {};
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const messages = parseInbound(payload as Parameters<typeof parseInbound>[0]);
  for (const message of messages) {
    try {
      await handleWhatsAppInbound(message);
    } catch (error) {
      console.error("WhatsApp inbound failed", error);
    }
  }
  return NextResponse.json({ ok: true });
}
