/**
 * Best-effort in-memory rate limiter for server actions.
 *
 * State lives per server instance, so on serverless/multi-instance hosts the
 * effective limit is per instance — still enough to blunt naive form spam and
 * credential stuffing. Swap for a shared store (Upstash/Redis) if the site
 * ever runs at a scale where that matters.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();
const MAX_BUCKETS = 10_000;

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, bucket] of buckets) {
      if (now > bucket.resetAt) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  bucket.count += 1;
  return bucket.count <= limit;
}

/** Extracts the client IP from proxy headers, falling back to "unknown". */
export function clientIpFrom(headerList: Headers): string {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return headerList.get("x-real-ip") ?? "unknown";
}
