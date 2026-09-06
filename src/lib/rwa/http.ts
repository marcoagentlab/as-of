import {
  DEMO_API_KEY,
  DISCLAIMER,
  RATE_LIMIT_PER_MINUTE,
  SCHEMA_VERSION,
} from "./constants.ts";

export type Envelope<T extends Record<string, unknown>> = T & {
  disclaimer: string;
  server_time: string;
  schema: string;
};

export function envelope<T extends Record<string, unknown>>(
  payload: T,
  now: Date = new Date(),
): Envelope<T> {
  return {
    ...payload,
    disclaimer: DISCLAIMER,
    server_time: now.toISOString(),
    schema: SCHEMA_VERSION,
  };
}

export function jsonResponse(body: unknown, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json; charset=utf-8");
  }
  headers.set("cache-control", "no-store");
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers,
  });
}

export function errorBody(
  status: number,
  error: string,
  extra?: Record<string, unknown>,
) {
  return envelope({
    error,
    status,
    ...extra,
  });
}

const buckets = new Map<string, number[]>();

export function rateLimitKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "local";
}

/** Stub: 60 req/min per caller. Returns headers; 429 when exceeded. */
export function consumeRateLimit(key: string, now = Date.now()) {
  const windowMs = 60_000;
  const prev = buckets.get(key) ?? [];
  const kept = prev.filter((t) => now - t < windowMs);
  kept.push(now);
  buckets.set(key, kept);
  const remaining = Math.max(0, RATE_LIMIT_PER_MINUTE - kept.length);
  const resetMs = (kept[0] ?? now) + windowMs;
  return {
    limited: kept.length > RATE_LIMIT_PER_MINUTE,
    limit: RATE_LIMIT_PER_MINUTE,
    remaining,
    reset: Math.ceil(resetMs / 1000),
  };
}

export function applyRateLimitHeaders(
  headers: Headers,
  info: ReturnType<typeof consumeRateLimit>,
) {
  headers.set("x-ratelimit-limit", String(info.limit));
  headers.set("x-ratelimit-remaining", String(info.remaining));
  headers.set("x-ratelimit-reset", String(info.reset));
}

export function expectedApiKey(): string {
  return process.env.RWA_API_KEY?.trim() || DEMO_API_KEY;
}

export function extractApiKey(request: Request): string | null {
  const header = request.headers.get("x-api-key");
  if (header?.trim()) return header.trim();
  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return null;
}

export function authorize(
  request: Request,
): { ok: true } | { ok: false; response: Response } {
  const key = extractApiKey(request);
  if (!key || key !== expectedApiKey()) {
    return {
      ok: false,
      response: jsonResponse(
        errorBody(401, "missing_or_invalid_api_key", {
          hint: "Pass header x-api-key: DEMO_KEY",
        }),
        { status: 401 },
      ),
    };
  }
  return { ok: true };
}

export class HttpError extends Error {
  status: number;
  extra?: Record<string, unknown>;
  constructor(
    status: number,
    error: string,
    extra?: Record<string, unknown>,
  ) {
    super(error);
    this.name = "HttpError";
    this.status = status;
    this.extra = extra;
  }
}

export async function v0Handler(
  request: Request,
  fn: () => unknown | Promise<unknown>,
  opts?: { auth?: boolean; status?: number },
): Promise<Response> {
  const headers = new Headers();
  const rl = consumeRateLimit(rateLimitKey(request));
  applyRateLimitHeaders(headers, rl);
  if (rl.limited) {
    return jsonResponse(errorBody(429, "rate_limited"), {
      status: 429,
      headers,
    });
  }
  if (opts?.auth !== false) {
    const auth = authorize(request);
    if (!auth.ok) {
      applyRateLimitHeaders(auth.response.headers, rl);
      return auth.response;
    }
  }
  try {
    const body = await fn();
    return jsonResponse(body, { status: opts?.status ?? 200, headers });
  } catch (err) {
    if (err instanceof HttpError) {
      return jsonResponse(errorBody(err.status, err.message, err.extra), {
        status: err.status,
        headers,
      });
    }
    const message = err instanceof Error ? err.message : "internal_error";
    return jsonResponse(errorBody(500, message), { status: 500, headers });
  }
}
