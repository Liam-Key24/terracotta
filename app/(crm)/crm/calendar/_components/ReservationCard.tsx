import type { DayReservation } from '../types';
import { formatTimeRange24hLabel, getReservationTone } from '../utils';
import { UsersIcon } from '@phosphor-icons/react';

type ReservationCardProps = {
    reservation: DayReservation;
    onClick: () => void;
};

export function ReservationCard({ reservation, onClick }: ReservationCardProps) {
    const tone = getReservationTone(reservation.guests);
    const label = formatTimeRange24hLabel(reservation.startMin, reservation.endMin);

    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full h-[72px] mb-2 last:mb-0 text-left rounded-xl px-3 py-2 shadow-sm shadow-slate-900/10 border text-sm sm:text-base flex flex-col justify-center gap-1 transition-shadow hover:shadow-md hover:shadow-slate-900/15 ${tone.container}`}
        >
            <span className="font-semibold truncate text-base sm:text-lg">{reservation.name}</span>
            <span className={`text-[14px] sm:text-base ${tone.meta} w-full inline-flex items-center`}>
                <span>{label}</span>
                <span className="ml-auto font-medium inline-flex items-center gap-1">
                    <UsersIcon size={15} />
                    {reservation.guests}
                </span>
            </span>
        </button>
    );
}
