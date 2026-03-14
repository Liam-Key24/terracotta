/**
 * In-memory per-IP rate limit. Use for public POST endpoints.
 * Resets on process restart. For multi-instance deploy, use Redis or similar.
 */
const windowMs = 60 * 1000;
const maxPerWindow = 10;
const hits = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    return ip;
}

export function checkRateLimit(request: Request): { ok: true } | { ok: false; status: 429 } {
    const key = getClientKey(request);
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry) {
        hits.set(key, { count: 1, resetAt: now + windowMs });
        return { ok: true };
    }
    if (now >= entry.resetAt) {
        hits.set(key, { count: 1, resetAt: now + windowMs });
        return { ok: true };
    }
    entry.count += 1;
    if (entry.count > maxPerWindow) {
        return { ok: false, status: 429 };
    }
    return { ok: true };
}
