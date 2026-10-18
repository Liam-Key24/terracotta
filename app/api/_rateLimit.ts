/**
 * Per-IP rate limit for public POST endpoints.
 * Uses Upstash when configured; falls back to in-memory for local/dev.
 */
import { getUpstashRedis, isUpstashConfigured } from './reservation/_upstash';

const windowMs = 60 * 1000;
const maxPerWindow = 10;
const memoryHits = new Map<string, { count: number; resetAt: number }>();

/** Prefer platform client IP; avoid trusting the leftmost x-forwarded-for hop. */
export function getClientIp(request: Request): string {
    const realIp = request.headers.get('x-real-ip')?.trim();
    if (realIp) return realIp;

    const vercelForwarded = request.headers.get('x-vercel-forwarded-for')?.trim();
    if (vercelForwarded) {
        const parts = vercelForwarded.split(',').map((p) => p.trim()).filter(Boolean);
        if (parts.length) return parts[parts.length - 1]!;
    }

    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        const parts = forwarded.split(',').map((p) => p.trim()).filter(Boolean);
        // Rightmost value is typically the closest proxy / Vercel edge hop.
        if (parts.length) return parts[parts.length - 1]!;
    }

    return 'unknown';
}

function checkMemoryLimit(key: string): { ok: true } | { ok: false; status: 429 } {
    const now = Date.now();
    const entry = memoryHits.get(key);
    if (!entry || now >= entry.resetAt) {
        memoryHits.set(key, { count: 1, resetAt: now + windowMs });
        return { ok: true };
    }
    entry.count += 1;
    if (entry.count > maxPerWindow) {
        return { ok: false, status: 429 };
    }
    return { ok: true };
}

export async function checkRateLimit(request: Request): Promise<{ ok: true } | { ok: false; status: 429 }> {
    const ip = getClientIp(request);
    const key = `rl:public:${ip}`;

    if (!isUpstashConfigured()) {
        return checkMemoryLimit(key);
    }

    const redis = getUpstashRedis();
    if (!redis) {
        return checkMemoryLimit(key);
    }

    try {
        const redisKey = `tc:ratelimit:${key}`;
        const count = await redis.incr(redisKey);
        if (count === 1) {
            await redis.pexpire(redisKey, windowMs);
        }
        if (typeof count === 'number' && count > maxPerWindow) {
            return { ok: false, status: 429 };
        }
        return { ok: true };
    } catch (err) {
        console.error('[rateLimit] Upstash failed; falling back to memory:', err);
        return checkMemoryLimit(key);
    }
}
