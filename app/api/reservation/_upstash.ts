import { Redis } from '@upstash/redis';

const KEY_RES = 'tc:reservations';
const KEY_CANCEL = 'tc:cancellations';
const KEY_QUEUE = 'tc:queue';
const KEY_ALT = 'tc:alternatives';

let client: Redis | null = null;

function trimmedEnv(value: string | undefined): string | undefined {
    const t = value?.trim();
    return t && t.length > 0 ? t : undefined;
}

function getRedis(): Redis | null {
    const url = trimmedEnv(process.env.UPSTASH_REDIS_REST_URL);
    const token = trimmedEnv(process.env.UPSTASH_REDIS_REST_TOKEN);
    if (!url || !token) return null;
    if (!client) {
        // Values are JSON strings from JSON.stringify; disable auto-parse on GET.
        client = new Redis({ url, token, automaticDeserialization: false });
    }
    return client;
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

/** True when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set (trimmed). */
export function isUpstashConfigured(): boolean {
    return Boolean(trimmedEnv(process.env.UPSTASH_REDIS_REST_URL) && trimmedEnv(process.env.UPSTASH_REDIS_REST_TOKEN));
}

const SET_RETRIES = 3;
const SET_RETRY_MS = [80, 200];

async function setJsonKey(key: string, json: string): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    let last: unknown;
    for (let attempt = 0; attempt < SET_RETRIES; attempt++) {
        try {
            await redis.set(key, json);
            return;
        } catch (e) {
            last = e;
            if (attempt < SET_RETRIES - 1) {
                await new Promise((r) => setTimeout(r, SET_RETRY_MS[attempt] ?? 300));
            }
        }
    }
    throw last;
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
    await setJsonKey(KEY_RES, json);
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
    await setJsonKey(KEY_CANCEL, json);
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
    await setJsonKey(KEY_QUEUE, json);
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
    await setJsonKey(KEY_ALT, json);
}
