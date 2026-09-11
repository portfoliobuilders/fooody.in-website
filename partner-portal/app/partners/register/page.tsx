"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export default function RegisterKitchenPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    restaurantName: "",
    city: "Kochi",
    area: "",
    address: "",
    phone: "",
    cuisine: "Cafe",
    ownerName: "",
    email: "",
    password: "",
  });

  async function submit() {
    setBusy(true);
    const res = await fetch("/api/auth/register-restaurant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      toast.error(data.error ?? "Could not register");
      return;
    }
    toast.success("Kitchen is live on Fooody. Your branded store is ready.");
    router.push(data.dashboardUrl);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian px-4 py-10 text-ivory">
      <Card className="w-full max-w-lg border-white/10 bg-charcoal text-ivory">
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <BrandMark />
            <div>
              <p className="font-display text-xl font-extrabold">
                fooody<span className="text-flame">.</span>in
              </p>
              <p className="text-xs uppercase tracking-[0.16em] text-gold">Register a kitchen</p>
            </div>
          </div>
          <p className="text-sm text-mist">
            We stand up your branded ordering site, table QR, WhatsApp, kitchen display and POS — and list you on Fooody the same moment.
          </p>
          {(
            [
              ["restaurantName", "Restaurant name"],
              ["area", "Area (Palarivattom)"],
              ["address", "Address"],
              ["phone", "Phone / WhatsApp"],
              ["cuisine", "Cuisine"],
              ["ownerName", "Owner name"],
              ["email", "Login email"],
              ["password", "Password"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <Label>{label}</Label>
              <Input
                type={key === "password" ? "password" : "text"}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
          <Button className="w-full" disabled={busy} onClick={() => void submit()}>
            Create store + Fooody listing
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
