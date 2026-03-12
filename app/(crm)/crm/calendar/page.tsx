'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AddBookingModal } from './_components/AddBookingModal';
import { CalendarHeader } from './_components/CalendarHeader';
import { DayColumn } from './_components/DayColumn';
import { ReservationDetailsDrawer } from './_components/ReservationDetailsDrawer';
import { TimeColumn } from './_components/TimeColumn';
import { DAY_COL_WIDTH } from './constants';
import type { Reservation, ReservationCreateInput, Table } from './types';
import { addDays, buildCalendarData, getHeaderDateLabel, getMonday } from './utils';

export default function CrmCalendarPage() {
    const searchParams = useSearchParams();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [selected, setSelected] = useState<Reservation | null>(null);
    const [addOpen, setAddOpen] = useState(false);

    const globalDate = (() => {
        const candidate = searchParams.get('date');
        if (candidate && /^\d{4}-\d{2}-\d{2}$/.test(candidate)) return candidate;
        return new Date().toISOString().slice(0, 10);
    })();
    const startDate = useMemo(() => getMonday(globalDate), [globalDate]);

    function refetchReservations() {
        fetch('/api/crm/reservations')
            .then((r) => r.json())
            .then((data) => setReservations(Array.isArray(data) ? data : []));
    }

    useEffect(() => {
        refetchReservations();
        fetch('/api/crm/tables')
            .then((r) => r.json())
            .then((data) => setTables(Array.isArray(data) ? data : []));
    }, []);

    useEffect(() => {
        const onFocus = () => refetchReservations();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, []);

    const displayDates = useMemo(
        () => Array.from({ length: 7 }, (_, i) => addDays(startDate, i)),
        [startDate]
    );

    const { reservationsByDate, hourRowHeights } = useMemo(
        () => buildCalendarData(reservations, displayDates),
        [reservations, displayDates]
    );

    const todayIso = new Date().toISOString().slice(0, 10);
    const headerDateLabel = useMemo(() => getHeaderDateLabel(startDate), [startDate]);

    async function addBooking(data: ReservationCreateInput) {
        const response = await fetch('/api/crm/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) return;

        const record = (await response.json()) as Reservation;
        setReservations((prev) => [...prev, record]);
        setAddOpen(false);
    }

    function handleReservationUpdated(updated: Reservation) {
        setReservations((prev) => prev.map((reservation) => (reservation.id === updated.id ? updated : reservation)));
        setSelected(updated);
    }

    function handleReservationCancelled(reservationId: string) {
        setReservations((prev) => prev.filter((reservation) => reservation.id !== reservationId));
        setSelected((prev) => (prev?.id === reservationId ? null : prev));
    }

    return (
        <div className="bg-gradient-to-br from-[#f3e8ff] via-[#fdf2ff] to-[#fee2e2] rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden flex flex-col max-h-[calc(100vh-5rem)] min-h-[560px]">
            <CalendarHeader
                headerDateLabel={headerDateLabel}
                onOpenAddBooking={() => setAddOpen(true)}
            />

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white">
                <div className="flex shrink-0 items-start" style={{ minWidth: 72 + displayDates.length * DAY_COL_WIDTH }}>
                    <TimeColumn hourRowHeights={hourRowHeights} />
                    {displayDates.map((date) => (
                        <DayColumn
                            key={date}
                            date={date}
                            dayReservations={reservationsByDate[date] ?? []}
                            isToday={date === todayIso}
                            hourRowHeights={hourRowHeights}
                            onSelectReservation={setSelected}
                        />
                    ))}
                </div>
            </div>

            {selected && (
                <ReservationDetailsDrawer
                    reservation={selected}
                    onClose={() => setSelected(null)}
                    onUpdated={handleReservationUpdated}
                    onCancelled={handleReservationCancelled}
                />
            )}

            {addOpen && (
                <AddBookingModal
                    date={globalDate}
                    tables={tables}
                    onClose={() => setAddOpen(false)}
                    onAdd={addBooking}
                />
            )}
        </div>
    );
}
