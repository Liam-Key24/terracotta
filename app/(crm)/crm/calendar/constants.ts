export const HEADER_HEIGHT = 76;
export const DAY_COL_WIDTH = 220;
export const HOUR_ROW_BASE_HEIGHT = 112;
export const RESERVATION_CARD_HEIGHT = 72;
export const RESERVATION_CARD_GAP = 8;

// Hours shown in time column (10am–10pm = 10..22 in 24h)
export const TIME_COLUMN_HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

export const SLOTS_30 = (() => {
    const out: string[] = [];
    for (let h = 10; h <= 22; h += 1) {
        out.push(`${h.toString().padStart(2, '0')}:00`);
        if (h < 22) out.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return out;
})();
