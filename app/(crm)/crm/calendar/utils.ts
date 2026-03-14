import {
    HOUR_ROW_BASE_HEIGHT,
    HOUR_ROW_BASE_HEIGHT_MOBILE,
    HOUR_ROW_CELL_PADDING_Y,
    HOUR_ROW_CELL_PADDING_Y_MOBILE,
    RESERVATION_CARD_GAP,
    RESERVATION_CARD_GAP_MOBILE,
    RESERVATION_CARD_HEIGHT,
    RESERVATION_CARD_HEIGHT_MOBILE,
    TIME_COLUMN_HOURS,
} from './constants';

/** Pixel offset from top of hour rows for current time (10–22). Returns 0 if before 10am, max if after 10pm. */
export function getNowLineOffset(
    now: Date,
    hourRowHeights: Record<number, number>
): number {
    const hour = now.getHours();
    const min = now.getMinutes();
    if (hour < TIME_COLUMN_HOURS[0]) return 0;
    if (hour > TIME_COLUMN_HOURS[TIME_COLUMN_HOURS.length - 1]) {
        return TIME_COLUMN_HOURS.reduce((sum, h) => sum + (hourRowHeights[h] ?? 0), 0);
    }
    let offset = 0;
    for (const h of TIME_COLUMN_HOURS) {
        if (h < hour) {
            offset += hourRowHeights[h] ?? 0;
        } else if (h === hour) {
            offset += ((hourRowHeights[h] ?? 0) * (min / 60));
            break;
        } else break;
    }
    return offset;
}
import type { DayReservation, Reservation } from './types';

export function formatHourAmPm(hour24: number): string {
    if (hour24 === 12) return '12 pm';
    if (hour24 === 0) return '12 am';
    if (hour24 < 12) return `${hour24} am`;
    return `${hour24 - 12} pm`;
}

export function parseTimeToMinutes(t: string): number {
    const s = t.trim().toLowerCase();
    const m = s.match(/(\d{1,2})(?::(\d{2}))?\s*pm?/i) || s.match(/(\d{1,2}):(\d{2})/);
    if (m) {
        let h = parseInt(m[1], 10);
        const min = m[2] ? parseInt(m[2], 10) : 0;
        if (s.includes('p') && h < 12) h += 12;
        return h * 60 + min;
    }
    if (/^\d{1,2}:\d{2}$/.test(s)) {
        const [h, min] = s.split(':').map(Number);
        return (h ?? 0) * 60 + (min ?? 0);
    }
    return 10 * 60;
}

export function minutesToSlot(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const slotM = m >= 30 ? 30 : 0;
    return `${h.toString().padStart(2, '0')}:${slotM.toString().padStart(2, '0')}`;
}

export function getDurationMinutes(guests: string): number {
    const g = parseInt(guests, 10);
    if (g <= 2) return 90;
    return 120;
}

export function formatTimeLabelFromMinutes(minutes: number): string {
    const h24 = Math.floor(minutes / 60);
    const m = minutes % 60;
    const suffix = h24 >= 12 ? 'pm' : 'am';
    const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
    return `${h12}:${m.toString().padStart(2, '0')} ${suffix}`;
}

export function formatTimeRangeLabel(startMinutes: number, endMinutes: number): string {
    return `${formatTimeLabelFromMinutes(startMinutes)} – ${formatTimeLabelFromMinutes(endMinutes)}`;
}

export function formatTimeRange24hLabel(startMinutes: number, endMinutes: number): string {
    return `${minutesToSlot(startMinutes)} - ${minutesToSlot(endMinutes)}`;
}

export function getReservationTone(guests: string): { container: string; meta: string } {
    const g = parseInt(guests, 10);
    if (Number.isNaN(g) || g <= 2) {
        return {
            container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
            meta: 'text-emerald-700/90',
        };
    }
    if (g <= 4) {
        return {
            container: 'bg-sky-50 border-sky-200 text-sky-900',
            meta: 'text-sky-700/90',
        };
    }
    return {
        container: 'bg-amber-50 border-amber-200 text-amber-900',
        meta: 'text-amber-700/90',
    };
}

export function addDays(iso: string, days: number): string {
    const d = new Date(iso + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}

export function getMonday(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10);
}

export function getHeaderDateLabel(startDate: string): string {
    const mon = new Date(startDate + 'T00:00:00');
    const sun = addDays(startDate, 6);
    const sunD = new Date(sun + 'T00:00:00');
    return `${mon.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${sunD.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })}`;
}

export function getReservationDetails(reservation: Reservation | null): { dateLabel: string; timeRangeLabel: string } | null {
    if (!reservation) return null;
    const startMin = parseTimeToMinutes(reservation.time);
    const endMin = startMin + getDurationMinutes(reservation.guests);
    return {
        dateLabel: new Date(reservation.date + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'long',
            day: 'numeric',
        }),
        timeRangeLabel: formatTimeRange24hLabel(startMin, endMin),
    };
}

export function buildCalendarData(
    reservations: Reservation[],
    displayDates: string[],
    isMobile = false
): {
    reservationsByDate: Record<string, DayReservation[]>;
    hourRowHeights: Record<number, number>;
} {
    const reservationsByDate: Record<string, DayReservation[]> = {};
    const hourCountsByDate: Record<string, Record<number, number>> = {};

    displayDates.forEach((date) => {
        reservationsByDate[date] = [];
        hourCountsByDate[date] = {};
        TIME_COLUMN_HOURS.forEach((hour) => {
            hourCountsByDate[date][hour] = 0;
        });
    });

    reservations.forEach((reservation) => {
        if (!reservationsByDate[reservation.date]) return;

        const startMin = parseTimeToMinutes(reservation.time);
        const endMin = startMin + getDurationMinutes(reservation.guests);
        const hour = Math.floor(startMin / 60);

        reservationsByDate[reservation.date].push({
            ...reservation,
            startMin,
            endMin,
        });

        if (hourCountsByDate[reservation.date][hour] !== undefined) {
            hourCountsByDate[reservation.date][hour] += 1;
        }
    });

    displayDates.forEach((date) => {
        reservationsByDate[date].sort((a, b) => a.startMin - b.startMin);
    });

    const cardHeight = isMobile ? RESERVATION_CARD_HEIGHT_MOBILE : RESERVATION_CARD_HEIGHT;
    const cardGap = isMobile ? RESERVATION_CARD_GAP_MOBILE : RESERVATION_CARD_GAP;
    const baseRowHeight = isMobile ? HOUR_ROW_BASE_HEIGHT_MOBILE : HOUR_ROW_BASE_HEIGHT;
    const cellPaddingY = isMobile ? HOUR_ROW_CELL_PADDING_Y_MOBILE : HOUR_ROW_CELL_PADDING_Y;

    const hourRowHeights: Record<number, number> = {};
    TIME_COLUMN_HOURS.forEach((hour) => {
        let maxCardsInHour = 0;
        displayDates.forEach((date) => {
            const count = hourCountsByDate[date][hour] ?? 0;
            if (count > maxCardsInHour) {
                maxCardsInHour = count;
            }
        });

        const cardsHeight =
            maxCardsInHour > 0 ? maxCardsInHour * cardHeight + (maxCardsInHour - 1) * cardGap : 0;

        hourRowHeights[hour] = Math.max(baseRowHeight, cardsHeight + cellPaddingY * 2);
    });

    return { reservationsByDate, hourRowHeights };
}
