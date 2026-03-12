'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type FloorReservation = {
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

type FloorTable = {
    id: string;
    label: string;
    maxGuests: number;
};

const DISPLAY_TABLE_IDS = ['1', '2', '3', '4', '5', '6'] as const;
type DisplayTableId = (typeof DISPLAY_TABLE_IDS)[number];

type VisualTable = {
    displayId: DisplayTableId;
    backendId: string;
    label: string;
};

const FLOORPLAN_RENDER_ORDER: DisplayTableId[] = ['1', '2', '3', '6', '5', '4'];
const DISPLAY_TABLE_SET = new Set<string>(DISPLAY_TABLE_IDS);
const NEUTRAL_SHAPE = 'bg-[#8a8a8a]';

function parseTimeToMinutes(time: string): number {
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

function formatTimeLabelFromMinutes(minutes: number): string {
    const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
    const h24 = Math.floor(normalized / 60);
    const min = normalized % 60;
    const suffix = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
    return `${h12}:${String(min).padStart(2, '0')} ${suffix}`;
}

function parseGuests(guests: string): number {
    const n = parseInt(guests.replace('+', ''), 10);
    if (Number.isNaN(n)) return 0;
    return n;
}

function getDurationMinutes(guests: string): number {
    return parseGuests(guests) <= 2 ? 90 : 120;
}

function formatReservationTimeRange(time: string, guests: string): string {
    const start = parseTimeToMinutes(time);
    const end = start + getDurationMinutes(guests);
    return `${formatTimeLabelFromMinutes(start)} - ${formatTimeLabelFromMinutes(end)}`;
}

function getTone(guests: string) {
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
    return DISPLAY_TABLE_SET.has(candidate) ? (candidate as DisplayTableId) : null;
}

function buildVisualTableMap(tables: FloorTable[]): Map<DisplayTableId, VisualTable> {
    const map = new Map<DisplayTableId, VisualTable>();
    DISPLAY_TABLE_IDS.forEach((displayId) => {
        map.set(displayId, {
            displayId,
            backendId: `table${displayId}`,
            label: `Table ${displayId}`,
        });
    });

    tables.forEach((table) => {
        const number = extractTableNumber(`${table.label} ${table.id}`);
        if (!number) return;
        map.set(number, {
            displayId: number,
            backendId: table.id,
            label: table.label || `Table ${number}`,
        });
    });

    return map;
}

function reservationHasTable(reservation: FloorReservation, table: VisualTable): boolean {
    const aliases = new Set(
        [table.backendId, table.displayId, `table${table.displayId}`].map((value) => value.toLowerCase())
    );
    return (reservation.tableIds ?? []).some((id) => aliases.has(String(id).toLowerCase()));
}

function SeatSide({
    occupied,
    toneSeatClass,
    flip,
}: {
    occupied: boolean;
    toneSeatClass?: string;
    flip?: boolean;
}) {
    const shapeClass = occupied && toneSeatClass ? toneSeatClass : NEUTRAL_SHAPE;
    return (
        <div className={`flex items-center gap-2 ${flip ? 'flex-row-reverse' : ''}`} aria-hidden>
            <div className={`w-8 h-20 rounded-full ${shapeClass}`} />
            <div className={`w-1.5 h-14 rounded-full ${shapeClass}`} />
        </div>
    );
}

function SeatTop({
    occupied,
    toneSeatClass,
}: {
    occupied: boolean;
    toneSeatClass?: string;
}) {
    const shapeClass = occupied && toneSeatClass ? toneSeatClass : NEUTRAL_SHAPE;
    return (
        <div className="flex flex-col items-center gap-1" aria-hidden>
            <div className={`h-8 w-20 rounded-full ${shapeClass}`} />
            <div className={`h-2 w-16 rounded-full ${shapeClass}`} />
        </div>
    );
}

function SeatBottom({
    occupied,
    toneSeatClass,
}: {
    occupied: boolean;
    toneSeatClass?: string;
}) {
    const shapeClass = occupied && toneSeatClass ? toneSeatClass : NEUTRAL_SHAPE;
    return (
        <div className="flex flex-col items-center gap-1" aria-hidden>
            <div className={`h-2 w-16 rounded-full ${shapeClass}`} />
            <div className={`h-8 w-20 rounded-full ${shapeClass}`} />
        </div>
    );
}

function SideSeatTable({
    displayId,
    tableClassName,
    reservation,
    seatGapClassName = 'gap-12',
    onSelectTable,
}: {
    displayId: DisplayTableId;
    tableClassName: string;
    reservation?: FloorReservation;
    seatGapClassName?: string;
    onSelectTable?: (tableId: DisplayTableId) => void;
}) {
    const tone = reservation ? getTone(reservation.guests) : null;
    const occupiedSeats = Math.min(parseGuests(reservation?.guests ?? '0'), 4);
    const tableClass = tone ? tone.table : NEUTRAL_SHAPE;
    const labelClass = tone ? tone.label : 'text-white/80';

    return (
        <button
            type="button"
            onClick={() => onSelectTable?.(displayId)}
            className="relative inline-flex items-center justify-center py-4 px-12 cursor-pointer transition hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#631732]/35 rounded-2xl"
            aria-label={reservation ? `Open table ${displayId} details for ${reservation.name}` : `Open table ${displayId} details`}
        >
            <div className={`relative z-10 ${tableClass} ${tableClassName}`}>
                <span className={`absolute inset-0 flex items-center justify-center font-semibold tracking-wide ${labelClass}`}>
                    {displayId}
                </span>
            </div>

            <div className={`absolute left-0 top-1/2 -translate-y-1/2 flex flex-col ${seatGapClassName}`}>
                <SeatSide occupied={occupiedSeats >= 1} toneSeatClass={tone?.seat} />
                <SeatSide occupied={occupiedSeats >= 2} toneSeatClass={tone?.seat} />
            </div>

            <div className={`absolute right-0 top-1/2 -translate-y-1/2 flex flex-col ${seatGapClassName}`}>
                <SeatSide occupied={occupiedSeats >= 3} toneSeatClass={tone?.seat} flip />
                <SeatSide occupied={occupiedSeats >= 4} toneSeatClass={tone?.seat} flip />
            </div>
        </button>
    );
}

function EndSeatTable({
    displayId,
    tableClassName,
    reservation,
    topSeats = 1,
    bottomSeats = 1,
    onSelectTable,
}: {
    displayId: DisplayTableId;
    tableClassName: string;
    reservation?: FloorReservation;
    topSeats?: number;
    bottomSeats?: number;
    onSelectTable?: (tableId: DisplayTableId) => void;
}) {
    const tone = reservation ? getTone(reservation.guests) : null;
    const totalSeats = topSeats + bottomSeats;
    const occupiedSeats = Math.min(parseGuests(reservation?.guests ?? '0'), totalSeats);
    const tableClass = tone ? tone.table : NEUTRAL_SHAPE;
    const labelClass = tone ? tone.label : 'text-white/80';

    return (
        <button
            type="button"
            onClick={() => onSelectTable?.(displayId)}
            className="relative inline-flex items-center justify-center py-14 px-4 cursor-pointer transition hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#631732]/35 rounded-2xl"
            aria-label={reservation ? `Open table ${displayId} details for ${reservation.name}` : `Open table ${displayId} details`}
        >
            <div className={`relative z-10 ${tableClass} ${tableClassName}`}>
                <span className={`absolute inset-0 flex items-center justify-center font-semibold tracking-wide ${labelClass}`}>
                    {displayId}
                </span>
            </div>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-end gap-5">
                {Array.from({ length: topSeats }).map((_, index) => (
                    <SeatTop key={`top-${index}`} occupied={occupiedSeats >= index + 1} toneSeatClass={tone?.seat} />
                ))}
            </div>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-start gap-5">
                {Array.from({ length: bottomSeats }).map((_, index) => {
                    const seatNumber = topSeats + index + 1;
                    return (
                        <SeatBottom
                            key={`bottom-${index}`}
                            occupied={occupiedSeats >= seatNumber}
                            toneSeatClass={tone?.seat}
                        />
                    );
                })}
            </div>
        </button>
    );
}

function TableOccupancyPopup({
    tableLabel,
    reservations,
    onClose,
}: {
    tableLabel: string | null;
    reservations: FloorReservation[];
    onClose: () => void;
}) {
    if (!tableLabel) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-black/35 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl p-5"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-2xl font-semibold text-slate-900">{tableLabel}</h3>
                        <p className="text-sm text-slate-500">
                            {reservations.length > 0 ? `${reservations.length} reservation(s)` : 'No reservation assigned'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100 inline-flex items-center justify-center"
                        aria-label="Close table popup"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {reservations.length > 0 ? (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                        {reservations.map((reservation) => (
                            <article key={reservation.id} className="rounded-2xl bg-slate-100 px-4 py-3">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-xl font-semibold text-slate-900">{reservation.name}</p>
                                    <span className="text-xs font-semibold text-slate-600">{reservation.guests}pl</span>
                                </div>
                                <p className="mt-1 text-sm text-slate-600">
                                    {reservation.date} · {formatReservationTimeRange(reservation.time, reservation.guests)}
                                </p>
                                {reservation.notes?.trim() && (
                                    <p className="mt-2 text-sm text-slate-700">{reservation.notes}</p>
                                )}
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl bg-slate-100 px-4 py-5">
                        <p className="text-slate-700">
                            This table is currently unassigned. Open the reservation menu and assign a booking.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ReservationAssignmentMenu({
    open,
    selectedDate,
    reservations,
    visualTables,
    savingReservationId,
    assignmentError,
    onToggleAssignment,
    onClose,
}: {
    open: boolean;
    selectedDate: string;
    reservations: FloorReservation[];
    visualTables: Map<DisplayTableId, VisualTable>;
    savingReservationId: string | null;
    assignmentError: string | null;
    onToggleAssignment: (reservation: FloorReservation, tableId: DisplayTableId) => void;
    onClose: () => void;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/35" onClick={onClose}>
            <aside
                className="absolute right-0 top-0 h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Reservation cards</h2>
                        <p className="text-sm text-slate-500">{selectedDate}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100 inline-flex items-center justify-center"
                        aria-label="Close reservation menu"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {assignmentError && (
                    <div className="mx-4 mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {assignmentError}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {reservations.length === 0 ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                            No reservations on this date.
                        </div>
                    ) : (
                        reservations.map((reservation) => {
                            const tone = getTone(reservation.guests);
                            const isSavingThisCard = savingReservationId === reservation.id;
                            return (
                                <article key={reservation.id} className={`rounded-xl border p-3 shadow-sm ${tone.card}`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-semibold truncate">{reservation.name}</p>
                                        <span className={`text-xs font-medium ${tone.cardMeta}`}>{reservation.guests}pl</span>
                                    </div>
                                    <p className={`mt-1 text-xs ${tone.cardMeta}`}>
                                        {reservation.date} · {formatReservationTimeRange(reservation.time, reservation.guests)}
                                    </p>

                                    <div className="mt-3 flex items-center gap-1 flex-wrap">
                                        {DISPLAY_TABLE_IDS.map((displayId) => {
                                            const table = visualTables.get(displayId);
                                            if (!table) return null;
                                            const active = reservationHasTable(reservation, table);
                                            return (
                                                <button
                                                    key={`${reservation.id}-${displayId}`}
                                                    type="button"
                                                    onClick={() => onToggleAssignment(reservation, displayId)}
                                                    disabled={isSavingThisCard}
                                                    className={`h-8 min-w-8 px-2 rounded-lg text-xs font-semibold border disabled:opacity-60 ${
                                                        active
                                                            ? tone.chipActive
                                                            : 'bg-white/80 text-slate-700 border-slate-300 hover:bg-white'
                                                    }`}
                                                >
                                                    {displayId}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>
            </aside>
        </div>
    );
}

export default function CrmFloorplanPage() {
    const searchParams = useSearchParams();
    const [reservations, setReservations] = useState<FloorReservation[]>([]);
    const [tables, setTables] = useState<FloorTable[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedTableId, setSelectedTableId] = useState<DisplayTableId | null>(null);
    const [savingReservationId, setSavingReservationId] = useState<string | null>(null);
    const [assignmentError, setAssignmentError] = useState<string | null>(null);

    const selectedDate = useMemo(() => {
        const candidate = searchParams.get('date');
        if (candidate && /^\d{4}-\d{2}-\d{2}$/.test(candidate)) return candidate;
        return new Date().toISOString().slice(0, 10);
    }, [searchParams]);

    const refetchData = useCallback(async () => {
        try {
            setLoadError(null);
            const [reservationsResponse, tablesResponse] = await Promise.all([
                fetch('/api/crm/reservations', { cache: 'no-store' }),
                fetch('/api/crm/tables', { cache: 'no-store' }),
            ]);

            const reservationsPayload = await reservationsResponse.json().catch(() => []);
            const tablesPayload = await tablesResponse.json().catch(() => []);

            if (!reservationsResponse.ok || !tablesResponse.ok) {
                setLoadError('Unable to load floor plan data right now.');
                return;
            }

            setReservations(Array.isArray(reservationsPayload) ? (reservationsPayload as FloorReservation[]) : []);
            setTables(Array.isArray(tablesPayload) ? (tablesPayload as FloorTable[]) : []);
        } catch {
            setLoadError('Unable to load floor plan data right now.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void refetchData();
    }, [refetchData]);

    useEffect(() => {
        const onFocus = () => void refetchData();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [refetchData]);

    const visualTables = useMemo(() => buildVisualTableMap(tables), [tables]);

    const dayReservations = useMemo(
        () =>
            reservations
                .filter((reservation) => reservation.date === selectedDate)
                .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)),
        [reservations, selectedDate]
    );

    const reservationsByDisplayTable = useMemo(() => {
        const map = new Map<DisplayTableId, FloorReservation[]>();
        DISPLAY_TABLE_IDS.forEach((displayId) => map.set(displayId, []));

        dayReservations.forEach((reservation) => {
            DISPLAY_TABLE_IDS.forEach((displayId) => {
                const table = visualTables.get(displayId);
                if (!table) return;
                if (reservationHasTable(reservation, table)) {
                    map.get(displayId)?.push(reservation);
                }
            });
        });

        return map;
    }, [dayReservations, visualTables]);

    const selectedTableLabel = selectedTableId ? (visualTables.get(selectedTableId)?.label ?? `Table ${selectedTableId}`) : null;
    const selectedTableReservations = selectedTableId ? (reservationsByDisplayTable.get(selectedTableId) ?? []) : [];

    async function toggleTableAssignment(reservation: FloorReservation, displayId: DisplayTableId) {
        const table = visualTables.get(displayId);
        if (!table) return;

        const isAssigned = reservationHasTable(reservation, table);
        const nextTableIds = isAssigned ? [] : [table.backendId];

        setSavingReservationId(reservation.id);
        setAssignmentError(null);

        try {
            const response = await fetch(`/api/crm/reservations/${reservation.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableIds: nextTableIds }),
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                setAssignmentError(typeof payload?.error === 'string' ? payload.error : 'Unable to update table assignment.');
                return;
            }

            setReservations((prev) =>
                prev.map((item) => (item.id === reservation.id ? (payload as FloorReservation) : item))
            );
        } catch {
            setAssignmentError('Something went wrong while updating table assignment.');
        } finally {
            setSavingReservationId(null);
        }
    }

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-slate-300 bg-[#ebebeb] p-6 sm:p-8 lg:p-10 min-h-[700px]">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-600">
                            Tables are numbered clockwise from top-left: <span className="font-semibold">1 → 6</span>
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            Date: {selectedDate} · {dayReservations.length} reservation{dayReservations.length === 1 ? '' : 's'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        className="shrink-0 h-10 px-4 rounded-xl bg-[#631732] text-white text-sm font-semibold hover:bg-[#55122b]"
                    >
                        {isMenuOpen ? 'Hide reservations' : 'Show reservations'}
                    </button>
                </div>

                {loadError && (
                    <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {loadError}
                    </div>
                )}

                {isLoading ? (
                    <div className="rounded-xl border border-slate-300 bg-white/70 px-4 py-6 text-sm text-slate-600">
                        Loading floor plan...
                    </div>
                ) : (
                    <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-20 lg:gap-y-24 place-items-center">
                        {FLOORPLAN_RENDER_ORDER.map((displayId) => {
                            const previewReservation = (reservationsByDisplayTable.get(displayId) ?? [])[0];
                            if (displayId === '2') {
                                return (
                                    <EndSeatTable
                                        key={displayId}
                                        displayId={displayId}
                                        tableClassName="w-[7.5rem] h-[7.5rem]"
                                        reservation={previewReservation}
                                        onSelectTable={setSelectedTableId}
                                    />
                                );
                            }
                            if (displayId === '3') {
                                return (
                                    <EndSeatTable
                                        key={displayId}
                                        displayId={displayId}
                                        tableClassName="w-[15rem] h-[9.5rem]"
                                        topSeats={2}
                                        bottomSeats={2}
                                        reservation={previewReservation}
                                        onSelectTable={setSelectedTableId}
                                    />
                                );
                            }
                            if (displayId === '6') {
                                return (
                                    <EndSeatTable
                                        key={displayId}
                                        displayId={displayId}
                                        tableClassName="w-[7rem] h-[7.5rem]"
                                        reservation={previewReservation}
                                        onSelectTable={setSelectedTableId}
                                    />
                                );
                            }
                            return (
                                <SideSeatTable
                                    key={displayId}
                                    displayId={displayId}
                                    tableClassName="w-40 h-64"
                                    reservation={previewReservation}
                                    onSelectTable={setSelectedTableId}
                                />
                            );
                        })}
                    </div>
                )}
            </section>

            <ReservationAssignmentMenu
                open={isMenuOpen}
                selectedDate={selectedDate}
                reservations={dayReservations}
                visualTables={visualTables}
                savingReservationId={savingReservationId}
                assignmentError={assignmentError}
                onToggleAssignment={toggleTableAssignment}
                onClose={() => setIsMenuOpen(false)}
            />

            <TableOccupancyPopup
                tableLabel={selectedTableLabel}
                reservations={selectedTableReservations}
                onClose={() => setSelectedTableId(null)}
            />
        </div>
    );
}
