import { NextResponse } from "next/server";
import { getPublicCatalog } from "@/lib/db/menu";
import { jsonError } from "@/lib/auth/rbac";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const restaurant = await getPublicCatalog(slug);
    if (!restaurant) return NextResponse.json({ error: "Store not found" }, { status: 404 });
    return NextResponse.json({ restaurant });
  } catch (error) {
    return jsonError(error);
  }
}
