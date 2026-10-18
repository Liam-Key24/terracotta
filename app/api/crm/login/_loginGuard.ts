import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '../../_rateLimit';
import { getUpstashRedis, isUpstashConfigured } from '../../reservation/_upstash';

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;
const memoryLoginFails = new Map<string, { count: number; resetAt: number }>();

function allowedOrigins(): Set<string> {
    const origins = new Set<string>(['http://localhost:3000', 'https://localhost:3000']);
    const base = process.env.NEXT_PUBLIC_BASE_URL?.trim();
    if (base) {
        try {
            origins.add(new URL(base).origin);
        } catch {
            // ignore invalid base URL
        }
    }
    origins.add('https://www.terracotta-acton.com');
    origins.add('https://terracotta-acton.com');
    return origins;
}

/** Reject cross-site POSTs; allow same-origin Origin or Referer. */
export function assertSameOrigin(request: NextRequest): NextResponse | null {
    const allowed = allowedOrigins();
    const origin = request.headers.get('origin');
    if (origin) {
        if (!allowed.has(origin)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        return null;
    }
    const referer = request.headers.get('referer');
    if (referer) {
        try {
            if (!allowed.has(new URL(referer).origin)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            return null;
        } catch {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

function loginFailKey(ip: string, username: string): string {
    return `login:${ip}:${username.toLowerCase() || '_'}`;
}

export async function isLoginBlocked(ip: string, username: string): Promise<boolean> {
    const key = loginFailKey(ip, username);
    if (isUpstashConfigured()) {
        const redis = getUpstashRedis();
        if (redis) {
            try {
                const count = await redis.get(`tc:loginfail:${key}`);
                const n = typeof count === 'number' ? count : Number(count);
                return Number.isFinite(n) && n >= LOGIN_MAX_ATTEMPTS;
            } catch (err) {
                console.error('[crm/login] Upstash block check failed:', err);
            }
        }
    }
    const entry = memoryLoginFails.get(key);
    if (!entry) return false;
    if (Date.now() >= entry.resetAt) {
        memoryLoginFails.delete(key);
        return false;
    }
    return entry.count >= LOGIN_MAX_ATTEMPTS;
}

export async function recordFailedLogin(ip: string, username: string): Promise<void> {
    const key = loginFailKey(ip, username);
    if (isUpstashConfigured()) {
        const redis = getUpstashRedis();
        if (redis) {
            try {
                const redisKey = `tc:loginfail:${key}`;
                const count = await redis.incr(redisKey);
                if (count === 1) {
                    await redis.pexpire(redisKey, LOGIN_WINDOW_MS);
                }
                if (typeof count === 'number' && count >= LOGIN_MAX_ATTEMPTS) {
                    console.warn('[crm/login] blocked after failed attempts', { ip, username: username || '(empty)' });
                }
                return;
            } catch (err) {
                console.error('[crm/login] Upstash fail record failed:', err);
            }
        }
    }
    const now = Date.now();
    const entry = memoryLoginFails.get(key);
    if (!entry || now >= entry.resetAt) {
        memoryLoginFails.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
        return;
    }
    entry.count += 1;
    if (entry.count >= LOGIN_MAX_ATTEMPTS) {
        console.warn('[crm/login] blocked after failed attempts', { ip, username: username || '(empty)' });
    }
}

export function getLoginClientIp(request: Request): string {
    return getClientIp(request);
}

/** Test helper: clear in-memory login fail counters. */
export function resetLoginRateLimitForTests(): void {
    memoryLoginFails.clear();
}
