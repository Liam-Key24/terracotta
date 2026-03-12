'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

type Reservation = { date: string };
type QueueEntry = { id: string };

function isToday(d: string): boolean {
    const t = new Date();
    const [y, m, day] = d.split('-').map(Number);
    return y === t.getFullYear() && (m ?? 1) - 1 === t.getMonth() && (day ?? 1) === t.getDate();
}

function isThisWeek(d: string): boolean {
    const date = new Date(d);
    const t = new Date();
    const start = new Date(t);
    start.setDate(t.getDate() - t.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return date >= start && date < end;
}

export default function CrmDashboardPage() {
    const [todayCount, setTodayCount] = useState<number | null>(null);
    const [weekCount, setWeekCount] = useState<number | null>(null);
    const [queueCount, setQueueCount] = useState<number | null>(null);

    useEffect(() => {
        Promise.all([fetch('/api/crm/reservations').then((r) => r.json()), fetch('/api/crm/queue').then((r) => r.json())]).then(
            ([res, q]) => {
                const list = Array.isArray(res) ? (res as Reservation[]) : [];
                setTodayCount(list.filter((r) => isToday(r.date)).length);
                setWeekCount(list.filter((r) => isThisWeek(r.date)).length);
                setQueueCount(Array.isArray(q) ? (q as QueueEntry[]).length : 0);
            }
        );
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-light text-[#631732] mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-6 bg-white rounded-xl border border-[#631732]/20 shadow-sm">
                    <p className="text-sm text-slate-600">Today</p>
                    <p className="text-2xl font-semibold text-slate-800">{todayCount ?? '—'} reservations</p>
                </div>
                <div className="p-6 bg-white rounded-xl border border-[#631732]/20 shadow-sm">
                    <p className="text-sm text-slate-600">This week</p>
                    <p className="text-2xl font-semibold text-slate-800">{weekCount ?? '—'} reservations</p>
                </div>
                <div className="p-6 bg-white rounded-xl border border-[#631732]/20 shadow-sm">
                    <p className="text-sm text-slate-600">Pending queue</p>
                    <p className="text-2xl font-semibold text-slate-800">{queueCount ?? '—'}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                    href="/crm/calendar"
                    className="p-6 bg-white rounded-xl border border-[#631732]/20 shadow-sm hover:shadow-md transition-shadow"
                >
                    <h2 className="font-semibold text-slate-800 mb-1">Calendar</h2>
                    <p className="text-sm text-slate-600">View and manage reservations by day</p>
                </Link>
                <Link
                    href="/crm/stats"
                    className="p-6 bg-white rounded-xl border border-[#631732]/20 shadow-sm hover:shadow-md transition-shadow"
                >
                    <h2 className="font-semibold text-slate-800 mb-1">Stats &amp; Queue</h2>
                    <p className="text-sm text-slate-600">Counts and pending approvals</p>
                </Link>
                <Link
                    href="/crm/floorplan"
                    className="p-6 bg-white rounded-xl border border-[#631732]/20 shadow-sm hover:shadow-md transition-shadow"
                >
                    <h2 className="font-semibold text-slate-800 mb-1">Floor plan</h2>
                    <p className="text-sm text-slate-600">Tables and occupancy</p>
                </Link>
            </div>
        </div>
    );
}
