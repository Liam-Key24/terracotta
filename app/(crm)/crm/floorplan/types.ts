export type FloorReservation = {
    id: string;
    date: string;
    time: string;
    name: string;
    email?: string;
    phone?: string;
    guests: string;
    notes?: string;
    tableIds?: string[];
};

export type FloorTable = {
    id: string;
    label: string;
    maxGuests: number;
};

export const DISPLAY_TABLE_IDS = ['1', '2', '3', '4', '5', '6'] as const;
export type DisplayTableId = (typeof DISPLAY_TABLE_IDS)[number];

export type VisualTable = {
    displayId: DisplayTableId;
    backendId: string;
    label: string;
};
