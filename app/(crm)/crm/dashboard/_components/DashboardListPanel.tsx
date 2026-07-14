import { CalendarCheckIcon, QueueIcon, SealPercentIcon, TrashIcon, UsersIcon } from '@phosphor-icons/react/dist/ssr';

import type { QueueEntry, Reservation } from '../types';
import { formatTableLabels } from '../utils';

type DashboardListPanelProps = {
    activeListTab: 'queue' | 'deleted' | 'reservations';
    selectedDateLabel: string;
    isLoading: boolean;
    queue: QueueEntry[];
    deletedQueueEntries: QueueEntry[];
    dayReservations: Reservation[];
    onChangeTab: (tab: 'queue' | 'deleted' | 'reservations') => void;
    onOpenQueueEntry: (entry: QueueEntry) => void;
    onCancelQueueEntry: (queueId: string) => void;
    onOpenReservationEntry: (reservation: Reservation) => void;
};

export function DashboardListPanel({
    activeListTab,
    selectedDateLabel,
    isLoading,
    queue,
    deletedQueueEntries,
    dayReservations,
    onChangeTab,
    onOpenQueueEntry,
    onCancelQueueEntry,
    onOpenReservationEntry,
}: DashboardListPanelProps) {
    return (
        <section className="xl:col-span-2 bg-white rounded-2xl border border-[#631732]/20 shadow-sm p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="inline-flex rounded-xl border border-[#631732]/20 bg-slate-50 p-1">
                    <button
                        type="button"
                        onClick={() => onChangeTab('queue')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${activeListTab === 'queue' ? 'bg-[#631732] text-white' : 'text-slate-700 hover:bg-white'
                            }`}
                    >
                        <span className="inline-flex items-center gap-1.5">
                            <QueueIcon size={14} weight="fill" />
                            Queue
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onChangeTab('reservations')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${activeListTab === 'reservations'
                            ? 'bg-[#631732] text-white'
                            : 'text-slate-700 hover:bg-white'
                            }`}
                    >
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarCheckIcon size={14} weight="fill" />
                            Reservations of day
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onChangeTab('deleted')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${activeListTab === 'deleted' ? 'bg-[#631732] text-white' : 'text-slate-700 hover:bg-white'
                            }`}
                    >
                        <span className="inline-flex items-center gap-1.5">
                            <TrashIcon size={14} weight="fill" />
                            Deleted
                        </span>
                    </button>
                </div>
                <span className="text-sm text-slate-500">{selectedDateLabel}</span>
            </div>

            {isLoading ? (
                <p className="text-slate-500">Loading...</p>
            ) : activeListTab === 'queue' ? (
                queue.length === 0 ? (
                    <p className="text-slate-500">No pending requests.</p>
                ) : (
                    <ul className="space-y-2">
                        {queue.map((entry) => (
                            <li key={entry.id}>
                                <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 transition-colors hover:border-[#631732]/30 hover:bg-slate-50">
                                    <button
                                        type="button"
                                        onClick={() => onOpenQueueEntry(entry)}
                                        className="min-w-0 text-left"
                                    >
                                        <p className="font-semibold text-slate-800 truncate">{entry.name}</p>
                                        <p className="text-sm text-slate-600 inline-flex items-center gap-1.5">
                                            <UsersIcon size={14} />
                                            <span>{entry.guests} guests</span>
                                        </p>
                                    </button>
                                    <p className="text-base font-semibold text-slate-700 whitespace-nowrap text-center">
                                        {entry.date} · {entry.time}
                                    </p>
                                    <button
                                        type="button"
                                        aria-label={`Cancel ${entry.name}`}
                                        onClick={() => onCancelQueueEntry(entry.id)}
                                        className="h-6 w-6 rounded-full text-sm leading-none text-slate-500 hover:bg-red-50 hover:text-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )
            ) : activeListTab === 'deleted' ? (
                deletedQueueEntries.length === 0 ? (
                    <p className="text-slate-500">No deleted bookings.</p>
                ) : (
                    <ul className="space-y-2">
                        {deletedQueueEntries.map((entry) => (
                            <li key={entry.id}>
                                <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-800 truncate">{entry.name}</p>
                                        <p className="text-sm text-slate-600 inline-flex items-center gap-1.5">
                                            <UsersIcon size={14} />
                                            <span>{entry.guests} guests</span>
                                        </p>
                                    </div>
                                    <p className="text-base font-semibold text-slate-700 whitespace-nowrap text-center">
                                        {entry.date} · {entry.time}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )
            ) : dayReservations.length === 0 ? (
                <p className="text-slate-500">No reservations for this date.</p>
            ) : (
                <ul className="space-y-2">
                    {dayReservations.map((reservation) => (
                        <li key={reservation.id}>
                            <button
                                type="button"
                                onClick={() => onOpenReservationEntry(reservation)}
                                className={`relative w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                                    reservation.promoCode
                                        ? 'border-amber-400 ring-2 ring-amber-300 bg-gradient-to-br from-amber-50 via-rose-50 to-[#631732]/10 hover:border-amber-500'
                                        : 'border-slate-200 bg-slate-50 hover:border-[#631732]/30 hover:bg-white'
                                }`}
                            >
                                {reservation.promoCode && (
                                    <span
                                        className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-white shadow ring-2 ring-white"
                                        title={`Promo applied: ${reservation.promoCode}`}
                                    >
                                        <SealPercentIcon size={12} weight="fill" />
                                    </span>
                                )}
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-semibold text-slate-800 truncate">{reservation.name}</p>
                                    <p className="text-xs text-slate-500 whitespace-nowrap">{reservation.time}</p>
                                </div>
                                <p className="text-sm text-slate-600 mt-0.5 inline-flex items-center gap-1.5">
                                    <UsersIcon size={14} />
                                    <span>
                                        {reservation.guests} guests
                                        {reservation.tableIds?.length ? ` · ${formatTableLabels(reservation.tableIds)}` : ''}
                                    </span>
                                </p>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
