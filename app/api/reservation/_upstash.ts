import { Redis } from '@upstash/redis';

const KEY_RES = 'tc:reservations';
const KEY_CANCEL = 'tc:cancellations';
const KEY_QUEUE = 'tc:queue';
const KEY_ALT = 'tc:alternatives';

let client: Redis | null = null;

function getRedis(): Redis | null {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null;
    if (!client) {
        // Values are JSON strings from JSON.stringify; disable auto-parse on GET.
        client = new Redis({ url, token, automaticDeserialization: false });
    }
    return client;
}

function logSetFailure(key: string, err: unknown): void {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[upstash] SET ${key} failed:`, msg);
}

/** REST responses may return a string blob or an already-parsed object — normalize to a JSON string. */
function coerceToJsonString(value: unknown): string | null {
    if (value == null) return null;
    if (typeof value === 'string') {
        return value.length === 0 ? null : value;
    }
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch {
            return null;
        }
    }
    return null;
}

/** True when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set. */
export function isUpstashConfigured(): boolean {
    return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export async function upstashGetReservationsJson(): Promise<string | null> {
    const redis = getRedis();
    if (!redis) return null;
    try {
        const v = await redis.get(KEY_RES);
        return coerceToJsonString(v);
    } catch {
        return null;
    }
}

export async function upstashSetReservationsJson(json: string): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    try {
        await redis.set(KEY_RES, json);
    } catch (err) {
        logSetFailure(KEY_RES, err);
    }
}

export async function upstashGetCancellationsJson(): Promise<string | null> {
    const redis = getRedis();
    if (!redis) return null;
    try {
        const v = await redis.get(KEY_CANCEL);
        return coerceToJsonString(v);
    } catch {
        return null;
    }
}

export async function upstashSetCancellationsJson(json: string): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    try {
        await redis.set(KEY_CANCEL, json);
    } catch (err) {
        logSetFailure(KEY_CANCEL, err);
    }
}

export async function upstashGetQueueJson(): Promise<string | null> {
    const redis = getRedis();
    if (!redis) return null;
    try {
        const v = await redis.get(KEY_QUEUE);
        return coerceToJsonString(v);
    } catch {
        return null;
    }
}

export async function upstashSetQueueJson(json: string): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    try {
        await redis.set(KEY_QUEUE, json);
    } catch (err) {
        logSetFailure(KEY_QUEUE, err);
    }
}

export async function upstashGetAlternativesJson(): Promise<string | null> {
    const redis = getRedis();
    if (!redis) return null;
    try {
        const v = await redis.get(KEY_ALT);
        return coerceToJsonString(v);
    } catch {
        return null;
    }
}

export async function upstashSetAlternativesJson(json: string): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    try {
        await redis.set(KEY_ALT, json);
    } catch (err) {
        logSetFailure(KEY_ALT, err);
    }
}
