import { prisma } from "@/lib/db/prisma";
import { kvGet, kvSet, kvDel } from "@/lib/cache/session-store";
import { createOrder } from "@/lib/db/orders";
import { paiseToRupees } from "@/lib/money";
import { sendWhatsAppButtons, sendWhatsAppList, sendWhatsAppText } from "./client";
import type { WhatsAppInbound } from "./parse";

type CartLine = { menuItemId: string; title: string; variantName?: string; quantity: number; unitPricePaise: number };

type Session = {
  restaurantId: string;
  waId: string;
  name: string;
  cart: CartLine[];
};

const TTL = 60 * 30;

function key(waId: string) {
  return `wa:cart:${waId}`;
}

async function loadSession(waId: string, name: string): Promise<Session> {
  const cached = await kvGet<Session>(key(waId));
  if (cached) return cached;
  const row = await prisma.whatsAppCartSession.findFirst({
    where: { waId },
    orderBy: { updatedAt: "desc" },
  });
  const restaurant =
    (row
      ? await prisma.restaurant.findUnique({ where: { id: row.restaurantId } })
      : await prisma.restaurant.findUnique({ where: { slug: process.env.WHATSAPP_RESTAURANT_SLUG ?? "baketree" } })) ??
    (await prisma.restaurant.findFirst({ where: { listedOnMarketplace: true } })) ??
    (await prisma.restaurant.findFirst());
  if (!restaurant) throw new Error("No restaurant configured for WhatsApp");
  const session: Session = {
    restaurantId: restaurant.id,
    waId,
    name,
    cart: Array.isArray(row?.cartJson) ? (row?.cartJson as CartLine[]) : [],
  };
  await persist(session);
  return session;
}

async function persist(session: Session) {
  await kvSet(key(session.waId), session, TTL);
  await prisma.whatsAppCartSession.upsert({
    where: {
      restaurantId_waId: { restaurantId: session.restaurantId, waId: session.waId },
    },
    update: {
      cartJson: session.cart,
      customerName: session.name,
      status: session.cart.length ? "CART" : "BROWSING",
      expiresAt: new Date(Date.now() + TTL * 1000),
    },
    create: {
      restaurantId: session.restaurantId,
      waId: session.waId,
      cartJson: session.cart,
      customerName: session.name,
      status: session.cart.length ? "CART" : "BROWSING",
      expiresAt: new Date(Date.now() + TTL * 1000),
    },
  });
}

function cartTotal(cart: CartLine[]) {
  return cart.reduce((s, l) => s + l.unitPricePaise * l.quantity, 0);
}

function cartSummary(cart: CartLine[]) {
  if (!cart.length) return "Your cart is empty.";
  return cart.map((l) => `${l.quantity}× ${l.title}${l.variantName ? ` (${l.variantName})` : ""}`).join("\n");
}

export async function handleWhatsAppInbound(message: WhatsAppInbound) {
  const session = await loadSession(message.from, message.name);
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.restaurantId },
    include: {
      categories: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      items: { where: { listedOnStorefront: true, inStock: true }, include: { variants: true } },
    },
  });
  if (!restaurant) {
    await sendWhatsAppText(message.from, "This kitchen is not on Fooody yet.");
    return;
  }

  const id = message.interactiveId ?? "";
  const text = message.text.toLowerCase();

  if (id.startsWith("cat:")) {
    const categoryId = id.slice(4);
    const items = restaurant.items.filter((item) => item.categoryId === categoryId).slice(0, 10);
    await sendWhatsAppList({
      to: message.from,
      header: restaurant.name,
      body: "Pick a dish to add to your cart.",
      button: "Dishes",
      sections: [
        {
          title: "Menu",
          rows: items.map((item) => ({
            id: `item:${item.id}`,
            title: item.title,
            description: paiseToRupees(item.basePricePaise),
          })),
        },
      ],
    });
    return;
  }

  if (id.startsWith("item:")) {
    const item = restaurant.items.find((i) => i.id === id.slice(5));
    if (!item) {
      await sendWhatsAppText(message.from, "That dish just went off the board.");
      return;
    }
    const variant = item.variants.find((v) => v.isDefault) ?? item.variants[0];
    const existing = session.cart.find((l) => l.menuItemId === item.id && l.variantName === variant?.name);
    if (existing) existing.quantity += 1;
    else {
      session.cart.push({
        menuItemId: item.id,
        title: item.title,
        variantName: variant?.name,
        quantity: 1,
        unitPricePaise: variant?.pricePaise ?? item.basePricePaise,
      });
    }
    await persist(session);
    await sendWhatsAppButtons({
      to: message.from,
      body: `Added ${item.title}.\n${cartSummary(session.cart)}\nTotal ${paiseToRupees(cartTotal(session.cart))}`,
      buttons: [
        { id: "menu", title: "Add more" },
        { id: "checkout", title: "Checkout" },
        { id: "clear", title: "Clear cart" },
      ],
    });
    return;
  }

  if (id === "clear" || text === "clear") {
    session.cart = [];
    await persist(session);
    await kvDel(key(session.waId));
    await sendWhatsAppText(message.from, "Cart cleared. Send menu to start again.");
    return;
  }

  if (id === "checkout" || text.includes("checkout") || text.includes("place order")) {
    if (!session.cart.length) {
      await sendWhatsAppText(message.from, "Your cart is empty. Send menu to browse.");
      return;
    }
    const order = await createOrder({
      restaurantId: restaurant.id,
      channel: "WHATSAPP",
      customerName: session.name,
      customerPhone: message.from.replace(/^91/, "").slice(-10),
      customerNotes: "WhatsApp commerce",
      paymentGateway: "UPI",
      paymentStatus: "PENDING",
      lines: session.cart.map((line) => ({
        menuItemId: line.menuItemId,
        variantName: line.variantName,
        quantity: line.quantity,
      })),
    });
    session.cart = [];
    await persist(session);
    const payLink = restaurant.upiVpa
      ? `upi://pay?pa=${encodeURIComponent(restaurant.upiVpa)}&pn=${encodeURIComponent(restaurant.name)}&am=${(order.totalPaise / 100).toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Fooody #${order.orderNumber}`)}`
      : `${process.env.NEXT_PUBLIC_APP_URL ?? "https://fooody.in"}/${restaurant.slug}`;
    await sendWhatsAppText(
      message.from,
      `Order #${order.orderNumber} is on the kitchen board (${paiseToRupees(order.totalPaise)}).\nPay: ${payLink}`,
    );
    return;
  }

  await sendWhatsAppList({
    to: message.from,
    header: restaurant.name,
    body: `Hi ${session.name.split(" ")[0]}, order direct from ${restaurant.name} on Fooody. Choose a category.`,
    button: "Categories",
    sections: [
      {
        title: "Menu",
        rows: restaurant.categories.slice(0, 10).map((cat) => ({
          id: `cat:${cat.id}`,
          title: cat.name,
        })),
      },
    ],
  });
}
