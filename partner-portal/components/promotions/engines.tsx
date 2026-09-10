"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { paiseToRupees, rupeesToPaise } from "@/lib/money";

export function CouponBuilder({ restaurantId }: { restaurantId: string }) {
  const [coupons, setCoupons] = useState<
    { id: string; code: string; type: string; value: number; minOrderPaise: number; channel: string; isActive: boolean; _count: { redemptions: number } }[]
  >([]);
  const [form, setForm] = useState({
    code: "",
    type: "PERCENTAGE",
    value: "10",
    minOrder: "300",
    maxCap: "80",
    channel: "ALL",
  });

  async function load() {
    const res = await fetch(`/api/tenant/${restaurantId}/promotions`);
    const data = await res.json();
    setCoupons(data.coupons ?? []);
  }

  useEffect(() => {
    void load();
  }, [restaurantId]);

  async function save() {
    await fetch(`/api/tenant/${restaurantId}/promotions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: form.type === "PERCENTAGE" ? Number(form.value) : rupeesToPaise(Number(form.value)),
        minOrderPaise: rupeesToPaise(Number(form.minOrder)),
        maxDiscountPaise: form.maxCap ? rupeesToPaise(Number(form.maxCap)) : null,
        channel: form.channel,
      }),
    });
    setForm({ ...form, code: "" });
    void load();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
      <Card>
        <CardContent className="space-y-3">
          <CardTitle>Coupon builder</CardTitle>
          <Label>Code</Label>
          <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <Label>Type</Label>
          <select
            className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm dark:border-white/10 dark:bg-obsidian/60"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FLAT">Flat ₹</option>
          </select>
          <Label>{form.type === "PERCENTAGE" ? "Percent" : "Flat rupees"}</Label>
          <Input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          <Label>Min order ₹</Label>
          <Input value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} />
          <Label>Max cap ₹</Label>
          <Input value={form.maxCap} onChange={(e) => setForm({ ...form, maxCap: e.target.value })} />
          <Label>Channel</Label>
          <select
            className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm dark:border-white/10 dark:bg-obsidian/60"
            value={form.channel}
            onChange={(e) => setForm({ ...form, channel: e.target.value })}
          >
            <option value="ALL">All</option>
            <option value="ONLINE_DELIVERY">Delivery only</option>
            <option value="DINE_IN">Dine-in only</option>
            <option value="TAKEAWAY">Takeaway only</option>
            <option value="WHATSAPP">WhatsApp only</option>
          </select>
          <Button onClick={() => void save()}>Create coupon</Button>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {coupons.map((coupon) => (
          <Card key={coupon.id}>
            <CardContent className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-lg font-bold">{coupon.code}</p>
                <p className="text-sm text-mist">
                  {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : paiseToRupees(coupon.value)} · min{" "}
                  {paiseToRupees(coupon.minOrderPaise)} · {coupon.channel} · {coupon._count.redemptions} used
                </p>
              </div>
              <Switch checked={coupon.isActive} disabled />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdManager({ restaurantId }: { restaurantId: string }) {
  const [campaigns, setCampaigns] = useState<
    { id: string; name: string; dailyBudgetPaise: number; spentTodayPaise: number; status: string }[]
  >([]);
  const [name, setName] = useState("Marketplace lunch boost");
  const [budget, setBudget] = useState("1500");

  async function load() {
    const res = await fetch(`/api/tenant/${restaurantId}/ads`);
    const data = await res.json();
    setCampaigns(data.campaigns ?? []);
  }

  useEffect(() => {
    void load();
  }, [restaurantId]);

  async function save() {
    await fetch(`/api/tenant/${restaurantId}/ads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, dailyBudgetPaise: rupeesToPaise(Number(budget)) }),
    });
    void load();
  }

  async function pause(id: string, status: string) {
    const campaign = campaigns.find((c) => c.id === id);
    if (!campaign) return;
    await fetch(`/api/tenant/${restaurantId}/ads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        name: campaign.name,
        dailyBudgetPaise: campaign.dailyBudgetPaise,
        status,
      }),
    });
    void load();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_10rem_auto]">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <Input value={budget} onChange={(e) => setBudget(e.target.value)} />
          <Button onClick={() => void save()}>Launch campaign</Button>
        </CardContent>
      </Card>
      {campaigns.map((c) => {
        const pct = c.dailyBudgetPaise ? Math.min(100, (c.spentTodayPaise / c.dailyBudgetPaise) * 100) : 0;
        return (
          <Card key={c.id}>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle>{c.name}</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void pause(c.id, c.status === "ACTIVE" ? "PAUSED" : "ACTIVE")}
                >
                  {c.status === "ACTIVE" ? "Pause" : "Resume"}
                </Button>
              </div>
              <p className="text-sm text-mist">
                Daily budget {paiseToRupees(c.dailyBudgetPaise)} · spent today {paiseToRupees(c.spentTodayPaise)}
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-black/10">
                <div className="h-full bg-gradient-to-r from-flame to-ember" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-gold">Boosts ranking in the Fooody marketplace search.</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function StaffPanel({ restaurantId }: { restaurantId: string }) {
  const [members, setMembers] = useState<{ id: string; role: string; user: { name: string; email: string | null; phone: string | null } }[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MANAGER");

  async function load() {
    const res = await fetch(`/api/tenant/${restaurantId}/staff`);
    const data = await res.json();
    setMembers(data.members ?? []);
  }

  useEffect(() => {
    void load();
  }, [restaurantId]);

  async function invite() {
    await fetch(`/api/tenant/${restaurantId}/staff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    setEmail("");
    void load();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap gap-2">
          <Input placeholder="staff@restaurant.in" value={email} onChange={(e) => setEmail(e.target.value)} />
          <select
            className="h-10 rounded-xl border border-black/10 px-3 text-sm dark:border-white/10 dark:bg-obsidian/60"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option>OWNER</option>
            <option>MANAGER</option>
            <option>KITCHEN_STAFF</option>
            <option>BILLING_CASHIER</option>
            <option>DELIVERY_DRIVER</option>
          </select>
          <Button onClick={() => void invite()}>Add staff</Button>
        </CardContent>
      </Card>
      {members.map((m) => (
        <Card key={m.id}>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{m.user.name}</p>
              <p className="text-sm text-mist">{m.user.email ?? m.user.phone}</p>
            </div>
            <p className="text-xs uppercase text-gold">{m.role}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
