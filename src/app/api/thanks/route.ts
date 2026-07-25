import { NextRequest } from "next/server";
import { getRedis } from "@/lib/redis";

const TOTAL_KEY = "roguepink:thanks:total";
const RATE_LIMIT_SECONDS = 2;

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
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

  const rateLimitKey = `roguepink:thanks:rl:${clientIp(request)}`;
  const allowed = await redis.set(rateLimitKey, 1, {
    nx: true,
    ex: RATE_LIMIT_SECONDS,
  });

  if (!allowed) {
    const total = (await redis.get<number>(TOTAL_KEY)) ?? 0;
    return Response.json({ enabled: true, total, limited: true });
  }

  const total = await redis.incr(TOTAL_KEY);
  return Response.json({ enabled: true, total, limited: false });
}
