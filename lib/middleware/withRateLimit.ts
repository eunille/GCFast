import { errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store — single instance per server process.
// NOTE: Replace with Redis-based rate limiting (e.g. @upstash/ratelimit)
// before deploying to a multi-instance production environment.
const store = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

const DEFAULTS: RateLimitOptions = { limit: 10, windowMs: 60_000 };

/**
 * Simple sliding-window rate limiter.
 *
 * @param req - Incoming request (reads x-forwarded-for or x-real-ip header)
 * @param options - Override default limit and window (optional)
 * @returns `undefined` if within limit, or a `429 Response` if rate exceeded
 */
export function withRateLimit(
  req: Request,
  options: Partial<RateLimitOptions> = {}
): Response | undefined {
  const { limit, windowMs } = { ...DEFAULTS, ...options };
  const now = Date.now();

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return undefined;
  }

  entry.count += 1;

  if (entry.count > limit) {
    return errorResponse(
      ErrorCodes.TOO_MANY_REQUESTS,
      "Too many requests — please try again later",
      429
    );
  }

  return undefined;
}
