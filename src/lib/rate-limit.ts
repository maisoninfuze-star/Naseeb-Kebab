import 'server-only'

/**
 * A tiny in-process sliding-window rate limiter.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SCOPE, HONESTLY
 * ═══════════════════════════════════════════════════════════════════
 * State lives in this module's memory, so the limit is PER SERVER INSTANCE.
 * On a single long-running Node server (a VPS or container — the deployment
 * this admin's file driver already assumes) that is a real limit. On a
 * horizontally-scaled or serverless host each instance keeps its own counter,
 * so the effective limit is `n × instances` and cold starts reset it — there it
 * raises the cost of an attack without being a hard wall. A durable limit needs
 * a shared store (Upstash/Redis/DB); this is the no-infrastructure floor that is
 * strictly better than the nothing that was here before.
 *
 * The map is swept lazily on each call, so it cannot grow without bound.
 */
type Stamp = number
const buckets = new Map<string, Stamp[]>()

export interface RateResult {
  ok: boolean
  /** Seconds until the caller may retry, when blocked. */
  retryAfter: number
}

/**
 * @param key     what to limit on (e.g. `login:<ip>`).
 * @param limit   allowed hits per window.
 * @param windowMs sliding window length in ms.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now()
  const cutoff = now - windowMs
  const hits = (buckets.get(key) ?? []).filter((t) => t > cutoff)

  if (hits.length >= limit) {
    const retryAfter = Math.ceil((hits[0] + windowMs - now) / 1000)
    buckets.set(key, hits)
    return { ok: false, retryAfter: Math.max(1, retryAfter) }
  }

  hits.push(now)
  buckets.set(key, hits)

  // Opportunistic sweep so abandoned keys don't accumulate forever.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      const live = v.filter((t) => t > cutoff)
      if (live.length) buckets.set(k, live)
      else buckets.delete(k)
    }
  }

  return { ok: true, retryAfter: 0 }
}

/**
 * Best-effort client IP from the standard proxy headers. Falls back to a single
 * shared bucket when no header is present (dev, or a misconfigured proxy) so the
 * limiter still applies globally rather than silently disabling itself.
 */
export function clientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return headers.get('x-real-ip') ?? 'unknown'
}
