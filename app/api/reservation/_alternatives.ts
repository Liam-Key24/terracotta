import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { getRetentionCutoffMs } from './_retention';
import { getDataDir } from './_dataDir';
import { isUpstashConfigured, upstashGetAlternativesJson, upstashSetAlternativesJson } from './_upstash';

const EXPIRY_DAYS = 7;

export type AlternativeEntry = {
    token: string;
    name: string;
    email: string;
    phone: string;
    guests: string;
    notes?: string;
    suggestedDate: string;
    suggestedTime: string;
    suggestedTableIds?: string[];
    createdAt: string;
};

function getAlternativesPath(): string {
    return join(getDataDir(), 'reservation-alternatives.json');
}

function readAlternativesFromFile(): AlternativeEntry[] {
    const path = getAlternativesPath();
    try {
        if (!existsSync(path)) return [];
        const raw = readFileSync(path, 'utf-8');
        const data = JSON.parse(raw);
        const list = Array.isArray(data) ? data : [];
        const cutoffMs = getRetentionCutoffMs();
        const kept = list.filter((e) => new Date(e.createdAt).getTime() >= cutoffMs);
        if (kept.length < list.length) writeAlternativesFile(kept);
        return kept;
    } catch {
        return [];
    }
}

function writeAlternativesFile(entries: AlternativeEntry[]): void {
    const path = getAlternativesPath();
    const dir = getDataDir();
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(path, JSON.stringify(entries, null, 2), 'utf-8');
}

function applyAlternativesRetention(list: AlternativeEntry[]): AlternativeEntry[] {
    const cutoffMs = getRetentionCutoffMs();
    return list.filter((e) => new Date(e.createdAt).getTime() >= cutoffMs);
}

async function persistAlternatives(entries: AlternativeEntry[]): Promise<void> {
    const kept = applyAlternativesRetention(entries);
    writeAlternativesFile(kept);
    if (isUpstashConfigured()) {
        await upstashSetAlternativesJson(JSON.stringify(kept));
    }
}

export async function loadAlternatives(): Promise<AlternativeEntry[]> {
    if (!isUpstashConfigured()) {
        return readAlternativesFromFile();
    }

    const raw = await upstashGetAlternativesJson();
    if (raw) {
        try {
            const list = JSON.parse(raw) as AlternativeEntry[];
            if (Array.isArray(list)) {
                const kept = applyAlternativesRetention(list);
                if (kept.length < list.length) {
                    await persistAlternatives(kept);
                }
                return kept;
            }
        } catch {
            /* fall through */
        }
    }

    const file = readAlternativesFromFile();
    if (file.length > 0) {
        await upstashSetAlternativesJson(JSON.stringify(file));
    }
    return file;
}

export async function listAlternatives(): Promise<AlternativeEntry[]> {
    return loadAlternatives();
}

export async function createAlternative(entry: Omit<AlternativeEntry, 'token' | 'createdAt'>): Promise<string> {
    const token = randomBytes(24).toString('base64url');
    const all = await loadAlternatives();
    all.push({
        ...entry,
        token,
        createdAt: new Date().toISOString(),
    });
    await persistAlternatives(all);
    return token;
}

export async function getAlternativeByToken(token: string): Promise<AlternativeEntry | null> {
    const all = await loadAlternatives();
    const entry = all.find((e) => e.token === token);
    if (!entry) return null;
    const created = new Date(entry.createdAt).getTime();
    const expiry = created + EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    if (Date.now() > expiry) return null;
    return entry;
}

export async function removeAlternative(token: string): Promise<boolean> {
    const all = await loadAlternatives();
    const next = all.filter((e) => e.token !== token);
    if (next.length === all.length) return false;
    await persistAlternatives(next);
    return true;
}
