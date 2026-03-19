import { kv } from '@vercel/kv';

const KEY_RES = 'tc:reservations';
const KEY_CANCEL = 'tc:cancellations';

/** True when Vercel KV / Upstash env is present (shared storage across serverless instances). */
export function isKvConfigured(): boolean {
    return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function kvGetReservationsJson(): Promise<string | null> {
    if (!isKvConfigured()) return null;
    try {
        return await kv.get<string>(KEY_RES);
    } catch {
        return null;
    }
}

export async function kvSetReservationsJson(json: string): Promise<void> {
    if (!isKvConfigured()) return;
    await kv.set(KEY_RES, json);
}

export async function kvGetCancellationsJson(): Promise<string | null> {
    if (!isKvConfigured()) return null;
    try {
        return await kv.get<string>(KEY_CANCEL);
    } catch {
        return null;
    }
}

export async function kvSetCancellationsJson(json: string): Promise<void> {
    if (!isKvConfigured()) return;
    await kv.set(KEY_CANCEL, json);
}
