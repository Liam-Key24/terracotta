import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { getDataDir } from './_dataDir';
import { getRetentionCutoffDate, getRetentionCutoffMs } from './_retention';
import {
    isUpstashConfigured,
    upstashGetCancellationsJson,
    upstashGetReservationsJson,
    upstashSetCancellationsJson,
    upstashSetReservationsJson,
} from './_upstash';

const MAX_PER_SLOT = 5;

export type ReservationRecord = {
    id: string;
    number: number;
    date: string;
    time: string;
    name: string;
    email: string;
    phone: string;
    guests: string;
    notes?: string;
    tableIds?: string[];
    addedAt?: string;
};

export type ReservationCancellationRecord = {
    id: string;
    reservationId: string;
    reservationNumber: number;
    reason: string;
    cancelledAt: string;
    reservation: ReservationRecord;
};

function getReservationsPath(): string {
    return join(getDataDir(), 'reservations.json');
}

function getCancellationsPath(): string {
    return join(getDataDir(), 'reservation-cancellations.json');
}

function readReservationsFromFile(): ReservationRecord[] {
    const path = getReservationsPath();
    try {
        if (!existsSync(path)) return [];
        const raw = readFileSync(path, 'utf-8');
        const data = JSON.parse(raw);
        const list = Array.isArray(data) ? data : [];
        const cutoff = getRetentionCutoffDate();
        const kept = list.filter((r) => r.date >= cutoff);
        if (kept.length < list.length) writeReservationsFile(kept);
        return kept;
    } catch {
        return [];
    }
}

function writeReservationsFile(entries: ReservationRecord[]): void {
    const path = getReservationsPath();
    const dir = getDataDir();
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(path, JSON.stringify(entries, null, 2), 'utf-8');
}

function readCancellationsFromFile(): ReservationCancellationRecord[] {
    const path = getCancellationsPath();
    try {
        if (!existsSync(path)) return [];
        const raw = readFileSync(path, 'utf-8');
        const data = JSON.parse(raw);
        const list = Array.isArray(data) ? data : [];
        const cutoffMs = getRetentionCutoffMs();
        const kept = list.filter((r) => new Date(r.cancelledAt).getTime() >= cutoffMs);
        if (kept.length < list.length) writeCancellationsFile(kept);
        return kept;
    } catch {
        return [];
    }
}

function writeCancellationsFile(entries: ReservationCancellationRecord[]): void {
    const path = getCancellationsPath();
    const dir = getDataDir();
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(path, JSON.stringify(entries, null, 2), 'utf-8');
}

function applyReservationDateRetention(list: ReservationRecord[]): ReservationRecord[] {
    const cutoff = getRetentionCutoffDate();
    return list.filter((r) => r.date >= cutoff);
}

function applyCancellationRetention(list: ReservationCancellationRecord[]): ReservationCancellationRecord[] {
    const cutoffMs = getRetentionCutoffMs();
    return list.filter((r) => new Date(r.cancelledAt).getTime() >= cutoffMs);
}

async function persistReservations(entries: ReservationRecord[]): Promise<void> {
    const kept = applyReservationDateRetention(entries);
    writeReservationsFile(kept);
    if (isUpstashConfigured()) {
        await upstashSetReservationsJson(JSON.stringify(kept));
    }
}

async function persistCancellations(entries: ReservationCancellationRecord[]): Promise<void> {
    const kept = applyCancellationRetention(entries);
    writeCancellationsFile(kept);
    if (isUpstashConfigured()) {
        await upstashSetCancellationsJson(JSON.stringify(kept));
    }
}

/**
 * Single source of truth: Upstash when configured (e.g. Vercel), else local `data/` files.
 */
export async function loadReservations(): Promise<ReservationRecord[]> {
    if (!isUpstashConfigured()) {
        return readReservationsFromFile();
    }

    const raw = await upstashGetReservationsJson();
    if (raw) {
        try {
            const list = JSON.parse(raw) as ReservationRecord[];
            if (Array.isArray(list)) {
                const kept = applyReservationDateRetention(list);
                if (kept.length < list.length) {
                    await persistReservations(kept);
                }
                if (kept.length > 0) {
                    return kept;
                }
            }
        } catch {
            /* fall through */
        }
    }

    const file = readReservationsFromFile();
    if (file.length > 0) {
        await upstashSetReservationsJson(JSON.stringify(file));
    }
    return file;
}

async function loadCancellations(): Promise<ReservationCancellationRecord[]> {
    if (!isUpstashConfigured()) {
        return readCancellationsFromFile();
    }

    const raw = await upstashGetCancellationsJson();
    if (raw) {
        try {
            const list = JSON.parse(raw) as ReservationCancellationRecord[];
            if (Array.isArray(list)) {
                const kept = applyCancellationRetention(list);
                if (kept.length < list.length) {
                    await persistCancellations(kept);
                }
                if (kept.length > 0) {
                    return kept;
                }
            }
        } catch {
            /* fall through */
        }
    }

    const file = readCancellationsFromFile();
    if (file.length > 0) {
        await upstashSetCancellationsJson(JSON.stringify(file));
    }
    return file;
}

function slotKey(date: string, time: string): string {
    return `${String(date).trim()}|${String(time).trim()}`;
}

export async function countForSlot(date: string, time: string): Promise<number> {
    const key = slotKey(date, time);
    const all = await loadReservations();
    return all.filter((r) => slotKey(r.date, r.time) === key).length;
}

export function confirmationId(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

/** @deprecated Use `loadReservations()` — kept for call sites that expect the old name. */
export async function getMergedReservations(): Promise<ReservationRecord[]> {
    return loadReservations();
}

export async function getAllReservations(): Promise<ReservationRecord[]> {
    return loadReservations();
}

export async function addReservation(
    id: string,
    data: Omit<ReservationRecord, 'id' | 'number'>
): Promise<{ success: boolean; record?: ReservationRecord; error?: string }> {
    const all = await loadReservations();
    if (all.some((r) => r.id === id)) {
        return { success: false, error: 'Already exists' };
    }
    const key = slotKey(data.date, data.time);
    const count = all.filter((r) => slotKey(r.date, r.time) === key).length;
    if (count >= MAX_PER_SLOT) {
        return { success: false, error: 'Time slot full' };
    }
    const maxNumber = all.length === 0 ? 0 : Math.max(...all.map((r) => r.number));
    const record: ReservationRecord = {
        ...data,
        id,
        number: maxNumber + 1,
        addedAt: data.addedAt ?? new Date().toISOString(),
    };
    all.push(record);
    await persistReservations(all);
    return { success: true, record };
}

export type ReservationPatch = Partial<
    Pick<ReservationRecord, 'date' | 'time' | 'tableIds' | 'name' | 'email' | 'phone' | 'guests' | 'notes'>
>;

export async function updateReservation(id: string, patch: ReservationPatch): Promise<ReservationRecord | null> {
    const all = await loadReservations();
    const index = all.findIndex((r) => r.id === id);
    if (index === -1) return null;
    const updated = { ...all[index], ...patch };
    all[index] = updated;
    await persistReservations(all);
    return updated;
}

export async function getMergedReservationById(id: string): Promise<ReservationRecord | null> {
    const merged = await loadReservations();
    return merged.find((r) => r.id === id) ?? null;
}

export async function getReservationById(id: string): Promise<ReservationRecord | null> {
    const all = await loadReservations();
    return all.find((r) => r.id === id) ?? null;
}

export async function listReservationCancellations(): Promise<ReservationCancellationRecord[]> {
    return loadCancellations();
}

export async function cancelReservation(
    id: string,
    reason: string
): Promise<{
    success: boolean;
    cancelled?: ReservationRecord;
    record?: ReservationCancellationRecord;
    error?: string;
}> {
    const trimmedReason = String(reason ?? '').trim();
    if (!trimmedReason) return { success: false, error: 'Cancellation reason is required' };

    const all = await loadReservations();
    const index = all.findIndex((r) => r.id === id);
    if (index === -1) return { success: false, error: 'Reservation not found' };

    const [cancelled] = all.splice(index, 1);
    await persistReservations(all);

    const cancellationRecord: ReservationCancellationRecord = {
        id: createHash('sha256')
            .update(`${Date.now()}-${cancelled.id}-${trimmedReason}`)
            .digest('hex'),
        reservationId: cancelled.id,
        reservationNumber: cancelled.number,
        reason: trimmedReason,
        cancelledAt: new Date().toISOString(),
        reservation: cancelled,
    };

    const cancellations = await loadCancellations();
    cancellations.unshift(cancellationRecord);
    await persistCancellations(cancellations);

    return { success: true, cancelled, record: cancellationRecord };
}

export { MAX_PER_SLOT };
