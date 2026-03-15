'use client';

import { Suspense } from 'react';
import { DashboardContent } from './DashboardContent';

function DashboardFallback() {
    return (
        <div className="mx-auto w-full max-w-[1320px] animate-pulse">
            <div className="h-32 bg-slate-200/50 rounded-2xl mb-6" />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="h-64 bg-slate-200/30 rounded-xl" />
                <div className="h-64 bg-slate-200/30 rounded-xl" />
            </div>
        </div>
    );
}

export default function CrmDashboardPage() {
    return (
        <Suspense fallback={<DashboardFallback />}>
            <DashboardContent />
        </Suspense>
    );
}
