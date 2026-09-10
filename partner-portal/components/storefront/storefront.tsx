"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { paiseToRupees } from "@/lib/money";

type Item = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  basePricePaise: number;
  diet: string;
  inStock: boolean;
  listedOnStorefront: boolean;
  categoryId: string;
  variants: { name: string; pricePaise: number }[];
};

type Restaurant = {
  name: string;
  slug: string;
  tagline: string;
  city: string;
  coverUrl: string | null;
  isOpen: boolean;
  upiVpa: string | null;
  categories: { id: string; name: string }[];
  items: Item[];
};

export function Storefront({ slug, tableNumber }: { slug: string; tableNumber?: string }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<{ item: Item; qty: number; variant?: string }[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [coupon, setCoupon] = useState("");

  useEffect(() => {
    void fetch(`/api/public/storefront/${slug}`)
      .then((r) => r.json())
      .then((data) => setRestaurant(data.restaurant));
    const timer = setInterval(() => {
      void fetch(`/api/public/storefront/${slug}`)
        .then((r) => r.json())
        .then((data) => setRestaurant(data.restaurant));
    }, 8000);
    return () => clearInterval(timer);
  }, [slug]);

  const visible = useMemo(
    () => restaurant?.items.filter((i) => i.listedOnStorefront) ?? [],
    [restaurant],
  );
  const total = cart.reduce((s, line) => {
    const variant = line.item.variants.find((v) => v.name === line.variant);
    return s + (variant?.pricePaise ?? line.item.basePricePaise) * line.qty;
  }, 0);

  async function place() {
    const res = await fetch(`/api/public/storefront/${slug}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: tableNumber ? "DINE_IN" : "TAKEAWAY",
        tableNumber,
        customerName: name,
        customerPhone: phone,
        customerNotes: notes,
        couponCode: coupon || undefined,
        paymentGateway: tableNumber ? "UPI" : "RAZORPAY",
        lines: cart.map((line) => ({
          menuItemId: line.item.id,
          variantName: line.variant,
          quantity: line.qty,
        })),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not place order");
      return;
    }
    toast.success(`Order #${data.order.orderNumber} sent to the kitchen`);
    if (restaurant?.upiVpa) {
      const amount = (data.order.totalPaise / 100).toFixed(2);
      const upi = `upi://pay?pa=${encodeURIComponent(restaurant.upiVpa)}&pn=${encodeURIComponent(restaurant.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Fooody #${data.order.orderNumber}`)}`;
      window.location.href = upi;
    }
    setCart([]);
  }

  if (!restaurant) return <p className="p-8">Loading store…</p>;

  return (
    <div className="min-h-screen bg-[#f8f4ec]">
      <header className="bg-obsidian px-4 py-4 text-ivory">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandMark />
            <div>
              <p className="font-display text-lg font-extrabold">{restaurant.name}</p>
              <p className="text-xs text-gold">fooody.in/{restaurant.slug}</p>
            </div>
          </div>
          {tableNumber && <Badge tone="gold">Table {tableNumber}</Badge>}
        </div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-mist">{restaurant.city}</p>
            <h1 className="font-display text-4xl font-extrabold">{restaurant.tagline}</h1>
          </div>
          {restaurant.categories.map((cat) => (
            <section key={cat.id}>
              <h2 className="font-display mb-3 text-2xl font-bold">{cat.name}</h2>
              <div className="grid gap-3">
                {visible
                  .filter((item) => item.categoryId === cat.id)
                  .map((item) => (
                    <Card key={item.id} className={!item.inStock ? "opacity-50" : ""}>
                      <CardContent className="flex gap-3">
                        {item.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt="" className="h-24 w-24 rounded-xl object-cover" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold">{item.title}</p>
                            <Badge tone={item.diet === "VEG" ? "veg" : "nonveg"}>{item.diet}</Badge>
                          </div>
                          <p className="text-sm text-mist">{item.description}</p>
                          <p className="mt-1 font-semibold">{paiseToRupees(item.basePricePaise)}</p>
                          {item.inStock ? (
                            <Button
                              size="sm"
                              className="mt-2"
                              onClick={() =>
                                setCart((c) => [...c, { item, qty: 1, variant: item.variants[0]?.name }])
                              }
                            >
                              Add
                            </Button>
                          ) : (
                            <p className="mt-2 text-xs text-flame">Currently 86&apos;d</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </section>
          ))}
        </div>
        <aside className="h-fit rounded-2xl border border-black/10 bg-white p-4">
          <p className="font-display text-xl font-bold">Your order</p>
          {cart.length === 0 && <p className="mt-2 text-sm text-mist">Add plates from the menu.</p>}
          <ul className="mt-3 space-y-2 text-sm">
            {cart.map((line, i) => (
              <li key={i} className="flex justify-between gap-2">
                <span>
                  {line.qty}× {line.item.title}
                </span>
                <button className="text-flame" onClick={() => setCart(cart.filter((_, idx) => idx !== i))}>
                  ×
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 font-semibold">{paiseToRupees(total)}</p>
          <div className="mt-3 space-y-2">
            <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Input placeholder="Coupon" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
            <Button className="w-full" disabled={!cart.length || !name || !phone} onClick={() => void place()}>
              {tableNumber
                ? restaurant.upiVpa
                  ? "Place order & pay UPI"
                  : "Place table order"
                : "Place direct order"}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
