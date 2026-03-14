import {
    CalendarBlankIcon,
    ListBulletsIcon,
    UsersIcon,
    XIcon,
} from '@phosphor-icons/react/dist/ssr';

import type { DisplayTableId, FloorReservation, VisualTable } from '../types';
import { DISPLAY_TABLE_IDS } from '../types';
import { formatDateShort, formatReservationTimeRange, getTone, reservationHasTable } from '../utils';

type ReservationAssignmentMenuProps = {
    open: boolean;
    reservations: FloorReservation[];
    visualTables: Map<DisplayTableId, VisualTable>;
    savingReservationId: string | null;
    assignmentError: string | null;
    onToggleAssignment: (reservation: FloorReservation, tableId: DisplayTableId) => void | Promise<void>;
    onClose: () => void;
};

export function ReservationAssignmentMenu({
    open,
    reservations,
    visualTables,
    savingReservationId,
    assignmentError,
    onToggleAssignment,
    onClose,
}: ReservationAssignmentMenuProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/35" onClick={onClose}>
            <aside
                className="absolute right-0 top-0 h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col max-md:top-auto max-md:bottom-0 max-md:h-[72dvh] max-md:max-w-none max-md:border-l-0 max-md:border-t"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 inline-flex items-center gap-1.5">
                            <ListBulletsIcon size={16} className="text-[#631732]" />
                            Reservation cards
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100 inline-flex items-center justify-center"
                        aria-label="Close reservation menu"
                    >
                        <XIcon size={16} />
                    </button>
                </div>

                {assignmentError && (
                    <div className="mx-4 mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {assignmentError}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {reservations.length === 0 ? (
                        <div className="w-full min-h-[140px] rounded-2xl border border-slate-200 bg-slate-50 px-5 py-8 text-base text-slate-600 flex items-center justify-center gap-2 text-center">
                            <CalendarBlankIcon size={18} />
                            <span>No reservations on this date.</span>
                        </div>
                    ) : (
                        reservations.map((reservation) => {
                            const tone = getTone(reservation.guests);
                            const isSavingThisCard = savingReservationId === reservation.id;
                            return (
                                <article key={reservation.id} className={`rounded-xl border p-4 shadow-sm ${tone.card}`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-xl font-semibold truncate leading-tight">{reservation.name}</p>
                                        <span className={`text-base font-semibold ${tone.cardMeta} inline-flex items-center gap-1.5`}>
                                            <UsersIcon size={18} />
                                            {reservation.guests}
                                        </span>
                                    </div>
                                    <div className={`mt-2 text-sm ${tone.cardMeta} flex flex-col items-start gap-0.5`}>
                                        <span>{formatDateShort(reservation.date)}</span>
                                        <span>{formatReservationTimeRange(reservation.time, reservation.guests)}</span>
                                    </div>

                                    <p className={`mt-3 text-[11px] uppercase tracking-wide font-semibold ${tone.cardMeta}/80`}>
                                        Tables
                                    </p>
                                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                                        {DISPLAY_TABLE_IDS.map((displayId) => {
                                            const table = visualTables.get(displayId);
                                            if (!table) return null;

                                            const active = reservationHasTable(reservation, table);
                                            return (
                                                <button
                                                    key={`${reservation.id}-${displayId}`}
                                                    type="button"
                                                    onClick={() => onToggleAssignment(reservation, displayId)}
                                                    disabled={isSavingThisCard}
                                                    className={`h-9 min-w-9 px-2.5 rounded-lg text-sm font-semibold border disabled:opacity-60 ${active
                                                        ? tone.chipActive
                                                        : 'bg-white/80 text-slate-700 border-slate-300 hover:bg-white'
                                                        }`}
                                                >
                                                    {displayId}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>
            </aside>
        </div>
    );
}
