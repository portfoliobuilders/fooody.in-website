"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Hour = { weekday: number; opensAt: string; closesAt: string; isClosed: boolean };

export function RestaurantSettings({ restaurantId }: { restaurantId: string }) {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [upiVpa, setUpiVpa] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [listed, setListed] = useState(true);
  const [brandPrimary, setBrandPrimary] = useState("#1F4D32");
  const [brandAccent, setBrandAccent] = useState("#C4A35A");
  const [hours, setHours] = useState<Hour[]>([]);
  const [storeUrl, setStoreUrl] = useState("");
  const [kioskUrl, setKioskUrl] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [storeQr, setStoreQr] = useState<string | null>(null);
  const [kioskQr, setKioskQr] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/tenant/${restaurantId}/settings`);
    const data = await res.json();
    const r = data.restaurant;
    if (!r) return;
    setName(r.name);
    setTagline(r.tagline);
    setPhone(r.phone);
    setWhatsappPhone(r.whatsappPhone ?? r.phone);
    setAddress(r.address);
    setArea(r.area);
    setCity(r.city);
    setCuisine(r.cuisine);
    setUpiVpa(r.upiVpa ?? "");
    setIsOpen(r.isOpen);
    setListed(r.listedOnMarketplace);
    setBrandPrimary(r.brandPrimary);
    setBrandAccent(r.brandAccent);
    setHours(r.hours ?? []);
    setStoreUrl(data.storeUrl);
    setKioskUrl(data.kioskUrl);
    setWhatsappUrl(data.whatsappUrl);
    setStoreQr(data.storeQr);
    setKioskQr(data.kioskQr);
  }

  useEffect(() => {
    void load();
  }, [restaurantId]);

  async function save() {
    const res = await fetch(`/api/tenant/${restaurantId}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        tagline,
        phone,
        whatsappPhone,
        address,
        area,
        city,
        cuisine,
        upiVpa,
        isOpen,
        listedOnMarketplace: listed,
        brandPrimary,
        brandAccent,
        hours,
      }),
    });
    if (!res.ok) {
      toast.error("Could not save");
      return;
    }
    toast.success("Store, kiosk, WhatsApp and Fooody listing updated");
    void load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Tagline</Label>
            <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input value={whatsappPhone} onChange={(e) => setWhatsappPhone(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div>
            <Label>Area</Label>
            <Input value={area} onChange={(e) => setArea(e.target.value)} />
          </div>
          <div>
            <Label>City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <Label>Cuisine</Label>
            <Input value={cuisine} onChange={(e) => setCuisine(e.target.value)} />
          </div>
          <div>
            <Label>UPI VPA</Label>
            <Input value={upiVpa} onChange={(e) => setUpiVpa(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={isOpen} onCheckedChange={setIsOpen} /> Kitchen open
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={listed} onCheckedChange={setListed} /> Listed on Fooody
          </label>
        </div>
        <div className="flex gap-3">
          <label className="text-sm">
            Brand
            <input className="ml-2" type="color" value={brandPrimary} onChange={(e) => setBrandPrimary(e.target.value)} />
          </label>
          <label className="text-sm">
            Accent
            <input className="ml-2" type="color" value={brandAccent} onChange={(e) => setBrandAccent(e.target.value)} />
          </label>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold">Hours</p>
          {hours.map((hour) => (
            <div key={hour.weekday} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="w-24">{DAYS[hour.weekday]}</span>
              <Input
                className="w-28"
                value={hour.opensAt}
                onChange={(e) =>
                  setHours((rows) => rows.map((h) => (h.weekday === hour.weekday ? { ...h, opensAt: e.target.value } : h)))
                }
              />
              <Input
                className="w-28"
                value={hour.closesAt}
                onChange={(e) =>
                  setHours((rows) => rows.map((h) => (h.weekday === hour.weekday ? { ...h, closesAt: e.target.value } : h)))
                }
              />
              <label className="flex items-center gap-2">
                <Switch
                  checked={hour.isClosed}
                  onCheckedChange={(v) =>
                    setHours((rows) => rows.map((h) => (h.weekday === hour.weekday ? { ...h, isClosed: v } : h)))
                  }
                />
                Closed
              </label>
            </div>
          ))}
        </div>
        <Button onClick={() => void save()}>Save kitchen details</Button>
      </div>
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-2">
            <p className="font-semibold">Customer QR</p>
            <p className="text-xs text-mist">Print these for tables, the counter kiosk, and WhatsApp.</p>
            {storeQr && (
              <div>
                <p className="text-xs">Digital menu (print this)</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={storeQr} alt={`${name} menu QR`} className="w-full rounded-xl bg-white p-3" />
                <a className="block text-xs underline" href={storeUrl} target="_blank" rel="noreferrer">
                  {storeUrl}
                </a>
                <a
                  className="mt-1 block text-xs font-semibold underline"
                  href={`/api/tenant/${restaurantId}/menu-qr`}
                >
                  Download SVG for table tents
                </a>
              </div>
            )}
            {kioskQr && (
              <div>
                <p className="text-xs">Counter kiosk</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={kioskQr} alt="Kiosk QR" className="w-full rounded-xl bg-white" />
                <a className="text-xs underline" href={kioskUrl}>
                  {kioskUrl}
                </a>
              </div>
            )}
            {whatsappUrl && (
              <a className="block text-xs underline" href={whatsappUrl}>
                WhatsApp order link
              </a>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
