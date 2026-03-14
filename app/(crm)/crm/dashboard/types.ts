export type Reservation = {
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
};

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

export type Table = {
    id: string;
    label: string;
    maxGuests: number;
};

export type QueueAction = 'approve' | 'reject' | 'suggest' | null;

export type DayNote = {
    id: string;
    name: string;
    time: string;
    guests: string;
    notes: string;
};
