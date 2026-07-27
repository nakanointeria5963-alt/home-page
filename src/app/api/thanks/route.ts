import { NextRequest } from "next/server";
import { getRedis } from "@/lib/redis";

const TOTAL_KEY = "roguepink:thanks:total";

// Taps are batched client-side, so one request can carry several thanks.
const MAX_DELTA_PER_REQUEST = 50;
// Generous enough that no human tapping ever hits it, low enough to cap a bot.
const BUDGET_PER_WINDOW = 200;
const WINDOW_SECONDS = 60;

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

async function readDelta(request: NextRequest): Promise<number> {
  try {
    const body = await request.json();
    const delta = Number((body as { delta?: unknown })?.delta);
    if (!Number.isFinite(delta)) return 1;
    return Math.min(Math.max(Math.floor(delta), 1), MAX_DELTA_PER_REQUEST);
  } catch {
    // No/invalid body (e.g. a plain POST) — treat as a single thanks.
    return 1;
  }
}

export async function GET() {
  const redis = getRedis();
  if (!redis) {
    return Response.json({ enabled: false, total: null });
  }

  const total = (await redis.get<number>(TOTAL_KEY)) ?? 0;
  return Response.json({ enabled: true, total });
}

export async function POST(request: NextRequest) {
  const redis = getRedis();
  if (!redis) {
    return Response.json({ enabled: false, total: null });
  }

  const delta = await readDelta(request);

  const budgetKey = `roguepink:thanks:budget:${clientIp(request)}`;
  const used = await redis.incrby(budgetKey, delta);
  if (used === delta) {
    // First increment of this window — start its countdown.
    await redis.expire(budgetKey, WINDOW_SECONDS);
  }

  const applied = Math.max(0, delta - Math.max(0, used - BUDGET_PER_WINDOW));

  if (applied === 0) {
    const total = (await redis.get<number>(TOTAL_KEY)) ?? 0;
    return Response.json({ enabled: true, total, applied: 0, limited: true });
  }

  const total = await redis.incrby(TOTAL_KEY, applied);
  return Response.json({ enabled: true, total, applied, limited: applied < delta });
}
