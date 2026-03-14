import { UsersIcon, XIcon } from '@phosphor-icons/react/dist/ssr';

import type { FloorReservation } from '../types';
import { formatTimeLabelFromMinutes, parseTimeToMinutes } from '../utils';

type TableOccupancyPopupProps = {
    tableLabel: string | null;
    reservations: FloorReservation[];
    onClose: () => void;
};

export function TableOccupancyPopup({ tableLabel, reservations, onClose }: TableOccupancyPopupProps) {
    if (!tableLabel) return null;

    const primaryReservation = reservations[0] ?? null;
    const tableNumber = tableLabel.match(/(\d+)/)?.[1] ?? tableLabel;
    const bookingTimeLabel = primaryReservation
        ? formatTimeLabelFromMinutes(parseTimeToMinutes(primaryReservation.time))
        : '--';

    return (
        <div className="fixed inset-0 z-[110] bg-black/35 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl p-6 max-md:max-h-[85dvh] max-md:overflow-y-auto"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-3xl font-semibold text-slate-900">Table {tableNumber}</h3>
                        {reservations.length > 1 && (
                            <p className="mt-1 text-sm text-slate-500">
                                +{reservations.length - 1} more reservation{reservations.length - 1 === 1 ? '' : 's'} on
                                this table
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 w-10 rounded-xl text-slate-500 hover:bg-slate-100 inline-flex items-center justify-center"
                        aria-label="Close table popup"
                    >
                        <XIcon size={18} />
                    </button>
                </div>

                {primaryReservation ? (
                    <div className="rounded-2xl bg-slate-100 px-5 py-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-4xl leading-tight font-semibold text-slate-900 truncate">
                                    {primaryReservation.name}
                                </p>
                                <p className="mt-1 text-xl text-slate-600">{bookingTimeLabel}</p>
                            </div>
                            <p className="text-3xl leading-tight font-semibold text-slate-900 inline-flex items-center gap-1.5 shrink-0">
                                <UsersIcon size={20} weight="fill" />
                                {primaryReservation.guests}
                            </p>
                        </div>

                        <div className="mt-3 border-t border-slate-300/70 pt-3">
                            <p className="text-sm text-slate-500">Notes</p>
                            <p className="text-2xl leading-tight font-medium text-slate-900">
                                {primaryReservation.notes?.trim() || 'No notes'}
                            </p>
                        </div>
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
