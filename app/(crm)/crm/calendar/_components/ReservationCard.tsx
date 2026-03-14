import type { DayReservation } from '../types';
import { formatTimeRange24hLabel, getReservationTone } from '../utils';
import { UsersIcon } from '@phosphor-icons/react';

type ReservationCardProps = {
    reservation: DayReservation;
    onClick: () => void;
    compact?: boolean;
    isPast?: boolean;
};

export function ReservationCard({ reservation, onClick, compact = false, isPast = false }: ReservationCardProps) {
    const tone = isPast
        ? { container: 'bg-slate-100 border-slate-200 text-slate-600', meta: 'text-slate-500' }
        : getReservationTone(reservation.guests);
    const label = formatTimeRange24hLabel(reservation.startMin, reservation.endMin);

    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full mb-1.5 last:mb-0 text-left rounded-lg shadow-sm shadow-slate-900/10 border flex flex-col justify-center transition-shadow hover:shadow-md hover:shadow-slate-900/15 ${tone.container} ${
                compact
                    ? 'h-[52px] px-2 py-1.5 gap-0.5 mb-1 last:mb-0'
                    : 'h-[72px] sm:mb-2 sm:last:mb-0 rounded-xl px-3 py-2 gap-1'
            }`}
        >
            <span className={`font-semibold truncate ${compact ? 'text-xs' : 'text-base sm:text-lg'}`}>
                {reservation.name}
            </span>
            <span className={`${tone.meta} w-full inline-flex items-center ${compact ? 'text-[11px]' : 'text-[14px] sm:text-base'}`}>
                <span>{label}</span>
                <span className={`ml-auto font-medium inline-flex items-center gap-0.5 ${compact ? 'gap-0.5' : 'gap-1'}`}>
                    <UsersIcon size={compact ? 12 : 15} aria-hidden />
                    {reservation.guests}
                </span>
            </span>
        </button>
    );
}
