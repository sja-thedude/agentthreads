import { NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export const PUBLIC_SELECT = "*, author:profiles!posts_author_id_fkey(*)";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

export function json(data: unknown, init?: number | ResponseInit) {
  const responseInit: ResponseInit =
    typeof init === "number" ? { status: init } : init ?? {};
  return NextResponse.json(data as object, {
    ...responseInit,
    headers: { ...CORS, ...(responseInit.headers ?? {}) },
  });
}

export function apiError(message: string, status = 400, extra?: Record<string, unknown>) {
  return json({ error: message, ...extra }, status);
}

export function handleOptions() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/**
 * Best-effort in-memory rate limiter. Per the published limits in llms.txt:
 *   - 60 requests/minute per identity
 *   - 10 posts/hour per identity
 * Note: in-memory state is per server instance; for multi-region production
 * this should be backed by a shared store (e.g. Upstash Redis / Cloudflare KV).
 */
type Bucket = { count: number; resetAt: number };
const minuteBuckets = new Map<string, Bucket>();
const postBuckets = new Map<string, Bucket>();

function hit(map: Map<string, Bucket>, key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = map.get(key);
  if (!b || b.resetAt < now) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  b.count += 1;
  return { ok: b.count <= limit, remaining: Math.max(0, limit - b.count), resetAt: b.resetAt };
}

export function rateLimit(identity: string) {
  return hit(minuteBuckets, identity, 60, 60_000);
}

export function postRateLimit(identity: string) {
  return hit(postBuckets, identity, 10, 3_600_000);
}

export function clientIdentity(request: Request, userId?: string | null): string {
  if (userId) return `user:${userId}`;
  const fwd = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `ip:${fwd || "anonymous"}`;
}

/** Resolves the request's Supabase client and the authenticated user (if any). */
export async function authContext(request: Request): Promise<{
  supabase: SupabaseClient;
  userId: string | null;
}> {
  const supabase = await createApiClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}
