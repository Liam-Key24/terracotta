import { useMemo } from 'react';
import { DAY_COL_WIDTH, HEADER_HEIGHT, TIME_COLUMN_HOURS } from '../constants';
import type { DayReservation, Reservation } from '../types';
import { ReservationCard } from './ReservationCard';

type DayColumnProps = {
    date: string;
    dayReservations: DayReservation[];
    isToday: boolean;
    hourRowHeights: Record<number, number>;
    onSelectReservation: (reservation: Reservation | null) => void;
};

export function DayColumn({
    date,
    dayReservations,
    isToday,
    hourRowHeights,
    onSelectReservation,
}: DayColumnProps) {
    const dayLabel = (() => {
        const d = new Date(date + 'T00:00:00');
        return {
            weekday: d.toLocaleDateString('en-GB', { weekday: 'short' }),
            day: d.toLocaleDateString('en-GB', { day: '2-digit' }),
            month: d.toLocaleDateString('en-GB', { month: 'short' }),
        };
    })();

    const reservationsByHour = useMemo(() => {
        const byHour: Record<number, DayReservation[]> = {};
        TIME_COLUMN_HOURS.forEach((hour) => {
            byHour[hour] = [];
        });

        dayReservations.forEach((reservation) => {
            const hour = Math.floor(reservation.startMin / 60);
            if (byHour[hour]) {
                byHour[hour].push(reservation);
            }
        });

        Object.values(byHour).forEach((list) => {
            list.sort((a, b) => a.startMin - b.startMin);
        });

        return byHour;
    }, [dayReservations]);

    return (
        <div
            className="shrink-0 border-r border-slate-200 last:border-r-0 flex flex-col box-border"
            style={{ width: DAY_COL_WIDTH }}
        >
            <div
                className="sticky top-0 z-20 border-b border-slate-200 flex items-center justify-center shrink-0 bg-white box-border overflow-hidden px-2"
                style={{ height: HEADER_HEIGHT, minHeight: HEADER_HEIGHT, maxHeight: HEADER_HEIGHT }}
            >
                <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                    <div
                        className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium ${
                            isToday ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-50 text-slate-700'
                        }`}
                    >
                        <span className="uppercase tracking-wide text-[10px] opacity-80 leading-none">
                            {dayLabel.weekday}
                        </span>
                        <span className="text-base leading-none">{dayLabel.day}</span>
                        <span className="text-[11px] font-normal opacity-80 leading-none">
                            {dayLabel.month}
                        </span>
                    </div>
                    <span className={`text-[10px] font-medium ${isToday ? 'text-indigo-600' : 'text-slate-500'}`}>
                        {dayReservations.length} booking{dayReservations.length === 1 ? '' : 's'}
                    </span>
                </div>
            </div>

            <div className="bg-white shrink-0 box-border border-t border-slate-200">
                {TIME_COLUMN_HOURS.map((hour) => (
                    <div
                        key={hour}
                        className="border-b border-slate-100"
                        style={{ height: hourRowHeights[hour], minHeight: hourRowHeights[hour] }}
                    >
                        {(reservationsByHour[hour] ?? []).map((reservation) => (
                            <ReservationCard
                                key={reservation.id}
                                reservation={reservation}
                                onClick={() => onSelectReservation(reservation)}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
