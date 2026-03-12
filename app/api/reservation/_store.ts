import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

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
    return join(process.cwd(), 'data', 'reservations.json');
}

function getCancellationsPath(): string {
    return join(process.cwd(), 'data', 'reservation-cancellations.json');
}

function readAll(): ReservationRecord[] {
    const path = getReservationsPath();
    try {
        if (!existsSync(path)) return [];
        const raw = readFileSync(path, 'utf-8');
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function writeAll(entries: ReservationRecord[]): void {
    const path = getReservationsPath();
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(path, JSON.stringify(entries, null, 2), 'utf-8');
}

function readCancellations(): ReservationCancellationRecord[] {
    const path = getCancellationsPath();
    try {
        if (!existsSync(path)) return [];
        const raw = readFileSync(path, 'utf-8');
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function writeCancellations(entries: ReservationCancellationRecord[]): void {
    const path = getCancellationsPath();
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(path, JSON.stringify(entries, null, 2), 'utf-8');
}

function slotKey(date: string, time: string): string {
    return `${String(date).trim()}|${String(time).trim()}`;
}

export function countForSlot(date: string, time: string): number {
    const key = slotKey(date, time);
    return readAll().filter((r) => slotKey(r.date, r.time) === key).length;
}

export function confirmationId(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

export function getAllReservations(): ReservationRecord[] {
    return readAll();
}

export function addReservation(
    id: string,
    data: Omit<ReservationRecord, 'id' | 'number'>
): { success: boolean; record?: ReservationRecord; error?: string } {
    const all = readAll();
    if (all.some((r) => r.id === id)) {
        return { success: false, error: 'Already exists' };
    }
    const count = countForSlot(data.date, data.time);
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
    writeAll(all);
    return { success: true, record };
}

export function updateReservation(
    id: string,
    patch: Partial<
        Pick<
            ReservationRecord,
            'date' | 'time' | 'tableIds' | 'name' | 'email' | 'phone' | 'guests' | 'notes'
        >
    >
): ReservationRecord | null {
    const all = readAll();
    const index = all.findIndex((r) => r.id === id);
    if (index === -1) return null;
    const updated = { ...all[index], ...patch };
    all[index] = updated;
    writeAll(all);
    return updated;
}

export function getReservationById(id: string): ReservationRecord | null {
    return readAll().find((r) => r.id === id) ?? null;
}

export function listReservationCancellations(): ReservationCancellationRecord[] {
    return readCancellations();
}

export function cancelReservation(
    id: string,
    reason: string
): { success: boolean; cancelled?: ReservationRecord; record?: ReservationCancellationRecord; error?: string } {
    const trimmedReason = String(reason ?? '').trim();
    if (!trimmedReason) return { success: false, error: 'Cancellation reason is required' };

    const all = readAll();
    const index = all.findIndex((r) => r.id === id);
    if (index === -1) return { success: false, error: 'Reservation not found' };

    const [cancelled] = all.splice(index, 1);
    writeAll(all);

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

    const cancellations = readCancellations();
    cancellations.unshift(cancellationRecord);
    writeCancellations(cancellations);

    return { success: true, cancelled, record: cancellationRecord };
}

export { MAX_PER_SLOT };
