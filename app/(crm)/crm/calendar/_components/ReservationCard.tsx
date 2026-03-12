import type { DayReservation } from '../types';
import { formatTimeRangeLabel, getReservationTone } from '../utils';

type ReservationCardProps = {
    reservation: DayReservation;
    onClick: () => void;
};

export function ReservationCard({ reservation, onClick }: ReservationCardProps) {
    const tone = getReservationTone(reservation.guests);
    const label = formatTimeRangeLabel(reservation.startMin, reservation.endMin);

    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full h-[72px] mb-2 last:mb-0 text-left rounded-lg px-3 py-2 shadow-sm border text-xs sm:text-sm flex flex-col justify-center gap-0.5 ${tone.container}`}
        >
            <span className="font-semibold truncate">{reservation.name}</span>
            <span className={`text-[11px] sm:text-xs truncate ${tone.meta}`}>
                {label} · {reservation.guests}pl
                {reservation.tableIds?.length ? ` · T${reservation.tableIds.join(',')}` : ''}
            </span>
        </button>
    );
}
