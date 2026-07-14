import type { DayReservation } from '../types';
import { formatTimeRange24hLabel, getReservationTone } from '../utils';
import { SealPercentIcon, UsersIcon } from '@phosphor-icons/react';

type ReservationCardProps = {
    reservation: DayReservation;
    onClick: () => void;
    compact?: boolean;
    isPast?: boolean;
};

export function ReservationCard({ reservation, onClick, compact = false, isPast = false }: ReservationCardProps) {
    const hasPromo = Boolean(reservation.promoCode) && !isPast;
    const tone = isPast
        ? { container: 'bg-slate-100 border-slate-200 text-slate-600', meta: 'text-slate-500' }
        : hasPromo
        ? {
              container:
                  'bg-gradient-to-br from-amber-50 via-rose-50 to-[#631732]/10 border-amber-400 text-[#631732] ring-2 ring-amber-300',
              meta: 'text-amber-700',
          }
        : getReservationTone(reservation.guests);
    const label = formatTimeRange24hLabel(reservation.startMin, reservation.endMin);

    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative w-full mb-1.5 last:mb-0 text-left rounded-lg shadow-sm shadow-slate-900/10 border flex flex-col justify-center transition-shadow hover:shadow-md hover:shadow-slate-900/15 ${tone.container} ${
                compact
                    ? 'h-[52px] px-2 py-1.5 gap-0.5 mb-1 last:mb-0'
                    : 'h-[72px] sm:mb-2 sm:last:mb-0 rounded-xl px-3 py-2 gap-1'
            }`}
        >
            {hasPromo && (
                <span
                    className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-white shadow ring-2 ring-white"
                    title={`Promo applied: ${reservation.promoCode}`}
                >
                    <SealPercentIcon size={12} weight="fill" />
                </span>
            )}
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
