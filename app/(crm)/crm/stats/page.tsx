'use client';

import { useState, useEffect } from 'react';

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

type Table = { id: string; label: string; maxGuests: number };

function parseDate(d: string): Date {
    const [y, m, day] = d.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, day ?? 1);
}

function isToday(dateStr: string): boolean {
    const t = new Date();
    const d = parseDate(dateStr);
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

function isThisWeek(dateStr: string): boolean {
    const d = parseDate(dateStr).getTime();
    const t = new Date();
    const start = new Date(t);
    start.setDate(t.getDate() - t.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return d >= start.getTime() && d < end.getTime();
}

function isThisMonth(dateStr: string): boolean {
    const t = new Date();
    const d = parseDate(dateStr);
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth();
}

export default function CrmStatsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [queue, setQueue] = useState<QueueEntry[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [drawerEntry, setDrawerEntry] = useState<QueueEntry | null>(null);
    const [suggestMode, setSuggestMode] = useState(false);
    const [suggestDate, setSuggestDate] = useState('');
    const [suggestTime, setSuggestTime] = useState('');
    const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([
            fetch('/api/crm/reservations').then((r) => r.json()),
            fetch('/api/crm/queue').then((r) => r.json()),
            fetch('/api/crm/tables').then((r) => r.json()),
        ]).then(([res, q, t]) => {
            setReservations(Array.isArray(res) ? res : []);
            setQueue(Array.isArray(q) ? q : []);
            setTables(Array.isArray(t) ? t : []);
        });
    }, [drawerEntry]);

    const today = reservations.filter((r) => isToday(r.date));
    const week = reservations.filter((r) => isThisWeek(r.date));
    const month = reservations.filter((r) => isThisMonth(r.date));
    const tablesUsedToday = new Set(today.flatMap((r) => r.tableIds ?? [])).size;
    const todayNotes = today.filter((r) => r.notes?.trim()).map((r) => ({ name: r.name, notes: r.notes! }));

    async function approve() {
        if (!drawerEntry) return;
        setLoading('approve');
        setError('');
        try {
            const res = await fetch('/api/crm/queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve', queueId: drawerEntry.id, tableIds: selectedTableIds }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed');
                return;
            }
            setDrawerEntry(null);
            setQueue((prev) => prev.filter((e) => e.id !== drawerEntry.id));
            if (data.record) setReservations((prev) => [...prev, data.record]);
            else fetch('/api/crm/reservations').then((r) => r.json()).then((res) => setReservations(Array.isArray(res) ? res : []));
        } catch {
            setError('Request failed');
        } finally {
            setLoading(null);
        }
    }

    async function reject() {
        if (!drawerEntry) return;
        setLoading('reject');
        setError('');
        try {
            const res = await fetch('/api/crm/queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject', queueId: drawerEntry.id }),
            });
            if (!res.ok) {
                setError('Failed');
                return;
            }
            setDrawerEntry(null);
            setQueue((prev) => prev.filter((e) => e.id !== drawerEntry.id));
        } catch {
            setError('Request failed');
        } finally {
            setLoading(null);
        }
    }

    async function suggestAlternative() {
        if (!drawerEntry || !suggestDate || !suggestTime) return;
        setLoading('suggest');
        setError('');
        try {
            const res = await fetch('/api/crm/queue', {
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
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed');
                return;
            }
            setDrawerEntry(null);
            setSuggestMode(false);
            setQueue((prev) => prev.filter((e) => e.id !== drawerEntry.id));
        } catch {
            setError('Request failed');
        } finally {
            setLoading(null);
        }
    }

    function toggleTable(id: string) {
        setSelectedTableIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }

    return (
        <div>
            <h1 className="text-2xl font-light text-[#631732] mb-6">Stats</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-[#631732]/20 p-4">
                    <p className="text-sm text-slate-600">Today</p>
                    <p className="text-2xl font-semibold text-slate-800">{today.length} reservations</p>
                </div>
                <div className="bg-white rounded-xl border border-[#631732]/20 p-4">
                    <p className="text-sm text-slate-600">This week</p>
                    <p className="text-2xl font-semibold text-slate-800">{week.length} reservations</p>
                </div>
                <div className="bg-white rounded-xl border border-[#631732]/20 p-4">
                    <p className="text-sm text-slate-600">This month</p>
                    <p className="text-2xl font-semibold text-slate-800">{month.length} reservations</p>
                </div>
                <div className="bg-white rounded-xl border border-[#631732]/20 p-4">
                    <p className="text-sm text-slate-600">Tables in use today</p>
                    <p className="text-2xl font-semibold text-slate-800">{tablesUsedToday}</p>
                </div>
            </div>

            <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-2">Queue (needs approval)</h2>
                {queue.length === 0 ? (
                    <p className="text-slate-600">No pending requests.</p>
                ) : (
                    <ul className="space-y-2">
                        {queue.map((e) => (
                            <li key={e.id}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDrawerEntry(e);
                                        setSuggestMode(false);
                                        setSelectedTableIds([]);
                                        setSuggestDate('');
                                        setSuggestTime('');
                                        setError('');
                                    }}
                                    className="w-full text-left px-4 py-3 bg-white rounded-lg border border-[#631732]/20 hover:bg-slate-50"
                                >
                                    <span className="font-medium">{e.name}</span> – {e.date} at {e.time} ({e.guests} guests)
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <h2 className="text-lg font-semibold text-slate-800 mb-2">Today&apos;s notes / special requests</h2>
                {todayNotes.length === 0 ? (
                    <p className="text-slate-600">None for today.</p>
                ) : (
                    <ul className="space-y-2">
                        {todayNotes.map((r, i) => (
                            <li key={i} className="px-4 py-3 bg-white rounded-lg border border-[#631732]/20">
                                <span className="font-medium text-slate-800">{r.name}:</span>{' '}
                                <span className="text-slate-700">{r.notes}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {drawerEntry && (
                <div className="fixed inset-0 bg-black/50 flex justify-end z-10">
                    <div className="w-full max-w-md bg-white shadow-xl overflow-y-auto">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800">Pending request</h3>
                            <button type="button" onClick={() => setDrawerEntry(null)} className="text-slate-500 hover:text-slate-700">
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
                                    {tables.map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => toggleTable(t.id)}
                                            className={`px-3 py-1.5 rounded border text-sm ${
                                                selectedTableIds.includes(t.id)
                                                    ? 'bg-[#631732] text-white border-[#631732]'
                                                    : 'border-slate-300 text-slate-700 hover:border-slate-400'
                                            }`}
                                        >
                                            {t.label}
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
                                            onClick={() => suggestAlternative()}
                                            disabled={loading !== null || !suggestDate || !suggestTime}
                                            className="px-4 py-2 bg-[#631732] text-white rounded text-sm disabled:opacity-50"
                                        >
                                            Send offer
                                        </button>
                                        <button type="button" onClick={() => setSuggestMode(false)} className="px-4 py-2 border rounded text-sm">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => approve()}
                                        disabled={loading !== null}
                                        className="px-4 py-2 bg-[#631732] text-white rounded text-sm disabled:opacity-50"
                                    >
                                        {loading === 'approve' ? 'Approving…' : 'Approve'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => reject()}
                                        disabled={loading !== null}
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

                            {error && <p className="text-red-600 text-sm">{error}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
