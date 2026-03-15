'use client';

import { Suspense } from 'react';
import { ConfirmAlternativeContent } from './ConfirmAlternativeContent';

function ConfirmAlternativeFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
            <p className="text-slate-600">Loading…</p>
        </div>
    );
}

export default function ConfirmAlternativePage() {
    return (
        <Suspense fallback={<ConfirmAlternativeFallback />}>
            <ConfirmAlternativeContent />
        </Suspense>
    );
}
