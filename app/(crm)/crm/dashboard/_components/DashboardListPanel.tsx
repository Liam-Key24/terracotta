import { CalendarCheckIcon, QueueIcon, UsersIcon } from '@phosphor-icons/react/dist/ssr';

import type { QueueEntry, Reservation } from '../types';
import { formatTableLabels } from '../utils';

type DashboardListPanelProps = {
    activeListTab: 'queue' | 'reservations';
    selectedDateLabel: string;
    isLoading: boolean;
    queue: QueueEntry[];
    dayReservations: Reservation[];
    onChangeTab: (tab: 'queue' | 'reservations') => void;
    onOpenQueueEntry: (entry: QueueEntry) => void;
    onOpenReservationEntry: (reservation: Reservation) => void;
};

export function DashboardListPanel({
    activeListTab,
    selectedDateLabel,
    isLoading,
    queue,
    dayReservations,
    onChangeTab,
    onOpenQueueEntry,
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
                                <button
                                    type="button"
                                    onClick={() => onOpenQueueEntry(entry)}
                                    className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-[#631732]/30 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-semibold text-slate-800 truncate">{entry.name}</p>
                                        <p className="text-xs text-slate-500 whitespace-nowrap">
                                            {entry.date} · {entry.time}
                                        </p>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-0.5 inline-flex items-center gap-1.5">
                                        <UsersIcon size={14} />
                                        <span>
                                            {entry.guests} guests
                                            {entry.notes?.trim() ? ` · ${entry.notes.trim()}` : ''}
                                        </span>
                                    </p>
                                </button>
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
                                className="w-full text-left rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:border-[#631732]/30 hover:bg-white transition-colors"
                            >
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
