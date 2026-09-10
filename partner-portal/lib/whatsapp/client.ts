const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION ?? "v21.0";

function endpoint() {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!phoneId) return null;
  return `https://graph.facebook.com/${GRAPH_VERSION}/${phoneId}/messages`;
}

function headers() {
  return {
    Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN ?? ""}`,
    "Content-Type": "application/json",
  };
}

export async function sendWhatsAppText(to: string, body: string) {
  const url = endpoint();
  if (!url || !process.env.WHATSAPP_ACCESS_TOKEN) {
    console.info(`[whatsapp:dry-run] to=${to} ${body}`);
    return false;
  }
  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to.replace(/^\+/, ""),
      type: "text",
      text: { preview_url: true, body },
    }),
  });
  return res.ok;
}

export async function sendWhatsAppList(input: {
  to: string;
  header: string;
  body: string;
  button: string;
  sections: { title: string; rows: { id: string; title: string; description?: string }[] }[];
}) {
  const url = endpoint();
  if (!url || !process.env.WHATSAPP_ACCESS_TOKEN) {
    console.info(`[whatsapp:dry-run-list] to=${input.to} ${input.body}`);
    return false;
  }
  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: input.to.replace(/^\+/, ""),
      type: "interactive",
      interactive: {
        type: "list",
        header: { type: "text", text: input.header.slice(0, 60) },
        body: { text: input.body.slice(0, 1024) },
        action: {
          button: input.button.slice(0, 20),
          sections: input.sections.slice(0, 10).map((section) => ({
            title: section.title.slice(0, 24),
            rows: section.rows.slice(0, 10).map((row) => ({
              id: row.id.slice(0, 200),
              title: row.title.slice(0, 24),
              description: row.description?.slice(0, 72),
            })),
          })),
        },
      },
    }),
  });
  return res.ok;
}

export async function sendWhatsAppButtons(input: {
  to: string;
  body: string;
  buttons: { id: string; title: string }[];
}) {
  const url = endpoint();
  if (!url || !process.env.WHATSAPP_ACCESS_TOKEN) {
    console.info(`[whatsapp:dry-run-buttons] to=${input.to} ${input.body}`);
    return false;
  }
  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: input.to.replace(/^\+/, ""),
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: input.body.slice(0, 1024) },
        action: {
          buttons: input.buttons.slice(0, 3).map((button) => ({
            type: "reply",
            reply: { id: button.id, title: button.title.slice(0, 20) },
          })),
        },
      },
    }),
  });
  return res.ok;
}
