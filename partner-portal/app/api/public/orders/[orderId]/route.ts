import { NextResponse } from "next/server";
import { jsonError } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ orderId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { orderId } = await params;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payment: true,
        table: true,
        dispatch: true,
        restaurant: {
          select: {
            name: true,
            slug: true,
            phone: true,
            whatsappPhone: true,
            brandPrimary: true,
            brandAccent: true,
            brandBackground: true,
          },
        },
      },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        channel: order.channel,
        customerName: order.customerName,
        customerNotes: order.customerNotes,
        deliveryAddress: order.deliveryAddress,
        placedAt: order.placedAt,
        subtotalPaise: order.subtotalPaise,
        discountPaise: order.discountPaise,
        packagingFeePaise: order.packagingFeePaise,
        deliveryFeePaise: order.deliveryFeePaise,
        gstPaise: order.gstPaise,
        totalPaise: order.totalPaise,
        items: order.items,
        payment: order.payment
          ? { gateway: order.payment.gateway, status: order.payment.status }
          : null,
        table: order.table ? { number: order.table.number } : null,
        dispatch: order.dispatch,
        restaurant: order.restaurant,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
