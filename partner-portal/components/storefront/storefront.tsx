"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bike,
  CreditCard,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Smartphone,
  Store,
  UtensilsCrossed,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { paiseToRupees } from "@/lib/money";
import { CHANNEL_LABEL, ORDER_STATUS_LABEL } from "@/lib/tenant/host";

type Diet = "VEG" | "NON_VEG" | "EGG";
type Channel = "DINE_IN" | "TAKEAWAY" | "ONLINE_DELIVERY";
type Step = "welcome" | "menu" | "checkout" | "ticket";

type ModifierOption = { name: string; pricePaise: number; inStock: boolean };
type ModifierGroup = {
  id: string;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: ModifierOption[];
};

type Item = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  basePricePaise: number;
  diet: Diet;
  inStock: boolean;
  listedOnStorefront: boolean;
  categoryId: string;
  variants: { name: string; pricePaise: number; isDefault: boolean; inStock: boolean }[];
  itemModifiers?: { group: ModifierGroup }[];
};

type Restaurant = {
  name: string;
  slug: string;
  tagline: string;
  city: string;
  area: string;
  address: string;
  phone: string;
  whatsappPhone: string | null;
  cuisine: string;
  coverUrl: string | null;
  logoUrl: string | null;
  isOpen: boolean;
  upiVpa: string | null;
  brandPrimary: string;
  brandAccent: string;
  brandBackground: string;
  prepTimeMins: number;
  rating: number;
  categories: { id: string; name: string }[];
  items: Item[];
  tables: { number: string; seats: number; status: string }[];
  hours: { weekday: number; opensAt: string; closesAt: string; isClosed: boolean }[];
};

type CartLine = {
  key: string;
  item: Item;
  qty: number;
  variant?: string;
  modifiers: { name: string; pricePaise: number }[];
};

type Placed = {
  id: string;
  orderNumber: number;
  totalPaise: number;
  channel: Channel;
  items: { title: string; quantity: number; variantName?: string | null }[];
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function lineUnit(line: CartLine) {
  const variant = line.item.variants.find((v) => v.name === line.variant);
  const mods = line.modifiers.reduce((s, m) => s + m.pricePaise, 0);
  return (variant?.pricePaise ?? line.item.basePricePaise) + mods;
}

function waLink(phone: string | null, name: string) {
  const digits = (phone ?? "").replace(/\D/g, "").replace(/^0/, "");
  const intl = digits.length === 10 ? `91${digits}` : digits;
  if (!intl) return null;
  const text = encodeURIComponent(`Hi ${name}, I would like to order.`);
  return `https://wa.me/${intl}?text=${text}`;
}

function DietDot({ diet }: { diet: Diet }) {
  const color = diet === "VEG" ? "bg-emerald-600" : diet === "EGG" ? "bg-amber-500" : "bg-rose-600";
  return (
    <span className="inline-flex size-3 items-center justify-center rounded-[3px] border border-black/20" title={diet}>
      <span className={`size-1.5 rounded-full ${color}`} />
    </span>
  );
}

export function Storefront({
  slug,
  tableNumber,
  kiosk = false,
}: {
  slug: string;
  tableNumber?: string;
  kiosk?: boolean;
}) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [step, setStep] = useState<Step>(tableNumber ? "menu" : "welcome");
  const [channel, setChannel] = useState<Channel>(tableNumber ? "DINE_IN" : "TAKEAWAY");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [picked, setPicked] = useState<Item | null>(null);
  const [pickVariant, setPickVariant] = useState<string>("");
  const [pickMods, setPickMods] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [coupon, setCoupon] = useState("");
  const [address, setAddress] = useState("");
  const [table, setTable] = useState(tableNumber ?? "");
  const [payMethod, setPayMethod] = useState<"UPI" | "CARD" | "CASH">("UPI");
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [upiQr, setUpiQr] = useState<string | null>(null);
  const [upiUri, setUpiUri] = useState<string | null>(null);
  const [trackUrl, setTrackUrl] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<string>("PENDING");

  useEffect(() => {
    void fetch(`/api/public/storefront/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.restaurant) {
          setRestaurant(data.restaurant);
          const first = data.restaurant.categories[0]?.id;
          if (first) setActiveCat(first);
        }
      });
  }, [slug]);

  useEffect(() => {
    if (!placed) return;
    const timer = setInterval(() => {
      void fetch(`/api/public/orders/${placed.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.order?.status) setLiveStatus(data.order.status);
        });
    }, 6000);
    return () => clearInterval(timer);
  }, [placed]);

  const visible = useMemo(() => {
    if (!restaurant) return [];
    const q = query.trim().toLowerCase();
    return restaurant.items.filter((item) => {
      if (!item.listedOnStorefront) return false;
      if (activeCat !== "all" && item.categoryId !== activeCat) return false;
      if (q && !item.title.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [restaurant, activeCat, query]);

  const total = cart.reduce((s, line) => s + lineUnit(line) * line.qty, 0);
  const count = cart.reduce((s, line) => s + line.qty, 0);
  const todayHours = restaurant?.hours.find((h) => h.weekday === new Date().getDay());

  function openItem(item: Item) {
    if (!item.inStock) return;
    const def = item.variants.find((v) => v.isDefault) ?? item.variants[0];
    setPicked(item);
    setPickVariant(def?.name ?? "");
    setPickMods([]);
  }

  function addPicked() {
    if (!picked) return;
    const modifiers = (picked.itemModifiers ?? []).flatMap((row) =>
      row.group.options.filter((o) => pickMods.includes(`${row.group.id}:${o.name}`)).map((o) => ({
        name: o.name,
        pricePaise: o.pricePaise,
      })),
    );
    const key = `${picked.id}|${pickVariant}|${modifiers.map((m) => m.name).join(",")}`;
    setCart((prev) => {
      const hit = prev.find((l) => l.key === key);
      if (hit) return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { key, item: picked, qty: 1, variant: pickVariant || undefined, modifiers }];
    });
    setPicked(null);
    toast.success(`Added ${picked.title}`);
  }

  function bump(key: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0),
    );
  }

  async function place() {
    if (!restaurant) return;
    setBusy(true);
    const res = await fetch(`/api/public/storefront/${slug}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel,
        tableNumber: channel === "DINE_IN" ? table || undefined : undefined,
        customerName: name,
        customerPhone: phone,
        customerNotes: notes,
        deliveryAddress: channel === "ONLINE_DELIVERY" ? address : undefined,
        couponCode: coupon || undefined,
        paymentGateway: payMethod,
        cashOnDelivery: payMethod === "CASH",
        lines: cart.map((line) => ({
          menuItemId: line.item.id,
          variantName: line.variant,
          quantity: line.qty,
          modifiers: line.modifiers,
        })),
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      toast.error(data.error ?? "Could not place order");
      return;
    }
    setPlaced({
      id: data.order.id,
      orderNumber: data.order.orderNumber,
      totalPaise: data.order.totalPaise,
      channel,
      items: data.order.items,
    });
    setLiveStatus(data.order.status ?? "PENDING");
    setUpiQr(data.upiQrDataUrl ?? null);
    setUpiUri(data.upiUri ?? null);
    setTrackUrl(data.trackUrl ?? null);
    setCart([]);
    setStep("ticket");
  }

  if (!restaurant) {
    return <p className="p-8 text-center text-sm text-mist">Opening the kitchen…</p>;
  }

  const theme = {
    ["--store-ink" as string]: restaurant.brandPrimary,
    ["--store-gold" as string]: restaurant.brandAccent,
    ["--store-paper" as string]: restaurant.brandBackground,
  } as React.CSSProperties;
  const whatsapp = waLink(restaurant.whatsappPhone ?? restaurant.phone, restaurant.name);

  return (
    <div className="min-h-screen" style={{ ...theme, background: restaurant.brandBackground, color: restaurant.brandPrimary }}>
      {step === "welcome" && (
        <Welcome
          restaurant={restaurant}
          kiosk={kiosk}
          todayHours={todayHours}
          whatsapp={whatsapp}
          onPick={(next) => {
            setChannel(next);
            setStep("menu");
          }}
        />
      )}

      {step === "menu" && (
        <div className={`mx-auto grid min-h-screen ${kiosk ? "max-w-none" : "max-w-6xl"} lg:grid-cols-[15rem_1fr_20rem]`}>
          <aside className="hidden border-r border-black/10 lg:block" style={{ background: restaurant.brandPrimary, color: "#f6ede0" }}>
            <div className="sticky top-0 space-y-1 p-4">
              <p className="px-3 pt-2 text-[11px] tracking-[0.2em] uppercase opacity-70">Menu</p>
              <button
                className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${activeCat === "all" ? "bg-white/15 font-semibold" : "opacity-80 hover:bg-white/10"}`}
                onClick={() => setActiveCat("all")}
              >
                All
              </button>
              {restaurant.categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${activeCat === cat.id ? "bg-white/15 font-semibold" : "opacity-80 hover:bg-white/10"}`}
                  onClick={() => setActiveCat(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </aside>

          <div className="min-w-0">
            <header className="sticky top-0 z-20 border-b border-black/10 px-4 py-3 backdrop-blur" style={{ background: `${restaurant.brandBackground}ee` }}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {restaurant.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={restaurant.logoUrl} alt="" className="size-10 rounded-full object-cover" />
                  ) : (
                    <span className="grid size-10 place-items-center rounded-full text-lg font-black" style={{ background: restaurant.brandPrimary, color: restaurant.brandAccent }}>
                      {restaurant.name[0]}
                    </span>
                  )}
                  <div>
                    <p className="font-display text-lg font-extrabold leading-tight">{restaurant.name}</p>
                    <p className="text-xs opacity-70">
                      {CHANNEL_LABEL[channel]}
                      {table ? ` · Table ${table}` : ""} · {restaurant.prepTimeMins} min
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!tableNumber && (
                    <button className="hidden text-xs underline sm:inline" onClick={() => setStep("welcome")}>
                      Change
                    </button>
                  )}
                  {whatsapp && (
                    <a href={whatsapp} className="rounded-full p-2" style={{ background: restaurant.brandPrimary, color: restaurant.brandAccent }} aria-label="WhatsApp">
                      <MessageCircle className="size-4" />
                    </a>
                  )}
                  <button
                    className="relative rounded-full px-3 py-2 text-sm font-semibold text-white"
                    style={{ background: restaurant.brandPrimary }}
                    onClick={() => setStep("checkout")}
                  >
                    <ShoppingBag className="mr-1 inline size-4" />
                    {paiseToRupees(total)}
                    {count > 0 && (
                      <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full text-[10px] font-bold" style={{ background: restaurant.brandAccent, color: restaurant.brandPrimary }}>
                        {count}
                      </span>
                    )}
                  </button>
                </div>
              </div>
              <div className="relative mt-3">
                <Search className="absolute top-2.5 left-3 size-4 opacity-50" />
                <Input className="pl-9" placeholder="Search menu" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                <button
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${activeCat === "all" ? "text-white" : "bg-black/5"}`}
                  style={activeCat === "all" ? { background: restaurant.brandPrimary } : undefined}
                  onClick={() => setActiveCat("all")}
                >
                  All
                </button>
                {restaurant.categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${activeCat === cat.id ? "text-white" : "bg-black/5"}`}
                    style={activeCat === cat.id ? { background: restaurant.brandPrimary } : undefined}
                    onClick={() => setActiveCat(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </header>

            <div className={`grid gap-3 p-4 ${kiosk ? "sm:grid-cols-3 xl:grid-cols-4" : "sm:grid-cols-2"}`}>
              {visible.map((item) => (
                <button
                  key={item.id}
                  disabled={!item.inStock}
                  onClick={() => openItem(item)}
                  className="overflow-hidden rounded-2xl border border-black/8 bg-white text-left shadow-sm disabled:opacity-50"
                >
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="h-32 w-full object-cover" />
                  )}
                  <div className="space-y-1 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold leading-snug">{item.title}</p>
                      <DietDot diet={item.diet} />
                    </div>
                    {item.description ? <p className="line-clamp-2 text-xs opacity-60">{item.description}</p> : null}
                    <p className="font-display font-bold">{paiseToRupees(item.basePricePaise)}</p>
                    {!item.inStock && <p className="text-xs text-rose-600">Sold out</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <aside className="hidden border-l border-black/10 bg-white/70 p-4 lg:block">
            <CartPanel
              cart={cart}
              total={total}
              accent={restaurant.brandAccent}
              ink={restaurant.brandPrimary}
              onBump={bump}
              onCheckout={() => setStep("checkout")}
            />
          </aside>
        </div>
      )}

      {step === "checkout" && (
        <div className="mx-auto max-w-lg px-4 py-8">
          <button className="mb-4 text-sm underline" onClick={() => setStep("menu")}>
            ← Back to menu
          </button>
          <h1 className="font-display text-3xl font-extrabold">Pay like a kiosk</h1>
          <p className="mt-1 text-sm opacity-70">
            {CHANNEL_LABEL[channel]} · kitchen and cashier get this ticket the moment you confirm
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {cart.map((line) => (
              <li key={line.key} className="flex items-center justify-between gap-2 rounded-xl bg-white/80 px-3 py-2">
                <span>
                  {line.item.title}
                  {line.variant ? ` · ${line.variant}` : ""}
                  {line.modifiers.length ? ` + ${line.modifiers.map((m) => m.name).join(", ")}` : ""}
                </span>
                <span className="flex items-center gap-2">
                  <button onClick={() => bump(line.key, -1)} className="rounded-full bg-black/5 p-1">
                    <Minus className="size-3" />
                  </button>
                  {line.qty}
                  <button onClick={() => bump(line.key, 1)} className="rounded-full bg-black/5 p-1">
                    <Plus className="size-3" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 font-display text-2xl font-bold">{paiseToRupees(total)}</p>
          <div className="mt-4 space-y-3">
            <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            {channel === "ONLINE_DELIVERY" && (
              <Input placeholder="Delivery address" value={address} onChange={(e) => setAddress(e.target.value)} />
            )}
            {channel === "DINE_IN" && !tableNumber && (
              <select
                className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
                value={table}
                onChange={(e) => setTable(e.target.value)}
              >
                <option value="">Any table / walk-in</option>
                {restaurant.tables.map((t) => (
                  <option key={t.number} value={t.number}>
                    Table {t.number} · {t.seats} seats
                  </option>
                ))}
              </select>
            )}
            <Input placeholder="Notes for kitchen" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Input placeholder="Coupon (try BAKETREE10)" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
            <p className="text-xs font-semibold tracking-wide uppercase opacity-60">Pay here</p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["UPI", Smartphone, "UPI / QR"],
                  ["CARD", CreditCard, "Card"],
                  ["CASH", Wallet, "Cash"],
                ] as const
              ).map(([id, Icon, label]) => (
                <button
                  key={id}
                  className={`rounded-2xl border p-3 text-center text-sm ${payMethod === id ? "border-transparent text-white" : "border-black/10 bg-white"}`}
                  style={payMethod === id ? { background: restaurant.brandPrimary } : undefined}
                  onClick={() => setPayMethod(id)}
                >
                  <Icon className="mx-auto mb-1 size-5" />
                  {label}
                </button>
              ))}
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={!cart.length || !name || !phone || busy || (channel === "ONLINE_DELIVERY" && !address)}
              onClick={() => void place()}
              style={{ background: restaurant.brandPrimary, color: "#fff" }}
            >
              {busy ? "Sending to kitchen…" : `Place order · ${paiseToRupees(total)}`}
            </Button>
          </div>
        </div>
      )}

      {step === "ticket" && placed && (
        <div className="mx-auto max-w-md px-4 py-12 text-center">
          <p className="text-xs tracking-[0.2em] uppercase opacity-60">{restaurant.name}</p>
          <p className="mt-2 text-sm">Your order number</p>
          <p className="font-display text-7xl font-black" style={{ color: restaurant.brandPrimary }}>
            {placed.orderNumber}
          </p>
          <p className="mt-2 text-sm font-semibold">
            {ORDER_STATUS_LABEL[liveStatus as keyof typeof ORDER_STATUS_LABEL] ?? liveStatus} · {CHANNEL_LABEL[placed.channel]}
          </p>
          <p className="mt-1 text-lg font-bold">{paiseToRupees(placed.totalPaise)}</p>
          <ul className="mt-4 space-y-1 text-left text-sm">
            {placed.items.map((item, i) => (
              <li key={i}>
                {item.quantity}× {item.title}
                {item.variantName ? ` (${item.variantName})` : ""}
              </li>
            ))}
          </ul>
          {payMethod === "UPI" && upiQr && (
            <div className="mt-6 rounded-3xl bg-white p-4">
              <p className="text-sm font-semibold">Scan to pay (UPI)</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={upiQr} alt="UPI QR" className="mx-auto mt-2 size-52" />
              {upiUri && (
                <a href={upiUri} className="mt-2 inline-block text-sm underline">
                  Open UPI app
                </a>
              )}
              <p className="mt-2 text-xs opacity-60">Show this screen at the counter if the cashier needs to confirm.</p>
            </div>
          )}
          {payMethod === "CARD" && (
            <p className="mt-6 rounded-2xl bg-white p-4 text-sm">Tap or insert your card at the counter. The POS ticket is already open.</p>
          )}
          {payMethod === "CASH" && (
            <p className="mt-6 rounded-2xl bg-white p-4 text-sm">Pay cash when you collect. Kitchen is already cooking.</p>
          )}
          {trackUrl && (
            <a href={trackUrl} className="mt-6 inline-block rounded-full px-5 py-3 text-sm font-semibold text-white" style={{ background: restaurant.brandPrimary }}>
              Track this order
            </a>
          )}
          {whatsapp && (
            <a href={whatsapp} className="mt-3 block text-sm underline">
              Message us on WhatsApp
            </a>
          )}
          <button
            className="mt-8 text-sm underline"
            onClick={() => {
              setPlaced(null);
              setStep("menu");
            }}
          >
            Order more
          </button>
        </div>
      )}

      {picked && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-0 sm:place-items-center sm:p-6">
          <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 sm:max-w-md sm:rounded-3xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-xl font-bold">{picked.title}</p>
                <p className="text-sm opacity-60">{picked.description}</p>
              </div>
              <button onClick={() => setPicked(null)}>
                <X className="size-5" />
              </button>
            </div>
            {picked.variants.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-60">Size</p>
                {picked.variants.map((v) => (
                  <label key={v.name} className="flex items-center justify-between rounded-xl border border-black/10 px-3 py-2 text-sm">
                    <span>
                      <input
                        type="radio"
                        className="mr-2"
                        checked={pickVariant === v.name}
                        onChange={() => setPickVariant(v.name)}
                      />
                      {v.name}
                    </span>
                    {paiseToRupees(v.pricePaise)}
                  </label>
                ))}
              </div>
            )}
            {(picked.itemModifiers ?? []).map((row) => (
              <div key={row.group.id} className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-60">{row.group.name}</p>
                {row.group.options.map((opt) => {
                  const id = `${row.group.id}:${opt.name}`;
                  return (
                    <label key={id} className="flex items-center justify-between rounded-xl border border-black/10 px-3 py-2 text-sm">
                      <span>
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={pickMods.includes(id)}
                          onChange={() =>
                            setPickMods((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]))
                          }
                        />
                        {opt.name}
                      </span>
                      {opt.pricePaise ? `+ ${paiseToRupees(opt.pricePaise)}` : "Included"}
                    </label>
                  );
                })}
              </div>
            ))}
            <Button className="mt-5 w-full" onClick={addPicked} style={{ background: restaurant.brandPrimary }}>
              Add to order
            </Button>
          </div>
        </div>
      )}

      {step === "menu" && (
        <button
          className="fixed right-4 bottom-4 z-30 rounded-full px-5 py-3 font-semibold text-white shadow-lg lg:hidden"
          style={{ background: restaurant.brandPrimary }}
          onClick={() => setStep("checkout")}
        >
          View order · {paiseToRupees(total)}
        </button>
      )}
    </div>
  );
}

function Welcome({
  restaurant,
  kiosk,
  todayHours,
  whatsapp,
  onPick,
}: {
  restaurant: Restaurant;
  kiosk: boolean;
  todayHours?: Restaurant["hours"][number];
  whatsapp: string | null;
  onPick: (channel: Channel) => void;
}) {
  const options: { id: Channel; title: string; hint: string; icon: typeof UtensilsCrossed; hide?: boolean }[] = [
    { id: "DINE_IN", title: "Dine in", hint: "Eat at the cafe", icon: UtensilsCrossed },
    { id: "TAKEAWAY", title: "Takeaway", hint: "Pick up at the counter", icon: ShoppingBag },
    { id: "ONLINE_DELIVERY", title: "Delivery", hint: `Around ${restaurant.area}`, icon: Bike, hide: kiosk },
  ];
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8">
      {restaurant.coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={restaurant.coverUrl} alt="" className="mb-6 h-48 w-full rounded-3xl object-cover" />
      )}
      <p className="text-xs tracking-[0.22em] uppercase opacity-60">{restaurant.cuisine}</p>
      <h1 className="font-display mt-2 text-5xl font-black">{restaurant.name}</h1>
      <p className="mt-2 text-lg opacity-80">{restaurant.tagline}</p>
      <p className="mt-3 flex items-center gap-2 text-sm opacity-70">
        <MapPin className="size-4" /> {restaurant.address}
      </p>
      <p className="text-sm opacity-70">
        {todayHours?.isClosed ? "Closed today" : `Open ${todayHours?.opensAt ?? "11:00"} – ${todayHours?.closesAt ?? "23:00"}`} · {restaurant.rating}★ · {restaurant.phone}
      </p>
      {!restaurant.isOpen && <p className="mt-2 text-sm text-rose-700">Kitchen is paused right now.</p>}
      <div className={`mt-8 grid gap-3 ${kiosk ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        {options
          .filter((o) => !o.hide)
          .map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                disabled={!restaurant.isOpen}
                onClick={() => onPick(opt.id)}
                className="rounded-3xl p-6 text-left text-white shadow-md"
                style={{ background: restaurant.brandPrimary }}
              >
                <Icon className="size-8" style={{ color: restaurant.brandAccent }} />
                <p className="font-display mt-4 text-2xl font-bold">{opt.title}</p>
                <p className="text-sm opacity-80">{opt.hint}</p>
              </button>
            );
          })}
      </div>
      {whatsapp && (
        <a
          href={whatsapp}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold"
        >
          <MessageCircle className="size-4" /> Order on WhatsApp
        </a>
      )}
      <p className="mt-auto pt-10 text-center text-[11px] opacity-50">
        <Store className="mr-1 inline size-3" /> Direct ordering · table QR and WhatsApp hit the same kitchen board
      </p>
    </div>
  );
}

function CartPanel({
  cart,
  total,
  ink,
  onBump,
  onCheckout,
}: {
  cart: CartLine[];
  total: number;
  accent: string;
  ink: string;
  onBump: (key: string, delta: number) => void;
  onCheckout: () => void;
}) {
  return (
    <div className="sticky top-4">
      <p className="font-display text-xl font-bold">Your order</p>
      {cart.length === 0 && <p className="mt-2 text-sm opacity-60">Add items from the menu.</p>}
      <ul className="mt-3 space-y-2 text-sm">
        {cart.map((line) => (
          <li key={line.key} className="flex items-start justify-between gap-2">
            <span>
              {line.item.title}
              {line.variant ? ` · ${line.variant}` : ""}
            </span>
            <span className="flex items-center gap-1">
              <button onClick={() => onBump(line.key, -1)}>
                <Minus className="size-3" />
              </button>
              {line.qty}
              <button onClick={() => onBump(line.key, 1)}>
                <Plus className="size-3" />
              </button>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-display text-2xl font-bold">{paiseToRupees(total)}</p>
      <Button className="mt-3 w-full" disabled={!cart.length} onClick={onCheckout} style={{ background: ink }}>
        Continue to pay
      </Button>
    </div>
  );
}
