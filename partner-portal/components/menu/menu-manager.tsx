"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { paiseToRupees, rupeesToPaise } from "@/lib/money";

type Item = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  basePricePaise: number;
  taxRateBps: number;
  diet: "VEG" | "NON_VEG" | "EGG";
  prepTimeMins: number;
  inStock: boolean;
  categoryId: string;
  variants: { name: string; pricePaise: number; isDefault: boolean }[];
};

export function MenuManager({ restaurantId }: { restaurantId: string }) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    price: "280",
    tax: "5",
    diet: "VEG",
    prep: "20",
    imageUrl: "",
    variants: "Half:180, Full:280",
  });

  async function load() {
    const res = await fetch(`/api/tenant/${restaurantId}/menu`);
    const data = await res.json();
    setCategories(data.categories ?? []);
    setItems(data.items ?? []);
  }

  useEffect(() => {
    void load();
    const source = new EventSource(`/api/tenant/${restaurantId}/orders/stream`);
    source.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { type: string };
      if (payload.type === "menu.updated") void load();
    };
    return () => source.close();
  }, [restaurantId]);

  async function toggle(item: Item, inStock: boolean) {
    await fetch(`/api/tenant/${restaurantId}/menu/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inStock }),
    });
    toast.success(`${item.title} is ${inStock ? "in stock" : "86'd"} — storefront + marketplace synced`);
    void load();
  }

  async function addCategory() {
    const name = prompt("Category name?");
    if (!name) return;
    await fetch(`/api/tenant/${restaurantId}/menu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "category", name }),
    });
    void load();
  }

  async function saveItem() {
    const variants = form.variants
      .split(",")
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk, index) => {
        const [name, price] = chunk.split(":");
        return {
          name: name.trim(),
          pricePaise: rupeesToPaise(Number(price)),
          isDefault: index === 0,
        };
      });
    await fetch(`/api/tenant/${restaurantId}/menu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: form.categoryId || categories[0]?.id,
        title: form.title,
        description: form.description,
        imageUrl: form.imageUrl || undefined,
        basePricePaise: rupeesToPaise(Number(form.price)),
        taxRateBps: Math.round(Number(form.tax) * 100),
        diet: form.diet,
        prepTimeMins: Number(form.prep),
        variants,
      }),
    });
    setOpen(false);
    toast.success("Item published");
    void load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={addCategory}>
          New category
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add food item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>New menu item</DialogTitle>
            <div className="mt-4 grid gap-3">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Label>Base price (₹)</Label>
              <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <Label>GST %</Label>
              <Input value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} />
              <Label>Image URL (Cloudinary / S3)</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              <Label>Variants (Name:₹, comma-separated)</Label>
              <Input value={form.variants} onChange={(e) => setForm({ ...form, variants: e.target.value })} />
              <Button onClick={() => void saveItem()}>Save item</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="space-y-3">
              {item.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt="" className="h-36 w-full rounded-xl object-cover" />
              )}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display font-bold">{item.title}</p>
                  <p className="text-sm text-mist line-clamp-2">{item.description}</p>
                </div>
                <Badge tone={item.diet === "VEG" ? "veg" : "nonveg"}>{item.diet}</Badge>
              </div>
              <p className="font-semibold">{paiseToRupees(item.basePricePaise)}</p>
              <p className="text-xs text-mist">
                GST {(item.taxRateBps / 100).toFixed(1)}% · {item.prepTimeMins} min
                {item.variants.length ? ` · ${item.variants.map((v) => v.name).join("/")}` : ""}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm">{item.inStock ? "In stock" : "86 / out of stock"}</span>
                <Switch checked={item.inStock} onCheckedChange={(v) => void toggle(item, v)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
