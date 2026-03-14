import { useMemo, useState, useEffect } from 'react';
import { DAY_COL_WIDTH, HEADER_HEIGHT, TIME_COLUMN_HOURS } from '../constants';
import type { DayReservation, Reservation } from '../types';
import { ReservationCard } from './ReservationCard';

function getNowMinutes(): number {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
}

type DayColumnProps = {
    date: string;
    dayReservations: DayReservation[];
    isToday: boolean;
    todayIso: string;
    hourRowHeights: Record<number, number>;
    onSelectReservation: (reservation: Reservation | null) => void;
    dayColWidth?: number;
    headerHeight?: number;
    compact?: boolean;
};

export function DayColumn({
    date,
    dayReservations,
    isToday,
    todayIso,
    hourRowHeights,
    onSelectReservation,
    dayColWidth = DAY_COL_WIDTH,
    headerHeight = HEADER_HEIGHT,
    compact = false,
}: DayColumnProps) {
    const dayLabel = (() => {
        const d = new Date(date + 'T00:00:00');
        return {
            weekday: d.toLocaleDateString('en-GB', { weekday: 'short' }),
            day: d.toLocaleDateString('en-GB', { day: '2-digit' }),
            month: d.toLocaleDateString('en-GB', { month: 'short' }),
        };
    })();

    const [nowMinutes, setNowMinutes] = useState(getNowMinutes);
    useEffect(() => {
        if (!isToday) return;
        const t = setInterval(() => setNowMinutes(getNowMinutes()), 60 * 1000);
        return () => clearInterval(t);
    }, [isToday]);

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
            style={{ width: dayColWidth }}
        >
            <div
                className="sticky top-0 z-20 border-b border-slate-200 flex items-center justify-center shrink-0 bg-white box-border overflow-hidden px-1.5"
                style={{ height: headerHeight, minHeight: headerHeight, maxHeight: headerHeight }}
            >
                <div className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1.5 py-0.5 sm:py-1 ${compact ? 'gap-0.5' : ''}`}>
                    <div
                        className={`inline-flex items-center justify-center rounded-lg sm:rounded-xl px-2 py-1 sm:px-3.5 sm:py-1.5 font-medium border backdrop-blur-md ${
                            compact
                                ? 'gap-0.5 text-[10px]'
                                : 'gap-1.5 text-xs'
                        } ${
                            isToday
                                ? 'bg-[#631732]/80 text-white border-white/35 shadow-md shadow-[#631732]/25'
                                : 'bg-[#631732]/15 text-[#631732] border-[#631732]/25 shadow-sm shadow-[#631732]/10'
                        }`}
                    >
                        <span className={`uppercase tracking-wide opacity-80 leading-none ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
                            {dayLabel.weekday}
                        </span>
                        <span className={compact ? 'text-xs leading-none' : 'text-base leading-none'}>{dayLabel.day}</span>
                        <span className={`font-normal opacity-80 leading-none ${compact ? 'text-[9px]' : 'text-[11px]'}`}>
                            {dayLabel.month}
                        </span>
                    </div>
                    <span className={`font-medium ${compact ? 'text-[9px]' : 'text-[10px]'} ${isToday ? 'text-[#631732]' : 'text-[#631732]/80'}`}>
                        {dayReservations.length} booking{dayReservations.length === 1 ? '' : 's'}
                    </span>
                </div>
            </div>

            <div className="bg-white shrink-0 box-border border-t border-slate-200">
                {TIME_COLUMN_HOURS.map((hour) => (
                    <div
                        key={hour}
                        className={`border-b border-slate-100 ${compact ? 'px-1 py-1' : 'px-2 py-2'}`}
                        style={{ height: hourRowHeights[hour], minHeight: hourRowHeights[hour] }}
                    >
                        {(reservationsByHour[hour] ?? []).map((reservation) => (
                            <ReservationCard
                                key={reservation.id}
                                reservation={reservation}
                                onClick={() => onSelectReservation(reservation)}
                                compact={compact}
                                isPast={date < todayIso || (isToday && nowMinutes >= reservation.endMin)}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
