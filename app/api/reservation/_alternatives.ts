import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

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
    return join(process.cwd(), 'data', 'reservation-alternatives.json');
}

function readAlternatives(): AlternativeEntry[] {
    const path = getAlternativesPath();
    try {
        if (!existsSync(path)) return [];
        const raw = readFileSync(path, 'utf-8');
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function writeAlternatives(entries: AlternativeEntry[]): void {
    const path = getAlternativesPath();
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(path, JSON.stringify(entries, null, 2), 'utf-8');
}

export function createAlternative(entry: Omit<AlternativeEntry, 'token' | 'createdAt'>): string {
    const token = randomBytes(24).toString('base64url');
    const all = readAlternatives();
    all.push({
        ...entry,
        token,
        createdAt: new Date().toISOString(),
    });
    writeAlternatives(all);
    return token;
}

export function getAlternativeByToken(token: string): AlternativeEntry | null {
    const all = readAlternatives();
    const entry = all.find((e) => e.token === token);
    if (!entry) return null;
    const created = new Date(entry.createdAt).getTime();
    const expiry = created + EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    if (Date.now() > expiry) return null;
    return entry;
}

export function removeAlternative(token: string): boolean {
    const all = readAlternatives().filter((e) => e.token !== token);
    if (all.length === readAlternatives().length) return false;
    writeAlternatives(all);
    return true;
}
