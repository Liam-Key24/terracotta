'use client';

import { Suspense } from 'react';
import { FloorplanContent } from './FloorplanContent';

function FloorplanFallback() {
    return (
        <div className="space-y-6">
            <section className="mx-auto max-w-4xl lg:max-w-[96rem] rounded-2xl border border-slate-300 bg-[#ebebeb] p-4 sm:p-5 lg:p-8 min-h-[420px] lg:min-h-[700px] animate-pulse">
                <div className="h-12 bg-white/50 rounded-lg mb-4" />
                <div className="h-64 bg-white/30 rounded-xl" />
            </section>
        </div>
    );
}

export default function CrmFloorplanPage() {
    return (
        <Suspense fallback={<FloorplanFallback />}>
            <FloorplanContent />
        </Suspense>
    );
}
