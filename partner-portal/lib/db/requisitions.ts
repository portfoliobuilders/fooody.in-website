import type { Prisma, RequisitionStatus, RequisitionType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { HttpError } from "@/lib/auth/rbac";
import { publishTenantEvent } from "@/lib/realtime/order-bus";
import { findSurplusBranches, getBranchOrganizationId } from "@/lib/inventory/inter-branch";

const include = {
  lines: { include: { inventoryItem: true } },
  requestingBranch: { select: { id: true, name: true, slug: true } },
  fulfillingBranch: { select: { id: true, name: true, slug: true } },
  requestedBy: { select: { id: true, name: true } },
  approvedBy: { select: { id: true, name: true } },
} satisfies Prisma.InventoryRequisitionInclude;

function nextRequisitionNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `REQ-${stamp}-${rand}`;
}

export async function listRequisitions(restaurantId: string) {
  return prisma.inventoryRequisition.findMany({
    where: {
      OR: [{ requestingBranchId: restaurantId }, { fulfillingBranchId: restaurantId }],
    },
    include,
    orderBy: { createdAt: "desc" },
  });
}

export async function getRequisition(restaurantId: string, id: string) {
  return prisma.inventoryRequisition.findFirst({
    where: {
      id,
      OR: [{ requestingBranchId: restaurantId }, { fulfillingBranchId: restaurantId }],
    },
    include,
  });
}

export async function createRequisition(input: {
  restaurantId: string;
  userId: string;
  type: RequisitionType;
  fulfillingBranchId?: string | null;
  notes?: string;
  lines: { inventoryItemId: string; quantity: number; sourceInventoryId?: string }[];
}) {
  if (!input.lines.length) throw new HttpError(400, "Add at least one ingredient");

  const items = await prisma.inventoryItem.findMany({
    where: {
      restaurantId: input.restaurantId,
      id: { in: input.lines.map((line) => line.inventoryItemId) },
    },
  });
  if (items.length !== input.lines.length) {
    throw new HttpError(400, "An ingredient does not belong to this kitchen");
  }

  if (input.type === "BRANCH_TRANSFER") {
    const orgId = await getBranchOrganizationId(input.restaurantId);
    if (!orgId) {
      throw new HttpError(400, "This restaurant is not in a multi-branch group yet");
    }
    if (!input.fulfillingBranchId) {
      throw new HttpError(400, "Pick a sister branch to transfer from");
    }
    const peer = await prisma.restaurant.findFirst({
      where: { id: input.fulfillingBranchId, organizationId: orgId },
    });
    if (!peer || peer.id === input.restaurantId) {
      throw new HttpError(400, "Fulfilling branch must be a sister location");
    }
  }

  const requisition = await prisma.inventoryRequisition.create({
    data: {
      requisitionNumber: nextRequisitionNumber(),
      requestingBranchId: input.restaurantId,
      fulfillingBranchId: input.type === "BRANCH_TRANSFER" ? input.fulfillingBranchId : null,
      requestedById: input.userId,
      type: input.type,
      status: "PENDING_APPROVAL",
      notes: input.notes,
      lines: {
        create: input.lines.map((line) => {
          const item = items.find((row) => row.id === line.inventoryItemId)!;
          return {
            inventoryItemId: item.id,
            quantity: line.quantity,
            unit: item.unit,
            sourceInventoryId: line.sourceInventoryId,
          };
        }),
      },
    },
    include,
  });
  publishTenantEvent(input.restaurantId, { type: "inventory.updated" });
  return requisition;
}

export async function decideRequisition(
  restaurantId: string,
  id: string,
  userId: string,
  decision: "APPROVED" | "REJECTED",
) {
  const existing = await getRequisition(restaurantId, id);
  if (!existing) throw new HttpError(404, "Requisition not found");
  if (existing.requestingBranchId !== restaurantId) {
    throw new HttpError(403, "Only the requesting branch can approve this");
  }
  if (existing.status !== "PENDING_APPROVAL") {
    throw new HttpError(400, "This requisition is no longer awaiting approval");
  }
  const updated = await prisma.inventoryRequisition.update({
    where: { id: existing.id },
    data: {
      status: decision,
      approvedById: userId,
    },
    include,
  });
  publishTenantEvent(restaurantId, { type: "inventory.updated" });
  if (updated.fulfillingBranchId) {
    publishTenantEvent(updated.fulfillingBranchId, { type: "inventory.updated" });
  }
  return updated;
}

async function moveStock(args: {
  tx: Prisma.TransactionClient;
  restaurantId: string;
  inventoryItemId: string;
  qty: number;
  reason: "BRANCH_TRANSFER_OUT" | "BRANCH_TRANSFER_IN" | "RECEIVING";
  note: string;
}) {
  await args.tx.inventoryItem.update({
    where: { id: args.inventoryItemId },
    data: { onHand: { increment: args.qty } },
  });
  await args.tx.inventoryMovement.create({
    data: {
      restaurantId: args.restaurantId,
      inventoryItemId: args.inventoryItemId,
      qty: args.qty,
      reason: args.reason,
      note: args.note,
    },
  });
}

export async function dispatchRequisition(restaurantId: string, id: string) {
  const existing = await getRequisition(restaurantId, id);
  if (!existing) throw new HttpError(404, "Requisition not found");
  if (existing.status !== "APPROVED") {
    throw new HttpError(400, "Approve this requisition before dispatching");
  }
  if (existing.type !== "BRANCH_TRANSFER" || !existing.fulfillingBranchId) {
    throw new HttpError(400, "External purchase orders are marked fulfilled on goods receipt");
  }
  if (existing.fulfillingBranchId !== restaurantId) {
    throw new HttpError(403, "Only the sending branch can dispatch this transfer");
  }

  const updated = await prisma.$transaction(async (tx) => {
    for (const line of existing.lines) {
      let sourceId = line.sourceInventoryId;
      if (!sourceId) {
        const stock = await tx.inventoryItem.findMany({
          where: { restaurantId: existing.fulfillingBranchId! },
        });
        const source = stock.find(
          (row) => row.name.toLowerCase() === line.inventoryItem.name.toLowerCase(),
        );
        if (!source) {
          throw new HttpError(400, `${line.inventoryItem.name} is not stocked at the sending branch`);
        }
        sourceId = source.id;
      }
      const source = await tx.inventoryItem.findFirst({
        where: { id: sourceId, restaurantId: existing.fulfillingBranchId! },
      });
      if (!source) throw new HttpError(400, "Source stock line is missing");
      if (source.onHand < line.quantity) {
        throw new HttpError(
          400,
          `Not enough ${source.name} to dispatch (${source.onHand} ${source.unit} on hand)`,
        );
      }
      await moveStock({
        tx,
        restaurantId: existing.fulfillingBranchId!,
        inventoryItemId: source.id,
        qty: -line.quantity,
        reason: "BRANCH_TRANSFER_OUT",
        note: `Transfer ${existing.requisitionNumber} to ${existing.requestingBranch.name}`,
      });
      await tx.requisitionLine.update({
        where: { id: line.id },
        data: { sourceInventoryId: source.id, fulfilledQty: line.quantity },
      });
    }
    return tx.inventoryRequisition.update({
      where: { id: existing.id },
      data: { status: "DISPATCHED", dispatchedAt: new Date() },
      include,
    });
  });

  publishTenantEvent(existing.fulfillingBranchId, { type: "inventory.updated" });
  publishTenantEvent(existing.requestingBranchId, { type: "inventory.updated" });
  return updated;
}

export async function receiveRequisition(restaurantId: string, id: string) {
  const existing = await getRequisition(restaurantId, id);
  if (!existing) throw new HttpError(404, "Requisition not found");
  if (existing.requestingBranchId !== restaurantId) {
    throw new HttpError(403, "Only the requesting kitchen can confirm receipt");
  }

  if (existing.type === "BRANCH_TRANSFER" && existing.status !== "DISPATCHED") {
    throw new HttpError(400, "Wait for the sending branch to dispatch before receiving");
  }
  if (existing.type === "PURCHASE_ORDER" && existing.status !== "APPROVED" && existing.status !== "DISPATCHED") {
    throw new HttpError(400, "Approve this purchase before recording receipt");
  }

  const nextStatus: RequisitionStatus = "FULFILLED";

  const updated = await prisma.$transaction(async (tx) => {
    for (const line of existing.lines) {
      const qty = line.fulfilledQty > 0 ? line.fulfilledQty : line.quantity;
      await moveStock({
        tx,
        restaurantId: existing.requestingBranchId,
        inventoryItemId: line.inventoryItemId,
        qty,
        reason: existing.type === "BRANCH_TRANSFER" ? "BRANCH_TRANSFER_IN" : "RECEIVING",
        note: `Receipt ${existing.requisitionNumber}`,
      });
      await tx.requisitionLine.update({
        where: { id: line.id },
        data: { fulfilledQty: qty },
      });
    }
    return tx.inventoryRequisition.update({
      where: { id: existing.id },
      data: { status: nextStatus, receivedAt: new Date() },
      include,
    });
  });

  publishTenantEvent(restaurantId, { type: "inventory.updated" });
  if (existing.fulfillingBranchId) {
    publishTenantEvent(existing.fulfillingBranchId, { type: "inventory.updated" });
  }
  return updated;
}

export async function nearbyStock(restaurantId: string, materialName: string) {
  const orgId = await getBranchOrganizationId(restaurantId);
  if (!orgId) return { organizationId: null, branches: [] as Awaited<ReturnType<typeof findSurplusBranches>> };
  const branches = await findSurplusBranches(orgId, materialName, restaurantId);
  return { organizationId: orgId, branches };
}
