import type { DayNote, Reservation } from './types';

export function formatLongDate(iso: string): string {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export function parseTimeToMinutes(time: string): number {
    const raw = time.trim().toLowerCase();
    const full = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (full) {
        const hour = Number(full[1] ?? 0);
        const min = Number(full[2] ?? 0);
        return hour * 60 + min;
    }

    const ampm = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
    if (ampm) {
        let hour = Number(ampm[1] ?? 0);
        const min = Number(ampm[2] ?? 0);
        if (ampm[3] === 'pm' && hour < 12) hour += 12;
        if (ampm[3] === 'am' && hour === 12) hour = 0;
        return hour * 60 + min;
    }

    return 0;
}

export function formatTableLabels(tableIds: string[] | undefined): string {
    if (!tableIds?.length) return '';
    return tableIds
        .map((tableId) => {
            const match = String(tableId).match(/(\d+)/);
            if (match?.[1]) return `Table ${match[1]}`;
            return String(tableId).replace(/^table/i, 'Table ');
        })
        .join(', ');
}

export function buildDayNotes(dayReservations: Reservation[]): DayNote[] {
    return dayReservations
        .filter((reservation) => reservation.notes?.trim())
        .map((reservation) => ({
            id: reservation.id,
            name: reservation.name,
            time: reservation.time,
            guests: reservation.guests,
            notes: reservation.notes!.trim(),
        }));
}

export function getBusiestTime(dayReservations: Reservation[]): { time: string; count: number } | null {
    if (dayReservations.length === 0) return null;

    const counts = new Map<string, number>();
    dayReservations.forEach((reservation) => {
        counts.set(reservation.time, (counts.get(reservation.time) ?? 0) + 1);
    });

    const sorted = Array.from(counts.entries()).sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return parseTimeToMinutes(a[0]) - parseTimeToMinutes(b[0]);
    });

    const [time, count] = sorted[0] ?? ['', 0];
    return time ? { time, count } : null;
}
