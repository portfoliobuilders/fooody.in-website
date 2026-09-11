"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type InventoryRow = {
  id: string;
  name: string;
  unit: string;
  onHand: number;
  lowStockAt: number;
};

type Surplus = {
  id: string;
  name: string;
  address: string;
  inventoryItems: { id: string; onHand: number; surplus: number; unit: string }[];
};

type Requisition = {
  id: string;
  requisitionNumber: string;
  type: "PURCHASE_ORDER" | "BRANCH_TRANSFER";
  status: string;
  notes: string | null;
  requestingBranch: { id: string; name: string };
  fulfillingBranch: { id: string; name: string } | null;
  lines: { id: string; quantity: number; unit: string; inventoryItem: { name: string } }[];
};

export function RequisitionBoard({ restaurantId }: { restaurantId: string }) {
  const [items, setItems] = useState<InventoryRow[]>([]);
  const [rows, setRows] = useState<Requisition[]>([]);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [nearby, setNearby] = useState<Record<string, Surplus[]>>({});
  const [source, setSource] = useState<{ branchId?: string; type: "PURCHASE_ORDER" | "BRANCH_TRANSFER" }>({
    type: "PURCHASE_ORDER",
  });
  const [notes, setNotes] = useState("");

  async function load() {
    const [inv, req] = await Promise.all([
      fetch(`/api/tenant/${restaurantId}/inventory`).then((res) => res.json()),
      fetch(`/api/tenant/${restaurantId}/inventory/requisitions`).then((res) => res.json()),
    ]);
    setItems(inv.items ?? []);
    setRows(req.requisitions ?? []);
  }

  useEffect(() => {
    void load();
  }, [restaurantId]);

  const selectedLines = useMemo(
    () => items.filter((item) => (picked[item.id] ?? 0) > 0).map((item) => ({ item, qty: picked[item.id] })),
    [items, picked],
  );

  async function loadNearby() {
    const map: Record<string, Surplus[]> = {};
    for (const { item } of selectedLines) {
      const res = await fetch(
        `/api/tenant/${restaurantId}/inventory/nearby-stock?materialName=${encodeURIComponent(item.name)}`,
      );
      const data = await res.json();
      map[item.id] = data.branches ?? [];
    }
    setNearby(map);
    const first = Object.values(map).flat()[0];
    setSource(first ? { type: "BRANCH_TRANSFER", branchId: first.id } : { type: "PURCHASE_ORDER" });
    setStep(2);
  }

  async function submit() {
    const res = await fetch(`/api/tenant/${restaurantId}/inventory/requisitions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: source.type,
        fulfillingBranchId: source.branchId,
        notes,
        lines: selectedLines.map(({ item, qty }) => ({
          inventoryItemId: item.id,
          quantity: qty,
          sourceInventoryId: nearby[item.id]?.find((branch) => branch.id === source.branchId)?.inventoryItems[0]?.id,
        })),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not submit");
      return;
    }
    toast.success(`${data.requisition.requisitionNumber} sent for approval`);
    setOpen(false);
    setStep(1);
    setPicked({});
    void load();
  }

  async function act(id: string, action: "approve" | "reject" | "dispatch" | "receive") {
    const path =
      action === "dispatch"
        ? `/api/tenant/${restaurantId}/inventory/requisitions/${id}/dispatch`
        : action === "receive"
          ? `/api/tenant/${restaurantId}/inventory/requisitions/${id}/receive`
          : `/api/tenant/${restaurantId}/inventory/requisitions/${id}`;
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Action failed");
      return;
    }
    toast.success(`${data.requisition.requisitionNumber} → ${data.requisition.status}`);
    void load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-mist">Kitchen restock from a sister branch, or raise an external purchase.</p>
        <Button
          onClick={() => {
            setOpen(true);
            setStep(1);
          }}
        >
          New requisition
        </Button>
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <Card key={row.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {row.requisitionNumber}{" "}
                  <Badge>{row.type === "BRANCH_TRANSFER" ? "Branch transfer" : "Purchase order"}</Badge>
                </p>
                <p className="text-sm text-mist">
                  {row.lines.map((line) => `${line.inventoryItem.name} ${line.quantity}${line.unit}`).join(" · ")}
                </p>
                <p className="text-xs text-mist">
                  {row.fulfillingBranch ? `From ${row.fulfillingBranch.name}` : "External vendor"} · {row.status}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {row.status === "PENDING_APPROVAL" && (
                  <>
                    <Button size="sm" onClick={() => void act(row.id, "approve")}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void act(row.id, "reject")}>
                      Reject
                    </Button>
                  </>
                )}
                {row.status === "APPROVED" && row.type === "BRANCH_TRANSFER" && (
                  <Button size="sm" onClick={() => void act(row.id, "dispatch")}>
                    Dispatch stock
                  </Button>
                )}
                {(row.status === "DISPATCHED" || (row.status === "APPROVED" && row.type === "PURCHASE_ORDER")) && (
                  <Button size="sm" onClick={() => void act(row.id, "receive")}>
                    Mark received
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {!rows.length && <p className="text-sm text-mist">No requisitions yet.</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogTitle>
            {step === 1 ? "Select restock items" : step === 2 ? "Nearby surplus vs purchase" : "Submit for approval"}
          </DialogTitle>
          {step === 1 && (
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <label key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <span>
                    {item.name}{" "}
                    <span className="text-mist">
                      {item.onHand}
                      {item.unit} on hand
                    </span>
                  </span>
                  <Input
                    className="w-24"
                    type="number"
                    min={0}
                    step="0.1"
                    value={picked[item.id] || ""}
                    onChange={(e) => setPicked((current) => ({ ...current, [item.id]: Number(e.target.value) }))}
                  />
                </label>
              ))}
              <Button className="w-full" disabled={!selectedLines.length} onClick={() => void loadNearby()}>
                Check sister branches
              </Button>
            </div>
          )}
          {step === 2 && (
            <div className="mt-4 space-y-3">
              {selectedLines.map(({ item, qty }) => (
                <div key={item.id} className="rounded-xl border border-black/10 p-3 text-sm dark:border-white/10">
                  <p className="font-semibold">
                    {item.name} · need {qty}
                    {item.unit}
                  </p>
                  {(nearby[item.id] ?? []).length ? (
                    nearby[item.id].map((branch) => (
                      <p key={branch.id} className="text-mist">
                        {branch.name}: {branch.inventoryItems[0]?.surplus}
                        {branch.inventoryItems[0]?.unit} surplus
                      </p>
                    ))
                  ) : (
                    <p className="text-mist">No surplus nearby — use an external purchase order.</p>
                  )}
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={source.type === "PURCHASE_ORDER" ? "default" : "outline"}
                  onClick={() => setSource({ type: "PURCHASE_ORDER" })}
                >
                  External PO
                </Button>
                {Object.values(nearby)
                  .flat()
                  .filter((branch, index, all) => all.findIndex((row) => row.id === branch.id) === index)
                  .map((branch) => (
                    <Button
                      key={branch.id}
                      variant={source.branchId === branch.id ? "default" : "outline"}
                      onClick={() => setSource({ type: "BRANCH_TRANSFER", branchId: branch.id })}
                    >
                      From {branch.name}
                    </Button>
                  ))}
              </div>
              <Button className="w-full" onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          )}
          {step === 3 && (
            <div className="mt-4 space-y-3">
              <p className="text-sm">
                {source.type === "BRANCH_TRANSFER" ? "Transfer from sister branch" : "External purchase"} ·{" "}
                {selectedLines.map(({ item, qty }) => `${item.name} ${qty}`).join(", ")}
              </p>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes for owner / purchase manager" />
              <Button className="w-full" onClick={() => void submit()}>
                Submit for 1-click approval
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
