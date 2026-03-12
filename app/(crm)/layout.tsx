'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

function toLocalIso(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function parseIsoDate(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

function formatWeekRangeLabel(iso: string): string {
    const base = parseIsoDate(iso);
    const day = base.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(base);
    monday.setDate(base.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const format = (date: Date) =>
        date
            .toLocaleDateString('en-GB', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            })
            .replace(',', '');

    return `${format(monday)} - ${format(sunday)}`;
}

export default function CrmLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/crm/me')
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => data && setRole(data.role))
            .catch(() => {});
    }, []);

    const isLogin = pathname === '/crm' || pathname === '/crm/';
    if (isLogin) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                {children}
            </div>
        );
    }

    const nav = [
        { href: '/crm/dashboard', label: 'Dashboard' },
        { href: '/crm/calendar', label: 'Calendar' },
        { href: '/crm/floorplan', label: 'Floor plan' },
    ];
    if (role === 'developer') nav.push({ href: '/crm/developer', label: 'Developer' });

    const todayIso = toLocalIso(new Date());
    const globalDate = (() => {
        const candidate = searchParams.get('date');
        if (candidate && /^\d{4}-\d{2}-\d{2}$/.test(candidate)) return candidate;
        return todayIso;
    })();

    function updateGlobalDate(nextDate: string) {
        if (!nextDate) return;
        const params = new URLSearchParams(searchParams.toString());
        params.set('date', nextDate);
        router.replace(`${pathname}?${params.toString()}`);
    }

    function shiftWeek(delta: number) {
        const base = parseIsoDate(globalDate);
        base.setDate(base.getDate() + delta * 7);
        updateGlobalDate(toLocalIso(base));
    }

    function jumpToToday() {
        updateGlobalDate(todayIso);
    }

    function isActive(href: string): boolean {
        return pathname === href || pathname.startsWith(`${href}/`);
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="sticky top-0 z-40 px-4 pt-4">
                <div className="rounded-2xl border border-[#631732]/20 bg-white/95 backdrop-blur px-4 py-2.5 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <nav className="min-w-0 flex items-center gap-1 overflow-x-auto pr-2">
                            {nav.map(({ href, label }) => (
                                <Link
                                    key={href}
                                    href={`${href}?date=${globalDate}`}
                                    className={`h-9 px-3 inline-flex items-center rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                        isActive(href)
                                            ? 'purp text-white shadow-sm'
                                            : 'text-[#631732]/80 hover:bg-[#631732]/10'
                                    }`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center justify-center gap-2">
                            <div className="h-9 inline-flex items-center rounded-full border border-[#631732]/20 bg-[#631732]/5 px-1">
                                <button
                                    type="button"
                                    onClick={() => shiftWeek(-1)}
                                    className="w-8 h-8 inline-flex items-center justify-center rounded-full text-[#631732] hover:bg-[#631732]/10"
                                    aria-label="Previous week"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <span className="px-3 text-sm font-medium text-[#631732] whitespace-nowrap">
                                    {formatWeekRangeLabel(globalDate)}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => shiftWeek(1)}
                                    className="w-8 h-8 inline-flex items-center justify-center rounded-full text-[#631732] hover:bg-[#631732]/10"
                                    aria-label="Next week"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={jumpToToday}
                                className="h-9 px-3 rounded-full text-sm font-medium text-[#631732] bg-[#631732]/10 border border-[#631732]/20 hover:bg-[#631732]/15"
                            >
                                Today
                            </button>

                            <input
                                type="date"
                                value={globalDate}
                                onChange={(e) => updateGlobalDate(e.target.value)}
                                className="h-9 px-3 rounded-full text-sm font-medium border border-[#631732]/20 bg-white text-[#631732]"
                            />
                        </div>

                        <div className="md:justify-self-end md:flex md:justify-end">
                            <form action="/api/crm/logout" method="POST">
                                <button
                                    type="submit"
                                    className="h-9 px-3 rounded-full text-sm font-medium text-[#631732] bg-[#631732]/10 border border-[#631732]/20 hover:bg-[#631732]/15"
                                >
                                    Log out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>
            <main className="p-4 sm:p-6">{children}</main>
        </div>
    );
}
