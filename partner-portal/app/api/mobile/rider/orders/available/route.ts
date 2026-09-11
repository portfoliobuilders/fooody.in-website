import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/auth/rbac";
import { listAvailableRiderOrders } from "@/lib/mobile/rider";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const url = new URL(request.url);
    const lat = url.searchParams.get("lat");
    const lng = url.searchParams.get("lng");
    const orders = await listAvailableRiderOrders(user.userId, {
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
    });
    return NextResponse.json({ orders });
  } catch (error) {
    return jsonError(error);
  }
}
