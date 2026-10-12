import { Redis } from '@upstash/redis';

const KEY_RES = 'tc:reservations';
const KEY_CANCEL = 'tc:cancellations';
const KEY_QUEUE = 'tc:queue';
const KEY_ALT = 'tc:alternatives';
const DEBUG_ENDPOINT = 'http://127.0.0.1:7243/ingest/1fcc1fa4-567e-4c98-a901-f11466da8e45';
const DEBUG_RUN_ID = 'booking-db-investigation-1';

let client: Redis | null = null;
let clientCredentialsKey = '';
let loggedMissingCredsOnce = false;

function debugLog(hypothesisId: string, message: string, data: Record<string, unknown>): void {
    // #region agent log
    fetch(DEBUG_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            runId: DEBUG_RUN_ID,
            hypothesisId,
            location: 'app/api/reservation/_upstash.ts',
            message,
            data,
            timestamp: Date.now(),
        }),
    }).catch(() => {});
    // #endregion
}

function trimmedEnv(value: string | undefined): string | undefined {
    const t = value?.trim();
    return t && t.length > 0 ? t : undefined;
}

/** Upstash REST URL + token only (`UPSTASH_REDIS_REST_*`). */
function redisCredentials(): { url: string; token: string } | null {
    const rawUrl = process.env.UPSTASH_REDIS_REST_URL;
    const rawToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    const url = trimmedEnv(rawUrl);
    const token = trimmedEnv(rawToken);
    if (url && token) {
        loggedMissingCredsOnce = false;
        return { url, token };
    }
    if (!loggedMissingCredsOnce) {
        loggedMissingCredsOnce = true;
        debugLog('H1', 'upstash credentials missing/blank at runtime', {
            hasUrl: Boolean(url),
            hasToken: Boolean(token),
            rawUrlLength: rawUrl?.length ?? 0,
            rawTokenLength: rawToken?.length ?? 0,
        });
    }
    return null;
}

function getRedis(): Redis | null {
    const cred = redisCredentials();
    if (!cred) return null;

    const key = `${cred.url}\0${cred.token}`;
    if (!client || clientCredentialsKey !== key) {
        client = new Redis({ url: cred.url, token: cred.token, automaticDeserialization: false });
        clientCredentialsKey = key;
        let host = 'invalid-url';
        try {
            host = new URL(cred.url).host;
        } catch {
            // ignore
        }
        debugLog('H5', 'redis client initialized/refreshed', {
            host,
            tokenLength: cred.token.length,
        });
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

/** True when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are both set (trimmed). */
export function isUpstashConfigured(): boolean {
    return redisCredentials() !== null;
}

const SET_RETRIES = 3;
const SET_RETRY_MS = [80, 200];

async function setJsonKey(key: string, json: string): Promise<void> {
    const redis = getRedis();
    if (!redis) {
        debugLog('H1', 'setJsonKey skipped because redis client is unavailable', { key });
        return;
    }
    debugLog('H4', 'setJsonKey attempt start', {
        key,
        jsonLength: json.length,
        retries: SET_RETRIES,
    });
    let last: unknown;
    for (let attempt = 0; attempt < SET_RETRIES; attempt++) {
        try {
            await redis.set(key, json);
            if (attempt > 0) {
                debugLog('H2', 'setJsonKey succeeded after retry', {
                    key,
                    attemptsUsed: attempt + 1,
                });
            }
            return;
        } catch (e) {
            last = e;
            if (attempt < SET_RETRIES - 1) {
                await new Promise((r) => setTimeout(r, SET_RETRY_MS[attempt] ?? 300));
            }
        }
    }
    const errorMessage = last instanceof Error ? last.message : String(last);
    debugLog('H2', 'setJsonKey failed after retries', {
        key,
        attemptsTried: SET_RETRIES,
        errorMessage,
    });
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

export type UpstashAddReservationResult =
    | { success: true; record: Record<string, unknown>; listJson: string }
    | { success: false; error: string };

/**
 * Atomically append one reservation to `tc:reservations` (read → capacity/id checks → number → SET).
 * ARGV: id, date, time, maxPerSlot, cutoffDate, recordJson (fields without id/number; may include addedAt).
 */
const ADD_RESERVATION_LUA = `
local raw = redis.call('GET', KEYS[1])
local list = {}
if raw and raw ~= false and raw ~= '' then
  local ok, decoded = pcall(cjson.decode, raw)
  if ok and type(decoded) == 'table' then
    list = decoded
  end
end

local id = ARGV[1]
local date = ARGV[2]
local time = ARGV[3]
local maxPerSlot = tonumber(ARGV[4])
local cutoffDate = ARGV[5]
local recordJson = ARGV[6]

local kept = {}
for i = 1, #list do
  local r = list[i]
  if type(r) == 'table' and type(r.date) == 'string' and r.date >= cutoffDate then
    kept[#kept + 1] = r
  end
end
list = kept

for i = 1, #list do
  local r = list[i]
  if type(r) == 'table' and r.id == id then
    return cjson.encode({ success = false, error = 'Already exists' })
  end
end

local count = 0
local maxNumber = 0
for i = 1, #list do
  local r = list[i]
  if type(r) == 'table' then
    local rd = type(r.date) == 'string' and r.date or ''
    local rt = type(r.time) == 'string' and r.time or ''
    if rd == date and rt == time then
      count = count + 1
    end
    local n = tonumber(r.number)
    if n and n > maxNumber then
      maxNumber = n
    end
  end
end

if count >= maxPerSlot then
  return cjson.encode({ success = false, error = 'Time slot full' })
end

local ok, record = pcall(cjson.decode, recordJson)
if not ok or type(record) ~= 'table' then
  return cjson.encode({ success = false, error = 'Invalid record' })
end

record.id = id
record.number = maxNumber + 1
record.date = date
record.time = time
list[#list + 1] = record

local listJson = cjson.encode(list)
redis.call('SET', KEYS[1], listJson)
return cjson.encode({ success = true, record = record, listJson = listJson })
`;

export async function upstashAddReservationAtomic(args: {
    id: string;
    date: string;
    time: string;
    maxPerSlot: number;
    cutoffDate: string;
    recordJson: string;
}): Promise<UpstashAddReservationResult> {
    const redis = getRedis();
    if (!redis) {
        throw new Error('Upstash Redis is not configured');
    }

    let last: unknown;
    for (let attempt = 0; attempt < SET_RETRIES; attempt++) {
        try {
            const raw = await redis.eval<string[], string>(ADD_RESERVATION_LUA, [KEY_RES], [
                args.id,
                args.date,
                args.time,
                String(args.maxPerSlot),
                args.cutoffDate,
                args.recordJson,
            ]);
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (!parsed || typeof parsed !== 'object') {
                throw new Error('Unexpected Lua result');
            }
            const result = parsed as {
                success?: boolean;
                error?: string;
                record?: Record<string, unknown>;
                listJson?: string;
            };
            if (result.success === true && result.record && typeof result.listJson === 'string') {
                return { success: true, record: result.record, listJson: result.listJson };
            }
            return { success: false, error: typeof result.error === 'string' ? result.error : 'Add failed' };
        } catch (e) {
            last = e;
            if (attempt < SET_RETRIES - 1) {
                await new Promise((r) => setTimeout(r, SET_RETRY_MS[attempt] ?? 300));
            }
        }
    }
    throw last instanceof Error ? last : new Error(String(last));
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
        debugLog('H3', 'upstashGetQueueJson returned', {
            valueType: v === null ? 'null' : typeof v,
            isNull: v === null,
        });
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

/** Safe snippet for API responses (no secrets). */
export function formatRedisErrorForClient(err: unknown): string {
    const message = err instanceof Error ? err.message : String(err);
    if (/WRONGPASS|unauthorized|401/i.test(message)) {
        return 'Redis rejected the token. Confirm UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN match the same Upstash database (REST token).';
    }
    if (/payload too large|max.*size|ERR string exceeds/i.test(message)) {
        return 'Queue data is too large for Redis; clear old waitlist entries or contact support.';
    }
    return message.length > 220 ? `${message.slice(0, 220)}…` : message;
}
