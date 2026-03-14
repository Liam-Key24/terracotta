import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

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
    return join(process.cwd(), 'data', 'reservation-queue.json');
}

function readQueue(): QueueEntry[] {
    const path = getQueuePath();
    try {
        if (!existsSync(path)) return [];
        const raw = readFileSync(path, 'utf-8');
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function writeQueue(entries: QueueEntry[]): void {
    const path = getQueuePath();
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(path, JSON.stringify(entries, null, 2), 'utf-8');
}

export function listQueue(): QueueEntry[] {
    return readQueue();
}

function slotKey(date: string, time: string): string {
    return `${String(date).trim()}|${String(time).trim()}`;
}

/** Count queue entries for the same date and time slot (for capacity limit). */
export function countQueueForSlot(date: string, time: string): number {
    const key = slotKey(date, time);
    return readQueue().filter((e) => slotKey(e.date, e.time) === key).length;
}

export function addToQueue(entry: QueueEntry): { added: boolean; error?: string } {
    const queue = readQueue();
    if (queue.some((e) => e.id === entry.id)) {
        return { added: false, error: 'Already in queue' };
    }
    queue.push(entry);
    writeQueue(queue);
    return { added: true };
}

export function removeFromQueue(id: string): boolean {
    const queue = readQueue().filter((e) => e.id !== id);
    if (queue.length === readQueue().length) return false;
    writeQueue(queue);
    return true;
}

export function getQueueEntryById(id: string): QueueEntry | null {
    return readQueue().find((e) => e.id === id) ?? null;
}
