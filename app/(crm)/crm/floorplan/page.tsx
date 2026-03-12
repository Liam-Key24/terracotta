'use client';

import { useState, useEffect } from 'react';

type Reservation = {
    id: string;
    date: string;
    time: string;
    name: string;
    guests: string;
    tableIds?: string[];
};

type Table = { id: string; label: string; maxGuests: number };

function parseTimeToMinutes(t: string): number {
    const s = t.trim().toLowerCase();
    const m = s.match(/(\d{1,2})(?::(\d{2}))?\s*pm?/i) || s.match(/(\d{1,2}):(\d{2})/);
    if (m) {
        let h = parseInt(m[1], 10);
        const min = m[2] ? parseInt(m[2], 10) : 0;
        if (s.includes('p') && h < 12) h += 12;
        return h * 60 + min;
    }
    if (/^\d{1,2}:\d{2}$/.test(s)) {
        const [h, min] = s.split(':').map(Number);
        return (h ?? 0) * 60 + (min ?? 0);
    }
    return 0;
}

function formatTimeRange(startMin: number, durationMin: number): string {
    const h1 = Math.floor(startMin / 60);
    const m1 = startMin % 60;
    const endMin = startMin + durationMin;
    const h2 = Math.floor(endMin / 60);
    const m2 = endMin % 60;
    return `${h1.toString().padStart(2, '0')}:${m1.toString().padStart(2, '0')}–${h2.toString().padStart(2, '0')}:${m2.toString().padStart(2, '0')}`;
}

function getDurationMinutes(guests: string): number {
    const g = parseInt(guests, 10);
    if (g <= 2) return 90;
    return 120;
}

export default function CrmFloorplanPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

    useEffect(() => {
        fetch('/api/crm/reservations').then((r) => r.json()).then((d) => setReservations(Array.isArray(d) ? d : []));
        fetch('/api/crm/tables').then((r) => r.json()).then((d) => setTables(Array.isArray(d) ? d : []));
    }, []);

    const dayReservations = reservations.filter((r) => r.date === selectedDate);

    const tableSlots = tables.map((t) => {
        const slots = dayReservations
            .filter((r) => r.tableIds?.includes(t.id))
            .map((r) => {
                const startMin = parseTimeToMinutes(r.time);
                const duration = getDurationMinutes(r.guests);
                return { time: formatTimeRange(startMin, duration), name: r.name, guests: r.guests };
            });
        return { ...t, slots };
    });

    return (
        <div>
            <h1 className="text-2xl font-light text-[#631732] mb-4">Floor plan</h1>
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-slate-900"
                />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tableSlots.map((t) => (
                    <div
                        key={t.id}
                        className="bg-white rounded-xl border-2 border-[#631732]/30 p-4 min-h-[120px]"
                    >
                        <div className="font-semibold text-[#631732] mb-1">{t.label}</div>
                        <div className="text-xs text-slate-500 mb-2">max {t.maxGuests} guests</div>
                        <ul className="text-sm text-slate-700 space-y-1">
                            {t.slots.length === 0 ? (
                                <li className="text-slate-400">—</li>
                            ) : (
                                t.slots.map((s, i) => (
                                    <li key={i}>
                                        {s.time} · {s.name} ({s.guests})
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
