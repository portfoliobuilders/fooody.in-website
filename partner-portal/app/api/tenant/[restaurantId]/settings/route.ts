import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { z } from "zod";
import { jsonError, requireMembership, MUTATE_ROLES, ORDER_ROLES } from "@/lib/auth/rbac";
import { getRestaurantSettings, updateRestaurantSettings } from "@/lib/db/restaurants";
import { menuQrDataUri } from "@/lib/qr/menu-qr";

type Params = { params: Promise<{ restaurantId: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, ORDER_ROLES);
    const restaurant = await getRestaurantSettings(restaurantId);
    if (!restaurant) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const origin = new URL(request.url).origin;
    const storeUrl = restaurant.menuUrl ?? `${origin}/${restaurant.slug}`;
    const kioskUrl = `${origin}/${restaurant.slug}/kiosk`;
    const wa = (restaurant.whatsappPhone ?? restaurant.phone).replace(/\D/g, "");
    const intl = wa.length === 10 ? `91${wa}` : wa;
    const whatsappUrl = intl
      ? `https://wa.me/${intl}?text=${encodeURIComponent(`Hi ${restaurant.name}, I would like to order.`)}`
      : null;
    const storeQr = restaurant.menuQrSvg
      ? menuQrDataUri(restaurant.menuQrSvg)
      : await QRCode.toDataURL(storeUrl, { width: 1024, margin: 4, errorCorrectionLevel: "H" });
    const kioskQr = await QRCode.toDataURL(kioskUrl, { width: 640, margin: 4, errorCorrectionLevel: "H" });
    return NextResponse.json({
      restaurant,
      storeUrl,
      kioskUrl,
      whatsappUrl,
      storeQr,
      kioskQr,
      menuQrSvg: restaurant.menuQrSvg,
    });
  } catch (error) {
    return jsonError(error);
  }
}

const schema = z.object({
  name: z.string().min(2).optional(),
  tagline: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  whatsappPhone: z.string().optional(),
  cuisine: z.string().optional(),
  upiVpa: z.string().optional(),
  gstin: z.string().optional(),
  isOpen: z.boolean().optional(),
  listedOnMarketplace: z.boolean().optional(),
  prepTimeMins: z.number().int().positive().optional(),
  brandPrimary: z.string().optional(),
  brandAccent: z.string().optional(),
  brandBackground: z.string().optional(),
  hours: z
    .array(
      z.object({
        weekday: z.number().int().min(0).max(6),
        opensAt: z.string(),
        closesAt: z.string(),
        isClosed: z.boolean(),
      }),
    )
    .optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, MUTATE_ROLES);
    const body = schema.parse(await request.json());
    const restaurant = await updateRestaurantSettings(restaurantId, body);
    return NextResponse.json({ restaurant });
  } catch (error) {
    return jsonError(error);
  }
}
