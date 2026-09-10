type Entry = { value: unknown; expiresAt: number };

const memory = new Map<string, Entry>();

function prune() {
  const now = Date.now();
  for (const [key, entry] of memory) {
    if (entry.expiresAt <= now) memory.delete(key);
  }
}

async function upstash(command: unknown[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { result?: unknown };
  return data.result ?? null;
}

export async function kvGet<T>(key: string): Promise<T | null> {
  const remote = await upstash(["GET", key]);
  if (typeof remote === "string") {
    try {
      return JSON.parse(remote) as T;
    } catch {
      return remote as T;
    }
  }
  prune();
  const entry = memory.get(key);
  if (!entry || entry.expiresAt <= Date.now()) {
    memory.delete(key);
    return null;
  }
  return entry.value as T;
}

export async function kvSet<T>(key: string, value: T, ttlSeconds: number) {
  const packed = JSON.stringify(value);
  await upstash(["SET", key, packed, "EX", String(ttlSeconds)]);
  memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export async function kvDel(key: string) {
  await upstash(["DEL", key]);
  memory.delete(key);
}
