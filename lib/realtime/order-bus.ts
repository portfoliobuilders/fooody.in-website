import { EventEmitter } from "node:events";

export type TenantEvent = {
  type:
    | "order.created"
    | "order.updated"
    | "menu.updated"
    | "inventory.updated"
    | "table.updated"
    | "dispatch.updated"
    | "hello"
    | "ping";
  restaurantId?: string;
  payload?: unknown;
  at?: string;
};

const bus = new EventEmitter();
bus.setMaxListeners(500);

function key(restaurantId: string) {
  return `tenant:${restaurantId}`;
}

export function publishTenantEvent(restaurantId: string, event: TenantEvent) {
  bus.emit(key(restaurantId), {
    ...event,
    restaurantId,
    at: new Date().toISOString(),
  } satisfies TenantEvent);
}

export function subscribeTenantEvents(
  restaurantId: string,
  listener: (event: TenantEvent) => void,
) {
  const eventKey = key(restaurantId);
  bus.on(eventKey, listener);
  return () => {
    bus.off(eventKey, listener);
  };
}
