import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getDataDir } from './_dataDir';
import { getRetentionCutoffMs } from './_retention';
import { isUpstashConfigured, upstashGetQueueJson, upstashSetQueueJson } from './_upstash';

const DEBUG_ENDPOINT = 'http://127.0.0.1:7243/ingest/1fcc1fa4-567e-4c98-a901-f11466da8e45';
const DEBUG_RUN_ID = 'booking-db-investigation-1';

function debugLog(hypothesisId: string, message: string, data: Record<string, unknown>): void {
    // #region agent log
    fetch(DEBUG_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            runId: DEBUG_RUN_ID,
            hypothesisId,
            location: 'app/api/reservation/_queue.ts',
            message,
            data,
            timestamp: Date.now(),
        }),
    }).catch(() => {});
    // #endregion
}

export type QueueEntry = {
    id: string;
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    guests: string;
    notes?: string;
    addedAt: string;
};

function getQueuePath(): string {
    return join(getDataDir(), 'reservation-queue.json');
}

function readQueueFromFile(): QueueEntry[] {
    const path = getQueuePath();
    try {
        if (!existsSync(path)) return [];
        const raw = readFileSync(path, 'utf-8');
        const data = JSON.parse(raw);
        const list = Array.isArray(data) ? data : [];
        const cutoffMs = getRetentionCutoffMs();
        const kept = list.filter((e) => new Date(e.addedAt).getTime() >= cutoffMs);
        if (kept.length < list.length) writeQueueFile(kept);
        return kept;
    } catch {
        return [];
    }
}

function writeQueueFile(entries: QueueEntry[]): void {
    const path = getQueuePath();
    const dir = getDataDir();
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(path, JSON.stringify(entries, null, 2), 'utf-8');
}

function applyQueueRetention(list: QueueEntry[]): QueueEntry[] {
    const cutoffMs = getRetentionCutoffMs();
    return list.filter((e) => new Date(e.addedAt).getTime() >= cutoffMs);
}

async function persistQueue(entries: QueueEntry[]): Promise<void> {
    const kept = applyQueueRetention(entries);
    writeQueueFile(kept);
    if (isUpstashConfigured()) {
        await upstashSetQueueJson(JSON.stringify(kept));
    }
}

/** KV when configured; otherwise local `data/` (or `/tmp` on Vercel without KV). */
export async function loadQueue(): Promise<QueueEntry[]> {
    const upstashConfigured = isUpstashConfigured();
    debugLog('H3', 'loadQueue entered', { upstashConfigured });

    if (!upstashConfigured) {
        return readQueueFromFile();
    }

    const raw = await upstashGetQueueJson();
    if (raw) {
        try {
            const list = JSON.parse(raw) as QueueEntry[];
            if (Array.isArray(list)) {
                const kept = applyQueueRetention(list);
                if (kept.length < list.length) {
                    try {
                        await persistQueue(kept);
                    } catch (err) {
                        console.error('[queue] Upstash retention sync failed (continuing with in-memory list):', err);
                    }
                }
                // Empty `[]` in Redis must not block reading local file (e.g. SET failed earlier on serverless).
                if (kept.length > 0) {
                    debugLog('H3', 'loadQueue using Upstash dataset', { count: kept.length });
                    return kept;
                }
            }
        } catch {
            /* fall through */
        }
    }

    const file = readQueueFromFile();
    if (file.length > 0) {
        try {
            await upstashSetQueueJson(JSON.stringify(file));
        } catch (err) {
            console.error('[queue] Upstash seed from file failed:', err);
        }
    }
    debugLog('H3', 'loadQueue using file fallback dataset', { count: file.length });
    return file;
}

export async function listQueue(): Promise<QueueEntry[]> {
    return loadQueue();
}

function slotKey(date: string, time: string): string {
    return `${String(date).trim()}|${String(time).trim()}`;
}

export async function countQueueForSlot(date: string, time: string): Promise<number> {
    const key = slotKey(date, time);
    const queue = await loadQueue();
    return queue.filter((e) => slotKey(e.date, e.time) === key).length;
}

export async function addToQueue(entry: QueueEntry): Promise<{ added: boolean; error?: string }> {
    const queue = await loadQueue();
    if (queue.some((e) => e.id === entry.id)) {
        debugLog('H3', 'addToQueue duplicate id rejected', {
            queueSize: queue.length,
            idLength: entry.id.length,
        });
        return { added: false, error: 'Already in queue' };
    }
    queue.push(entry);
    await persistQueue(queue);
    debugLog('H3', 'addToQueue persisted successfully', {
        queueSizeAfter: queue.length,
        idLength: entry.id.length,
    });
    return { added: true };
}

export async function removeFromQueue(id: string): Promise<boolean> {
    const queue = await loadQueue();
    const next = queue.filter((e) => e.id !== id);
    if (next.length === queue.length) return false;
    await persistQueue(next);
    return true;
}

export async function getQueueEntryById(id: string): Promise<QueueEntry | null> {
    const queue = await loadQueue();
    return queue.find((e) => e.id === id) ?? null;
}
