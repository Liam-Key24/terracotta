/** Data older than this is removed (reservations by date, queue/alternatives/cancellations by timestamp). */
export const RETENTION_DAYS = 60;

export function getRetentionCutoffDate(): string {
    const d = new Date();
    d.setDate(d.getDate() - RETENTION_DAYS);
    return d.toISOString().slice(0, 10);
}

export function getRetentionCutoffMs(): number {
    const d = new Date();
    d.setDate(d.getDate() - RETENTION_DAYS);
    return d.getTime();
}

export function isBeforeRetention(isoDate: string): boolean {
    return isoDate < getRetentionCutoffDate();
}

export function isBeforeRetentionMs(isoTimestamp: string): boolean {
    return new Date(isoTimestamp).getTime() < getRetentionCutoffMs();
}
