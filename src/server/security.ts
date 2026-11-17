import "server-only";
import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

export function clientIp(req: NextRequest) {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] || req.headers.get("x-real-ip") || "0.0.0.0").trim();
}

/** Store a salted hash, never the raw visitor IP. */
export function hashIp(ip: string) {
  return createHash("sha256")
    .update(`${process.env.JWT_SECRET ?? "pf"}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Same-origin check for state-changing requests. The auth cookie is
 * SameSite=Lax already; this closes the remaining gap for older browsers
 * and for cross-site form posts to public endpoints.
 */
export function isSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return req.headers.get("sec-fetch-site") !== "cross-site";
  try {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/* ── Fixed-window rate limiter (per server instance) ──────────────── */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return { ok: true, retryAfter: 0 };
  }
  b.count += 1;
  return { ok: b.count <= limit, retryAfter: Math.ceil((b.reset - now) / 1000) };
}

/* ── JSON responses ────────────────────────────────────────────────── */
export const ok = (data: unknown, status = 200) => NextResponse.json({ ok: true, data }, { status });
export const fail = (message: string, status = 400, headers?: HeadersInit) =>
  NextResponse.json({ ok: false, message }, { status, headers });

/** Parse a JSON body with a hard size cap. */
export async function readJson<T = unknown>(req: NextRequest, maxBytes = 200_000): Promise<T> {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > maxBytes) throw new HttpError(413, "Request body too large");
  if (!req.headers.get("content-type")?.includes("application/json")) {
    throw new HttpError(415, "Expected application/json");
  }
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, "Request body too large");
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpError(400, "Malformed JSON");
  }
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Wraps a route handler so thrown HttpErrors become clean JSON. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof HttpError) return fail(err.message, err.status);
      const e = err as { code?: number; message?: string };
      if (e?.code === 11000) return fail("That value already exists (duplicate slug or email)", 409);
      console.error("[api]", err);
      return fail("Something went wrong on our side", 500);
    }
  };
}

/** Rejects obvious injected markup / script payloads in plain-text fields. */
export function looksMalicious(text: string) {
  return /<\s*\/?\s*(script|iframe|object|embed|svg|img|style|link|meta|form|input)\b|javascript:|data:text\/html|on\w+\s*=|\{\{.*\}\}|\$\{.*\}|\$where|\$ne\b|\$gt\b/i.test(
    text,
  );
}
