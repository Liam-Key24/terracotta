export function toLocalIso(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function isIsoDate(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function getIsoDateOrFallback(candidate: string | null, fallback: string): string {
    if (candidate && isIsoDate(candidate)) return candidate;
    return fallback;
}

export function parseIsoDate(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function formatWeekRangeLabel(iso: string): string {
    const base = parseIsoDate(iso);
    const day = base.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(base);
    monday.setDate(base.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const format = (date: Date) =>
        date
            .toLocaleDateString('en-GB', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
            })
            .replace(',', '');

    return `${format(monday)} - ${format(sunday)}`;
}
