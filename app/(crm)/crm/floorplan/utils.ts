import { FLOORPLAN_TABLE_LAYOUT, PHYSICAL_TO_DISPLAY_TABLE_ID } from './constants';
import type { DisplayTableId, FloorReservation, FloorTable, VisualTable } from './types';

type FloorTone = {
    card: string;
    cardMeta: string;
    table: string;
    seat: string;
    label: string;
    chipActive: string;
};

export function parseTimeToMinutes(time: string): number {
    const raw = time.trim().toLowerCase();
    const compact = raw.replace(/\s+/g, '');
    const full = compact.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/);
    if (full) {
        let hour = Number(full[1] ?? 0);
        const min = Number(full[2] ?? 0);
        const suffix = full[3];
        if (suffix === 'pm' && hour < 12) hour += 12;
        if (suffix === 'am' && hour === 12) hour = 0;
        return hour * 60 + min;
    }
    return 0;
}

export function formatTimeLabelFromMinutes(minutes: number): string {
    const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
    const hour24 = Math.floor(normalized / 60);
    const min = normalized % 60;
    const suffix = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    return `${hour12}:${String(min).padStart(2, '0')} ${suffix}`;
}

export function parseGuests(guests: string): number {
    const count = parseInt(guests.replace('+', ''), 10);
    if (Number.isNaN(count)) return 0;
    return count;
}

function getDurationMinutes(guests: string): number {
    return parseGuests(guests) <= 2 ? 90 : 120;
}

export function formatReservationTimeRange(time: string, guests: string): string {
    const start = parseTimeToMinutes(time);
    const end = start + getDurationMinutes(guests);
    return `${formatTimeLabelFromMinutes(start)} - ${formatTimeLabelFromMinutes(end)}`;
}

export function formatDateShort(iso: string): string {
    const date = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(date.getTime())) return iso;
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
}

export function getTone(guests: string): FloorTone {
    const count = parseGuests(guests);
    if (count <= 2) {
        return {
            card: 'bg-emerald-50 border-emerald-200 text-emerald-900',
            cardMeta: 'text-emerald-700',
            table: 'bg-emerald-50 border-2 border-emerald-200',
            seat: 'bg-emerald-50 border border-emerald-200',
            label: 'text-emerald-700',
            chipActive: 'bg-emerald-600 text-white border-emerald-600',
        };
    }
    if (count <= 4) {
        return {
            card: 'bg-sky-50 border-sky-200 text-sky-900',
            cardMeta: 'text-sky-700',
            table: 'bg-sky-50 border-2 border-sky-200',
            seat: 'bg-sky-50 border border-sky-200',
            label: 'text-sky-700',
            chipActive: 'bg-sky-600 text-white border-sky-600',
        };
    }
    return {
        card: 'bg-amber-50 border-amber-200 text-amber-900',
        cardMeta: 'text-amber-700',
        table: 'bg-amber-50 border-2 border-amber-200',
        seat: 'bg-amber-50 border border-amber-200',
        label: 'text-amber-700',
        chipActive: 'bg-amber-600 text-white border-amber-600',
    };
}

function extractTableNumber(value: string): DisplayTableId | null {
    const match = value.match(/(\d+)/);
    if (!match) return null;
    const candidate = match[1];
    return candidate in PHYSICAL_TO_DISPLAY_TABLE_ID ? (candidate as DisplayTableId) : null;
}

export function buildVisualTableMap(tables: FloorTable[]): Map<DisplayTableId, VisualTable> {
    const map = new Map<DisplayTableId, VisualTable>();

    FLOORPLAN_TABLE_LAYOUT.forEach(({ displayId, physicalId }) => {
        map.set(displayId, {
            displayId,
            backendId: `table${physicalId}`,
            label: `Table ${displayId}`,
        });
    });

    tables.forEach((table) => {
        const physicalNumber = extractTableNumber(`${table.label} ${table.id}`);
        if (!physicalNumber) return;
        const displayId = PHYSICAL_TO_DISPLAY_TABLE_ID[physicalNumber];
        map.set(displayId, {
            displayId,
            backendId: table.id,
            label: `Table ${displayId}`,
        });
    });

    return map;
}

export function reservationHasTable(reservation: FloorReservation, table: VisualTable): boolean {
    const backendId = String(table.backendId).toLowerCase();
    const physicalNumber = backendId.match(/(\d+)/)?.[1] ?? null;
    const aliases = new Set([backendId]);
    if (physicalNumber) aliases.add(physicalNumber);
    return (reservation.tableIds ?? []).some((id) => aliases.has(String(id).toLowerCase()));
}
