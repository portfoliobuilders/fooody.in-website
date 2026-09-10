import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { jsonError, requireMembership, CASH_ROLES } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ restaurantId: string; tableId: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { restaurantId, tableId } = await params;
    await requireMembership(restaurantId, CASH_ROLES);
    const table = await prisma.diningTable.findFirst({
      where: { id: tableId, restaurantId },
      include: { restaurant: true },
    });
    if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });
    const origin = new URL(request.url).origin;
    const target = `${origin}${table.qrPath}`;
    const dataUrl = await QRCode.toDataURL(target, { width: 640, margin: 2 });
    return NextResponse.json({
      table,
      url: target,
      dataUrl,
    });
  } catch (error) {
    return jsonError(error);
  }
}
