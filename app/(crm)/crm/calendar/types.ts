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

export type Table = {
    id: string;
    label: string;
    maxGuests: number;
};

export type DayReservation = Reservation & {
    startMin: number;
    endMin: number;
};

export type ReservationCreateInput = {
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    guests: string;
    notes?: string;
    tableIds?: string[];
};
