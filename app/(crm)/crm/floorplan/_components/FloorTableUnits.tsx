import { NEUTRAL_SHAPE } from '../constants';
import type { DisplayTableId, FloorReservation } from '../types';
import { getTone, parseGuests } from '../utils';
import { SeatBottom, SeatSide, SeatTop } from './SeatShapes';

type TableUnitProps = {
    displayId: DisplayTableId;
    tableClassName: string;
    reservation?: FloorReservation;
    onSelectTable?: (displayId: DisplayTableId) => void;
};

type SideSeatTableProps = TableUnitProps & {
    seatGapClassName?: string;
};

export function SideSeatTable({
    displayId,
    tableClassName,
    reservation,
    seatGapClassName = 'gap-6 lg:gap-9',
    onSelectTable,
}: SideSeatTableProps) {
    const tone = reservation ? getTone(reservation.guests) : null;
    const occupiedSeats = Math.min(parseGuests(reservation?.guests ?? '0'), 4);
    const tableClass = tone ? tone.table : NEUTRAL_SHAPE;
    const labelClass = tone ? tone.label : 'text-white/80';
    return (
        <button
            type="button"
            onClick={() => onSelectTable?.(displayId)}
            className="relative inline-flex items-center justify-center py-4 px-10 lg:py-6 lg:px-14 cursor-pointer transition hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#631732]/35 rounded-2xl"
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

type EndSeatTableProps = TableUnitProps & {
    topSeats?: number;
    bottomSeats?: number;
};

export function EndSeatTable({
    displayId,
    tableClassName,
    topSeats = 1,
    bottomSeats = 1,
    reservation,
    onSelectTable,
}: EndSeatTableProps) {
    const tone = reservation ? getTone(reservation.guests) : null;
    const totalSeats = topSeats + bottomSeats;
    const occupiedSeats = Math.min(parseGuests(reservation?.guests ?? '0'), totalSeats);
    const tableClass = tone ? tone.table : NEUTRAL_SHAPE;
    const labelClass = tone ? tone.label : 'text-white/80';

    return (
        <button
            type="button"
            onClick={() => onSelectTable?.(displayId)}
            className="relative inline-flex items-center justify-center py-12 px-4 lg:py-20 lg:px-6 cursor-pointer transition hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#631732]/35 rounded-2xl"
            aria-label={reservation ? `Open table ${displayId} details for ${reservation.name}` : `Open table ${displayId} details`}
        >
            <div className={`relative z-10 ${tableClass} ${tableClassName}`}>
                <span className={`absolute inset-0 flex items-center justify-center font-semibold tracking-wide ${labelClass}`}>
                    {displayId}
                </span>
            </div>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-end gap-2.5 lg:gap-4">
                {Array.from({ length: topSeats }).map((_, index) => (
                    <SeatTop key={`top-${index}`} occupied={occupiedSeats >= index + 1} toneSeatClass={tone?.seat} />
                ))}
            </div>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-start gap-2.5 lg:gap-4">
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
