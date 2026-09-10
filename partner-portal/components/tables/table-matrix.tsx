"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TABLE_STATUS_LABEL } from "@/lib/tenant/host";

type Table = {
  id: string;
  number: string;
  seats: number;
  status: keyof typeof TABLE_STATUS_LABEL;
  qrPath: string;
  liveOrderNumber: number | null;
};

type Zone = {
  id: string;
  name: string;
  kind: string;
  tables: Table[];
};

const TONE: Record<Table["status"], string> = {
  VACANT: "border-emerald-400/60 bg-emerald-50 dark:bg-emerald-500/10",
  OCCUPIED: "border-flame/50 bg-flame/10",
  BILL_PRINTED: "border-amber-400 bg-amber-50 dark:bg-amber-500/10",
  RESERVED: "border-sky-400 bg-sky-50 dark:bg-sky-500/15",
};

export function TableMatrix({ restaurantId }: { restaurantId: string }) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [qr, setQr] = useState<{ url: string; dataUrl: string; number: string } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/tenant/${restaurantId}/tables`);
    const data = await res.json();
    setZones(data.zones ?? []);
  }, [restaurantId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const source = new EventSource(`/api/tenant/${restaurantId}/orders/stream`);
    source.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { type: string };
      if (payload.type === "table.updated" || payload.type === "order.created" || payload.type === "order.updated") {
        void load();
      }
    };
    return () => source.close();
  }, [restaurantId, load]);

  async function addZone() {
    const name = prompt("Zone name?", "Indoor");
    if (!name) return;
    await fetch(`/api/tenant/${restaurantId}/tables`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "zone", name, zoneKind: "indoor" }),
    });
    void load();
  }

  async function addTable(zoneId: string) {
    const number = prompt("Table number?");
    const seats = prompt("Seats?", "4");
    if (!number || !seats) return;
    await fetch(`/api/tenant/${restaurantId}/tables`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zoneId, number, seats: Number(seats) }),
    });
    void load();
  }

  async function downloadQr(tableId: string) {
    const res = await fetch(`/api/tenant/${restaurantId}/tables/${tableId}/qr`);
    const data = await res.json();
    setQr({ url: data.url, dataUrl: data.dataUrl, number: data.table.number });
    const a = document.createElement("a");
    a.href = data.dataUrl;
    a.download = `fooody-table-${data.table.number}.png`;
    a.click();
    toast.success("QR downloaded — map it to the printed tent card");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-mist">
        {Object.entries(TABLE_STATUS_LABEL).map(([key, label]) => (
          <span key={key} className={`rounded-full border px-2 py-1 ${TONE[key as Table["status"]]}`}>
            {label}
          </span>
        ))}
      </div>
      <Button variant="outline" onClick={() => void addZone()}>
        Add zone
      </Button>
      <div className="grid gap-4 md:grid-cols-2">
        {zones.map((zone) => (
          <Card key={zone.id}>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {zone.name}{" "}
                  <span className="text-sm font-normal text-mist">({zone.kind.toLowerCase()})</span>
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => void addTable(zone.id)}>
                  Add table
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {zone.tables.map((table) => (
                  <button
                    key={table.id}
                    className={`rounded-2xl border p-3 text-left ${TONE[table.status]}`}
                    onClick={() => void downloadQr(table.id)}
                  >
                    <p className="font-display text-xl font-bold">{table.number}</p>
                    <p className="text-xs text-mist">{table.seats} seats</p>
                    <p className="mt-1 text-[10px] font-semibold uppercase">{TABLE_STATUS_LABEL[table.status]}</p>
                    {table.liveOrderNumber ? (
                      <p className="text-[10px] text-gold">#{table.liveOrderNumber}</p>
                    ) : (
                      <p className="mt-1 text-[10px] text-gold">Download QR</p>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {qr && (
        <Card>
          <CardContent className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr.dataUrl} alt="" className="size-28 rounded-xl bg-white p-2" />
            <div>
              <p className="font-semibold">Table {qr.number}</p>
              <p className="text-sm break-all text-mist">{qr.url}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function ReservationDesk({ restaurantId }: { restaurantId: string }) {
  const [rows, setRows] = useState<
    { id: string; guestName: string; guestCount: number; startsAt: string; status: string; specialRequests: string; table: { number: string } | null }[]
  >([]);
  const [form, setForm] = useState({
    guestName: "",
    guestCount: "2",
    startsAt: "",
    specialRequests: "",
  });

  async function load() {
    const res = await fetch(`/api/tenant/${restaurantId}/reservations`);
    const data = await res.json();
    setRows(data.reservations ?? []);
  }

  useEffect(() => {
    void load();
  }, [restaurantId]);

  async function create() {
    await fetch(`/api/tenant/${restaurantId}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, guestCount: Number(form.guestCount) }),
    });
    setForm({ guestName: "", guestCount: "2", startsAt: "", specialRequests: "" });
    void load();
  }

  async function setStatus(id: string, status: string) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    await fetch(`/api/tenant/${restaurantId}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status,
        guestName: row.guestName,
        guestCount: row.guestCount,
        startsAt: row.startsAt,
        specialRequests: row.specialRequests,
      }),
    });
    void load();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
      <Card>
        <CardContent className="space-y-3">
          <CardTitle>New booking</CardTitle>
          <Input placeholder="Guest name" value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} />
          <Input type="number" value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: e.target.value })} />
          <Input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
          <Input placeholder="Special requests" value={form.specialRequests} onChange={(e) => setForm({ ...form, specialRequests: e.target.value })} />
          <Button onClick={() => void create()}>Confirm reservation</Button>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {rows.map((row) => (
          <Card key={row.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{row.guestName}</p>
                <p className="text-sm text-mist">
                  {row.guestCount} guests · {new Date(row.startsAt).toLocaleString("en-IN")}
                  {row.table ? ` · Table ${row.table.number}` : ""}
                </p>
                {row.specialRequests && <p className="text-xs">{row.specialRequests}</p>}
              </div>
              <div className="flex gap-2">
                <span className="text-xs uppercase text-gold">{row.status}</span>
                {row.status === "CONFIRMED" && (
                  <Button size="sm" onClick={() => void setStatus(row.id, "SEATED")}>
                    Seat
                  </Button>
                )}
                {row.status !== "CANCELLED" && (
                  <Button size="sm" variant="outline" onClick={() => void setStatus(row.id, "CANCELLED")}>
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
