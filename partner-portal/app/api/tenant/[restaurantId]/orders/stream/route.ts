import { jsonError, requireMembership, ORDER_ROLES } from "@/lib/auth/rbac";
import { subscribeTenantEvents, type TenantEvent } from "@/lib/realtime/order-bus";

export const runtime = "nodejs";

type Params = { params: Promise<{ restaurantId: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    await requireMembership(restaurantId, ORDER_ROLES);

    const encoder = new TextEncoder();
    let unsubscribe = () => {};
    let heartbeat: ReturnType<typeof setInterval> | undefined;

    const stream = new ReadableStream({
      start(controller) {
        const send = (event: TenantEvent) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };
        send({ type: "hello", restaurantId });
        unsubscribe = subscribeTenantEvents(restaurantId, send);
        heartbeat = setInterval(() => send({ type: "ping" }), 15000);
        request.signal.addEventListener("abort", () => {
          unsubscribe();
          if (heartbeat) clearInterval(heartbeat);
          controller.close();
        });
      },
      cancel() {
        unsubscribe();
        if (heartbeat) clearInterval(heartbeat);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
