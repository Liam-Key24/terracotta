'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import {
    CalendarBlankIcon,
    CalendarDotsIcon,
    CaretLeftIcon,
    CaretRightIcon,
    CodeIcon,
    RowsIcon,
    SignOutIcon,
    SquaresFourIcon,
} from '@phosphor-icons/react';
import { formatWeekRangeLabel, getIsoDateOrFallback, parseIsoDate, toLocalIso } from './crm/_shared/date';

function CrmLayoutSkeleton() {
    return (
        <div className="min-h-screen bg-slate-100">
            <header className="sticky top-0 z-40 px-4 pt-4">
                <div className="rounded-2xl border border-[#631732]/20 bg-white/95 backdrop-blur px-4 py-2.5 shadow-sm animate-pulse">
                    <div className="h-10 bg-slate-200/50 rounded-lg" />
                </div>
            </header>
            <main className="p-4 sm:p-6">
                <div className="h-64 bg-slate-200/30 rounded-xl" />
            </main>
        </div>
    );
}

function CrmLayoutContent({ children }: { children: React.ReactNode }) {
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
        { href: '/crm/dashboard', label: 'Dashboard', icon: SquaresFourIcon },
        { href: '/crm/calendar', label: 'Calendar', icon: CalendarDotsIcon },
        { href: '/crm/floorplan', label: 'Floor plan', icon: RowsIcon },
    ];
    if (role === 'developer') nav.push({ href: '/crm/developer', label: 'Developer', icon: CodeIcon });

    const todayIso = toLocalIso(new Date());
    const globalDate = getIsoDateOrFallback(searchParams.get('date'), todayIso);

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

    const navLinks = (
        <>
            {nav.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                    <Link
                        key={href}
                        href={`${href}?date=${globalDate}`}
                        aria-label={label}
                        title={label}
                        className={`h-8 w-8 md:h-8 md:w-8 lg:h-9 lg:w-9 xl:w-auto xl:px-3 inline-flex items-center justify-center gap-0 xl:gap-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border shrink-0 ${
                            active
                                ? 'purp text-white border-transparent shadow-sm'
                                : 'text-[#631732]/80 border-[#631732]/25 bg-[#631732]/5 hover:bg-[#631732]/10'
                        }`}
                    >
                        <Icon size={14} weight={active ? 'fill' : 'regular'} />
                        <span className="hidden 2xl:inline">{label}</span>
                    </Link>
                );
            })}
        </>
    );

    const logoutButton = (
        <form action="/api/crm/logout" method="POST">
            <button
                type="submit"
                aria-label="Log out"
                title="Log out"
                className="h-8 w-8 md:h-8 md:w-8 lg:h-9 lg:w-9 xl:w-auto xl:px-3 rounded-full text-sm font-medium text-[#631732] bg-[#631732]/10 border border-[#631732]/20 hover:bg-[#631732]/15 inline-flex items-center justify-center gap-0 xl:gap-1.5 shrink-0"
            >
                <SignOutIcon size={14} weight="bold" />
                <span className="hidden 2xl:inline">Log out</span>
            </button>
        </form>
    );

    const dateControls = (
        <>
            <button
                type="button"
                onClick={jumpToToday}
                aria-label="Today"
                title="Today"
                className="h-8 w-8 md:h-8 lg:h-9 md:w-9 lg:w-9 rounded-full font-medium text-[#631732] bg-[#631732]/10 border border-[#631732]/20 hover:bg-[#631732]/15 inline-flex items-center justify-center shrink-0"
            >
                <CalendarBlankIcon size={14} weight="bold" />
            </button>
            <div className="h-8 md:h-8 lg:h-9 inline-flex items-center rounded-full border border-[#631732]/20 bg-[#631732]/5 px-1 md:px-1 shrink-0 flex-1 min-w-0 justify-center md:flex-initial">
                <button
                    type="button"
                    onClick={() => shiftWeek(-1)}
                    className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 inline-flex items-center justify-center rounded-full text-[#631732] hover:bg-[#631732]/10"
                    aria-label="Previous week"
                >
                    <CaretLeftIcon size={12} weight="bold" />
                </button>
                <span className="px-1.5 md:px-2 lg:px-3 text-xs md:text-xs lg:text-sm font-medium text-[#631732] whitespace-nowrap">
                    {formatWeekRangeLabel(globalDate)}
                </span>
                <button
                    type="button"
                    onClick={() => shiftWeek(1)}
                    className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 inline-flex items-center justify-center rounded-full text-[#631732] hover:bg-[#631732]/10"
                    aria-label="Next week"
                >
                    <CaretRightIcon size={12} weight="bold" />
                </button>
            </div>
            <div className="relative h-8 w-8 md:h-8 md:w-9 lg:h-9 lg:w-auto lg:min-w-[130px] shrink-0">
                <span
                    className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full border border-[#631732]/20 bg-white text-[#631732] lg:hidden"
                    aria-hidden
                >
                    <CalendarDotsIcon size={14} weight="bold" />
                </span>
                <input
                    type="date"
                    value={globalDate}
                    onChange={(e) => updateGlobalDate(e.target.value)}
                    aria-label="Choose date"
                    className="absolute inset-0 h-full w-full cursor-pointer rounded-full border-0 bg-transparent opacity-0 lg:static lg:inset-auto lg:h-9 lg:w-full lg:min-w-[130px] lg:rounded-full lg:border lg:border-[#631732]/20 lg:bg-white lg:px-3 lg:opacity-100 lg:text-sm lg:font-medium lg:text-[#631732]"
                />
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="sticky top-0 z-40 px-4 pt-4">
                <div className="rounded-2xl border border-[#631732]/20 bg-white/95 backdrop-blur px-4 py-2.5 shadow-sm">
                    {/* Mobile: page buttons + logout in one row, then date toggles */}
                    <div className="flex flex-col gap-2 md:hidden">
                        <div className="flex items-center justify-between gap-2 min-w-0">
                            <nav className="flex items-center gap-1.5 shrink-0">{navLinks}</nav>
                            {logoutButton}
                        </div>
                        <div className="flex items-center justify-between gap-2 min-w-0 border-t border-slate-200/80 pt-2">{dateControls}</div>
                    </div>

                    {/* Tablet + desktop: single row */}
                    <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] items-center gap-2 lg:gap-3 min-w-0">
                        <nav className="min-w-0 flex items-center gap-1.5 shrink-0">{navLinks}</nav>
                        <div className="flex items-center justify-center gap-1.5 lg:gap-2 min-w-0 shrink-0">{dateControls}</div>
                        <div className="justify-self-end flex justify-end shrink-0">{logoutButton}</div>
                    </div>
                </div>
            </header>
            <main className="p-4 sm:p-6">{children}</main>
        </div>
    );
}

export default function CrmLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    if (pathname === '/crm' || pathname === '/crm/') {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                {children}
            </div>
        );
    }
    return (
        <Suspense fallback={<CrmLayoutSkeleton />}>
            <CrmLayoutContent>{children}</CrmLayoutContent>
        </Suspense>
    );
}
