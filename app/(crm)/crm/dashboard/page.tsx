'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type Reservation = {
    id: string;
    number: number;
    date: string;
    time: string;
    name: string;
    email: string;
    phone: string;
    guests: string;
    notes?: string;
    tableIds?: string[];
};

type QueueEntry = {
    id: string;
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    guests: string;
    notes?: string;
    addedAt: string;
};

type Table = {
    id: string;
    label: string;
    maxGuests: number;
};

type QueueAction = 'approve' | 'reject' | 'suggest' | null;

function toLocalIso(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatLongDate(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function parseTimeToMinutes(time: string): number {
    const raw = time.trim().toLowerCase();
    const full = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (full) {
        const hour = Number(full[1] ?? 0);
        const min = Number(full[2] ?? 0);
        return hour * 60 + min;
    }
    const ampm = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
    if (ampm) {
        let hour = Number(ampm[1] ?? 0);
        const min = Number(ampm[2] ?? 0);
        if (ampm[3] === 'pm' && hour < 12) hour += 12;
        if (ampm[3] === 'am' && hour === 12) hour = 0;
        return hour * 60 + min;
    }
    return 0;
}

function DayMetricCard({
    title,
    value,
    subtitle,
}: {
    title: string;
    value: string;
    subtitle: string;
}) {
    return (
        <div className="p-5">
            <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-medium text-slate-700">{title}</p>
                <span className="w-9 h-9 rounded-full inline-flex items-center justify-center bg-[#631732]/10 text-[#631732]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                </span>
            </div>
            <p className="mt-2 text-[40px] leading-none font-semibold tracking-tight text-slate-900">{value}</p>
            <p className="mt-2 text-base font-medium text-[#631732]/75">{subtitle}</p>
        </div>
    );
}

export default function CrmDashboardPage() {
    const searchParams = useSearchParams();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [queue, setQueue] = useState<QueueEntry[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [activeListTab, setActiveListTab] = useState<'queue' | 'reservations'>('queue');
    const [notesView, setNotesView] = useState<'notes' | 'reservation'>('notes');

    const [drawerEntry, setDrawerEntry] = useState<QueueEntry | null>(null);
    const [suggestMode, setSuggestMode] = useState(false);
    const [suggestDate, setSuggestDate] = useState('');
    const [suggestTime, setSuggestTime] = useState('');
    const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
    const [actionLoading, setActionLoading] = useState<QueueAction>(null);
    const [actionError, setActionError] = useState('');

    const selectedDate = (() => {
        const candidate = searchParams.get('date');
        if (candidate && /^\d{4}-\d{2}-\d{2}$/.test(candidate)) return candidate;
        return toLocalIso(new Date());
    })();

    async function refreshData() {
        setLoadError(null);
        try {
            const [reservationsResp, queueResp, tablesResp] = await Promise.all([
                fetch('/api/crm/reservations'),
                fetch('/api/crm/queue'),
                fetch('/api/crm/tables'),
            ]);

            const [reservationsData, queueData, tablesData] = await Promise.all([
                reservationsResp.json().catch(() => []),
                queueResp.json().catch(() => []),
                tablesResp.json().catch(() => []),
            ]);

            setReservations(Array.isArray(reservationsData) ? (reservationsData as Reservation[]) : []);
            setQueue(Array.isArray(queueData) ? (queueData as QueueEntry[]) : []);
            setTables(Array.isArray(tablesData) ? (tablesData as Table[]) : []);
        } catch {
            setLoadError('Unable to load dashboard data right now.');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void refreshData();
    }, []);

    const dayReservations = useMemo(
        () =>
            reservations
                .filter((reservation) => reservation.date === selectedDate)
                .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)),
        [reservations, selectedDate]
    );

    const dayNotes = useMemo(
        () =>
            dayReservations
                .filter((reservation) => reservation.notes?.trim())
                .map((reservation) => ({
                    id: reservation.id,
                    name: reservation.name,
                    time: reservation.time,
                    guests: reservation.guests,
                    notes: reservation.notes!.trim(),
                })),
        [dayReservations]
    );

    const busiestTime = useMemo(() => {
        if (dayReservations.length === 0) return null;
        const counts = new Map<string, number>();
        dayReservations.forEach((reservation) => {
            counts.set(reservation.time, (counts.get(reservation.time) ?? 0) + 1);
        });

        const sorted = Array.from(counts.entries()).sort((a, b) => {
            if (b[1] !== a[1]) return b[1] - a[1];
            return parseTimeToMinutes(a[0]) - parseTimeToMinutes(b[0]);
        });
        const [time, count] = sorted[0] ?? ['', 0];
        return time ? { time, count } : null;
    }, [dayReservations]);

    const tablesUsedDay = useMemo(
        () => new Set(dayReservations.flatMap((reservation) => reservation.tableIds ?? [])).size,
        [dayReservations]
    );

    function openQueueEntry(entry: QueueEntry) {
        setDrawerEntry(entry);
        setSuggestMode(false);
        setSuggestDate('');
        setSuggestTime('');
        setSelectedTableIds([]);
        setActionError('');
    }

    function toggleTable(id: string) {
        setSelectedTableIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }

    async function approve() {
        if (!drawerEntry) return;
        setActionLoading('approve');
        setActionError('');
        try {
            const response = await fetch('/api/crm/queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'approve',
                    queueId: drawerEntry.id,
                    tableIds: selectedTableIds,
                }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setActionError(typeof data?.error === 'string' ? data.error : 'Failed to approve.');
                return;
            }

            setQueue((prev) => prev.filter((entry) => entry.id !== drawerEntry.id));
            if (data.record) {
                setReservations((prev) => [...prev, data.record as Reservation]);
            } else {
                await refreshData();
            }
            setDrawerEntry(null);
        } catch {
            setActionError('Request failed.');
        } finally {
            setActionLoading(null);
        }
    }

    async function reject() {
        if (!drawerEntry) return;
        setActionLoading('reject');
        setActionError('');
        try {
            const response = await fetch('/api/crm/queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject', queueId: drawerEntry.id }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setActionError(typeof data?.error === 'string' ? data.error : 'Failed to reject.');
                return;
            }

            setQueue((prev) => prev.filter((entry) => entry.id !== drawerEntry.id));
            setDrawerEntry(null);
        } catch {
            setActionError('Request failed.');
        } finally {
            setActionLoading(null);
        }
    }

    async function suggestAlternative() {
        if (!drawerEntry || !suggestDate || !suggestTime) return;
        setActionLoading('suggest');
        setActionError('');
        try {
            const response = await fetch('/api/crm/queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'suggest-alternative',
                    queueId: drawerEntry.id,
                    suggestedDate: suggestDate,
                    suggestedTime: suggestTime,
                    suggestedTableIds: selectedTableIds.length ? selectedTableIds : undefined,
                }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setActionError(typeof data?.error === 'string' ? data.error : 'Failed to send alternative.');
                return;
            }

            setQueue((prev) => prev.filter((entry) => entry.id !== drawerEntry.id));
            setDrawerEntry(null);
            setSuggestMode(false);
        } catch {
            setActionError('Request failed.');
        } finally {
            setActionLoading(null);
        }
    }

    return (
        <div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                    <DayMetricCard
                        title="Total Reservations"
                        value={`${dayReservations.length}`}
                        subtitle={formatLongDate(selectedDate)}
                    />
                    <DayMetricCard
                        title="Busiest Time"
                        value={busiestTime ? busiestTime.time : '—'}
                        subtitle={busiestTime ? `${busiestTime.count} bookings in this slot` : 'No bookings for this date'}
                    />
                    <DayMetricCard
                        title="Pending Queue"
                        value={`${queue.length}`}
                        subtitle="Awaiting approval"
                    />
                    <DayMetricCard
                        title="Tables Used"
                        value={`${tablesUsedDay}`}
                        subtitle="Across selected date"
                    />
                </div>
            </div>

            {loadError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {loadError}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <section className="xl:col-span-2 bg-white rounded-2xl border border-[#631732]/20 shadow-sm p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="inline-flex rounded-xl border border-[#631732]/20 bg-slate-50 p-1">
                            <button
                                type="button"
                                onClick={() => setActiveListTab('queue')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                    activeListTab === 'queue'
                                        ? 'bg-[#631732] text-white'
                                        : 'text-slate-700 hover:bg-white'
                                }`}
                            >
                                Queue
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveListTab('reservations')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                    activeListTab === 'reservations'
                                        ? 'bg-[#631732] text-white'
                                        : 'text-slate-700 hover:bg-white'
                                }`}
                            >
                                Reservations of day
                            </button>
                        </div>
                        <span className="text-sm text-slate-500">{formatLongDate(selectedDate)}</span>
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
                                            onClick={() => openQueueEntry(entry)}
                                            className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-[#631732]/30 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="font-semibold text-slate-800 truncate">{entry.name}</p>
                                                <p className="text-xs text-slate-500 whitespace-nowrap">
                                                    {entry.date} · {entry.time}
                                                </p>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-0.5">
                                                {entry.guests} guests
                                                {entry.notes?.trim() ? ` · ${entry.notes.trim()}` : ''}
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
                                <li
                                    key={reservation.id}
                                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-semibold text-slate-800 truncate">{reservation.name}</p>
                                        <p className="text-xs text-slate-500 whitespace-nowrap">{reservation.time}</p>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-0.5">
                                        {reservation.guests} guests
                                        {reservation.tableIds?.length
                                            ? ` · T${reservation.tableIds.join(',')}`
                                            : ''}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="bg-white rounded-2xl border border-[#631732]/20 shadow-sm p-5">
                    <div className="flex items-center justify-between gap-2 mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Notes</h3>
                        <div className="inline-flex rounded-xl border border-[#631732]/20 bg-slate-50 p-1">
                            <button
                                type="button"
                                onClick={() => setNotesView('notes')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                                    notesView === 'notes' ? 'bg-[#631732] text-white' : 'text-slate-700'
                                }`}
                            >
                                Notes cards
                            </button>
                            <button
                                type="button"
                                onClick={() => setNotesView('reservation')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                                    notesView === 'reservation'
                                        ? 'bg-[#631732] text-white'
                                        : 'text-slate-700'
                                }`}
                            >
                                Reservation cards
                            </button>
                        </div>
                    </div>

                    {dayNotes.length === 0 ? (
                        <p className="text-slate-500">No notes for this date.</p>
                    ) : (
                        <ul className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                            {dayNotes.map((note) => (
                                <li
                                    key={note.id}
                                    className={`rounded-xl border p-3 ${
                                        notesView === 'notes'
                                            ? 'border-[#631732]/20 bg-[#631732]/[0.03]'
                                            : 'border-slate-200 bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-semibold text-slate-800">{note.name}</p>
                                        <span className="text-xs text-slate-500">{note.time}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">{note.guests} guests</p>
                                    <p className="mt-2 text-sm text-slate-700">{note.notes}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>

            {drawerEntry && (
                <div className="fixed inset-0 bg-black/50 flex justify-end z-20" onClick={() => setDrawerEntry(null)}>
                    <div className="w-full max-w-md bg-white shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800">Pending request</h3>
                            <button
                                type="button"
                                onClick={() => setDrawerEntry(null)}
                                className="text-slate-500 hover:text-slate-700"
                            >
                                Close
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                                <dt className="text-slate-500">Name</dt>
                                <dd className="text-slate-900">{drawerEntry.name}</dd>
                                <dt className="text-slate-500">Email</dt>
                                <dd className="text-slate-900">{drawerEntry.email}</dd>
                                <dt className="text-slate-500">Phone</dt>
                                <dd className="text-slate-900">{drawerEntry.phone}</dd>
                                <dt className="text-slate-500">Date</dt>
                                <dd className="text-slate-900">{drawerEntry.date}</dd>
                                <dt className="text-slate-500">Time</dt>
                                <dd className="text-slate-900">{drawerEntry.time}</dd>
                                <dt className="text-slate-500">Guests</dt>
                                <dd className="text-slate-900">{drawerEntry.guests}</dd>
                                {drawerEntry.notes && (
                                    <>
                                        <dt className="text-slate-500">Notes</dt>
                                        <dd className="text-slate-900">{drawerEntry.notes}</dd>
                                    </>
                                )}
                            </dl>

                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Assign table(s)</p>
                                <div className="flex flex-wrap gap-2">
                                    {tables.map((table) => (
                                        <button
                                            key={table.id}
                                            type="button"
                                            onClick={() => toggleTable(table.id)}
                                            className={`px-3 py-1.5 rounded border text-sm ${
                                                selectedTableIds.includes(table.id)
                                                    ? 'bg-[#631732] text-white border-[#631732]'
                                                    : 'border-slate-300 text-slate-700 hover:border-slate-400'
                                            }`}
                                        >
                                            {table.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {suggestMode ? (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-slate-700">Suggest alternative</p>
                                    <input
                                        type="date"
                                        value={suggestDate}
                                        onChange={(e) => setSuggestDate(e.target.value)}
                                        className="w-full border rounded px-2 py-1.5 text-sm"
                                    />
                                    <input
                                        type="time"
                                        value={suggestTime}
                                        onChange={(e) => setSuggestTime(e.target.value)}
                                        className="w-full border rounded px-2 py-1.5 text-sm"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={suggestAlternative}
                                            disabled={actionLoading !== null || !suggestDate || !suggestTime}
                                            className="px-4 py-2 bg-[#631732] text-white rounded text-sm disabled:opacity-50"
                                        >
                                            Send offer
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSuggestMode(false)}
                                            className="px-4 py-2 border rounded text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={approve}
                                        disabled={actionLoading !== null}
                                        className="px-4 py-2 bg-[#631732] text-white rounded text-sm disabled:opacity-50"
                                    >
                                        {actionLoading === 'approve' ? 'Approving…' : 'Approve'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={reject}
                                        disabled={actionLoading !== null}
                                        className="px-4 py-2 border border-slate-300 rounded text-sm disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSuggestMode(true)}
                                        className="px-4 py-2 border border-slate-300 rounded text-sm"
                                    >
                                        Suggest alternative
                                    </button>
                                </div>
                            )}

                            {actionError && <p className="text-red-600 text-sm">{actionError}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
