import type { TableStatus, ZoneKind } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { tableQrPath } from "@/lib/tenant/host";
import { publishTenantEvent } from "@/lib/realtime/order-bus";

const OPEN_ORDER_STATUSES = ["PENDING", "ACCEPTED", "PREPARING", "READY", "DISPATCHED"] as const;

export async function getFloorPlan(restaurantId: string) {
  const [zones, openOrders, reservations] = await Promise.all([
    prisma.diningZone.findMany({
      where: { restaurantId },
      include: { tables: { orderBy: { number: "asc" }, include: { sessions: { where: { status: "OPEN" } } } } },
      orderBy: { name: "asc" },
    }),
    prisma.order.findMany({
      where: { restaurantId, channel: "DINE_IN", status: { in: [...OPEN_ORDER_STATUSES] } },
      select: { id: true, tableId: true, status: true, billPrintedAt: true, orderNumber: true },
    }),
    prisma.reservation.findMany({
      where: {
        restaurantId,
        status: { in: ["CONFIRMED", "SEATED"] },
        startsAt: {
          gte: new Date(Date.now() - 2 * 60 * 60 * 1000),
          lte: new Date(Date.now() + 3 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  return zones.map((zone) => ({
    ...zone,
    tables: zone.tables.map((table) => {
      const liveOrder = openOrders.find((o) => o.tableId === table.id);
      const reservation = reservations.find((r) => r.tableId === table.id);
      const status: TableStatus = liveOrder
        ? liveOrder.billPrintedAt || liveOrder.status === "READY"
          ? "BILL_PRINTED"
          : "OCCUPIED"
        : reservation
          ? "RESERVED"
          : table.status;
      return {
        ...table,
        status,
        liveOrderNumber: liveOrder?.orderNumber ?? null,
        guestCount: reservation?.guestCount ?? null,
        qrPath: table.qrPath,
      };
    }),
  }));
}

export async function createZone(restaurantId: string, name: string, kind: ZoneKind = "INDOOR") {
  return prisma.diningZone.create({ data: { restaurantId, name, kind } });
}

export async function createTable(
  restaurantId: string,
  input: { zoneId: string; number: string; seats: number; slug: string },
) {
  return prisma.diningTable.create({
    data: {
      restaurantId,
      zoneId: input.zoneId,
      number: input.number,
      seats: input.seats,
      status: "VACANT",
      qrPath: tableQrPath(input.slug, input.number),
    },
  });
}

export async function setTableStatus(restaurantId: string, tableId: string, status: TableStatus) {
  const table = await prisma.diningTable.findFirst({ where: { id: tableId, restaurantId } });
  if (!table) return null;
  const updated = await prisma.diningTable.update({
    where: { id: table.id },
    data: { status },
  });
  publishTenantEvent(restaurantId, { type: "table.updated", payload: updated });
  return updated;
}

export async function syncTableOccupancy(restaurantId: string, tableId: string) {
  const open = await prisma.order.findFirst({
    where: {
      restaurantId,
      tableId,
      channel: "DINE_IN",
      status: { in: [...OPEN_ORDER_STATUSES] },
    },
    orderBy: { placedAt: "desc" },
  });
  const status: TableStatus = !open
    ? "VACANT"
    : open.billPrintedAt
      ? "BILL_PRINTED"
      : "OCCUPIED";
  return setTableStatus(restaurantId, tableId, status);
}

export async function openTableSession(
  restaurantId: string,
  tableNumber: string,
  guest?: { name?: string; phone?: string },
) {
  const table = await prisma.diningTable.findUnique({
    where: { restaurantId_number: { restaurantId, number: tableNumber } },
  });
  if (!table) throw new Error("Table not found");
  const existing = await prisma.tableSession.findFirst({
    where: { tableId: table.id, status: "OPEN" },
  });
  if (existing) {
    return prisma.tableSession.update({
      where: { id: existing.id },
      data: {
        guestName: guest?.name ?? existing.guestName,
        guestPhone: guest?.phone ?? existing.guestPhone,
      },
    });
  }
  const session = await prisma.tableSession.create({
    data: {
      restaurantId,
      tableId: table.id,
      guestName: guest?.name ?? "",
      guestPhone: guest?.phone ?? "",
    },
  });
  await setTableStatus(restaurantId, table.id, table.status === "RESERVED" ? "RESERVED" : "OCCUPIED");
  return session;
}

export async function saveTableCart(sessionId: string, cartJson: unknown) {
  return prisma.tableSession.update({
    where: { id: sessionId },
    data: { cartJson: cartJson as object },
  });
}

export async function listReservations(restaurantId: string) {
  return prisma.reservation.findMany({
    where: { restaurantId },
    include: { table: true },
    orderBy: { startsAt: "asc" },
  });
}

export async function upsertReservation(
  restaurantId: string,
  data: {
    id?: string;
    guestName: string;
    guestPhone?: string;
    guestCount: number;
    startsAt: string;
    specialRequests?: string;
    tableId?: string;
    status?: "CONFIRMED" | "SEATED" | "CANCELLED" | "NO_SHOW";
  },
) {
  const payload = {
    restaurantId,
    guestName: data.guestName,
    guestPhone: data.guestPhone ?? "",
    guestCount: data.guestCount,
    startsAt: new Date(data.startsAt),
    specialRequests: data.specialRequests ?? "",
    tableId: data.tableId || null,
    status: data.status ?? "CONFIRMED",
  };
  const row = data.id
    ? await prisma.reservation.update({ where: { id: data.id }, data: payload, include: { table: true } })
    : await prisma.reservation.create({ data: payload, include: { table: true } });

  if (row.tableId && (row.status === "CONFIRMED" || row.status === "SEATED")) {
    await setTableStatus(
      restaurantId,
      row.tableId,
      row.status === "SEATED" ? "OCCUPIED" : "RESERVED",
    );
  }
  if (row.tableId && (row.status === "CANCELLED" || row.status === "NO_SHOW")) {
    await syncTableOccupancy(restaurantId, row.tableId);
  }
  return row;
}
