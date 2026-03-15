'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getIsoDateOrFallback } from '../_shared/date';
import { AddBookingModal } from './_components/AddBookingModal';
import { CalendarHeader } from './_components/CalendarHeader';
import { DayColumn } from './_components/DayColumn';
import { ReservationDetailsDrawer } from './_components/ReservationDetailsDrawer';
import { TimeColumn } from './_components/TimeColumn';
import { DAY_COL_WIDTH, HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from './constants';
import type { Reservation, ReservationCreateInput, Table } from './types';
import { addDays, buildCalendarData, getHeaderDateLabel, getMonday, getNowLineOffset } from './utils';

const TIME_COL_WIDTH_MOBILE = 52;
const TIME_COL_WIDTH_DESKTOP = 80;
const DAY_COL_WIDTH_MOBILE = 172;

export function CalendarContent() {
    const searchParams = useSearchParams();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [selected, setSelected] = useState<Reservation | null>(null);
    const [addOpen, setAddOpen] = useState(false);

    const globalDate = getIsoDateOrFallback(searchParams.get('date'), new Date().toISOString().slice(0, 10));
    const startDate = useMemo(() => getMonday(globalDate), [globalDate]);

    const [isDesktop, setIsDesktop] = useState(false);
    useEffect(() => {
        const m = window.matchMedia('(min-width: 1024px)');
        setIsDesktop(m.matches);
        const listener = () => setIsDesktop(m.matches);
        m.addEventListener('change', listener);
        return () => m.removeEventListener('change', listener);
    }, []);

    const timeColWidth = isDesktop ? TIME_COL_WIDTH_DESKTOP : TIME_COL_WIDTH_MOBILE;
    const dayColWidth = isDesktop ? DAY_COL_WIDTH : DAY_COL_WIDTH_MOBILE;

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
        () => buildCalendarData(reservations, displayDates, !isDesktop),
        [reservations, displayDates, isDesktop]
    );

    const headerHeight = isDesktop ? HEADER_HEIGHT : HEADER_HEIGHT_MOBILE;

    const todayIso = new Date().toISOString().slice(0, 10);
    const headerDateLabel = useMemo(() => getHeaderDateLabel(startDate), [startDate]);
    const showNowLine = displayDates.includes(todayIso);
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        if (!showNowLine) return;
        const t = setInterval(() => setNow(new Date()), 60 * 1000);
        return () => clearInterval(t);
    }, [showNowLine]);

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

    const calendarMinWidth = timeColWidth + displayDates.length * dayColWidth;

    return (
        <div className="bg-gradient-to-br from-[#f3e8ff] via-[#fdf2ff] to-[#fee2e2] rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden flex flex-col max-h-[calc(100vh-5rem)] min-h-[460px] sm:min-h-[560px]">
            <CalendarHeader
                headerDateLabel={headerDateLabel}
                onOpenAddBooking={() => setAddOpen(true)}
            />

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto bg-white relative">
                <div className="relative flex shrink-0 items-start" style={{ minWidth: calendarMinWidth }}>
                    <TimeColumn hourRowHeights={hourRowHeights} width={timeColWidth} headerHeight={headerHeight} />
                    {displayDates.map((date) => (
                        <DayColumn
                            key={date}
                            date={date}
                            dayReservations={reservationsByDate[date] ?? []}
                            isToday={date === todayIso}
                            todayIso={todayIso}
                            hourRowHeights={hourRowHeights}
                            onSelectReservation={setSelected}
                            dayColWidth={dayColWidth}
                            headerHeight={headerHeight}
                            compact={!isDesktop}
                        />
                    ))}
                    {showNowLine && (
                        <div
                            className="absolute z-20 h-0.5 bg-red-500 pointer-events-none"
                            style={{
                                left: timeColWidth,
                                width: dayColWidth * displayDates.length,
                                top: headerHeight + getNowLineOffset(now, hourRowHeights),
                            }}
                            aria-hidden
                        />
                    )}
                </div>
            </div>

            {selected && (
                <ReservationDetailsDrawer
                    reservation={selected}
                    tables={tables}
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
