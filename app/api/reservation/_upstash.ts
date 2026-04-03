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

/** True when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set. */
export function isUpstashConfigured(): boolean {
    return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export async function upstashGetReservationsJson(): Promise<string | null> {
    const redis = getRedis();
    if (!redis) return null;
    try {
        const v = await redis.get<string>(KEY_RES);
        return v ?? null;
    } catch {
        return null;
    }
}

export async function upstashSetReservationsJson(json: string): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    await redis.set(KEY_RES, json);
}

export async function upstashGetCancellationsJson(): Promise<string | null> {
    const redis = getRedis();
    if (!redis) return null;
    try {
        const v = await redis.get<string>(KEY_CANCEL);
        return v ?? null;
    } catch {
        return null;
    }
}

export async function upstashSetCancellationsJson(json: string): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    await redis.set(KEY_CANCEL, json);
}

export async function upstashGetQueueJson(): Promise<string | null> {
    const redis = getRedis();
    if (!redis) return null;
    try {
        const v = await redis.get<string>(KEY_QUEUE);
        return v ?? null;
    } catch {
        return null;
    }
}

export async function upstashSetQueueJson(json: string): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    await redis.set(KEY_QUEUE, json);
}

export async function upstashGetAlternativesJson(): Promise<string | null> {
    const redis = getRedis();
    if (!redis) return null;
    try {
        const v = await redis.get<string>(KEY_ALT);
        return v ?? null;
    } catch {
        return null;
    }
}

export async function upstashSetAlternativesJson(json: string): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    await redis.set(KEY_ALT, json);
}
