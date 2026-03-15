'use client';

import { Suspense } from 'react';
import { CalendarContent } from './CalendarContent';

function CalendarPageSkeleton() {
    return (
        <div className="bg-gradient-to-br from-[#f3e8ff] via-[#fdf2ff] to-[#fee2e2] rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden flex flex-col max-h-[calc(100vh-5rem)] min-h-[460px] sm:min-h-[560px] animate-pulse">
            <div className="h-14 sm:h-16 bg-white/50 border-b border-slate-200/70" />
            <div className="flex-1 min-h-[400px] bg-white/30" />
        </div>
    );
}

export default function CrmCalendarPage() {
    return (
        <Suspense fallback={<CalendarPageSkeleton />}>
            <CalendarContent />
        </Suspense>
    );
}
