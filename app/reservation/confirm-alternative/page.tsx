'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

type Alternative = {
    name: string;
    suggestedDate: string;
    suggestedTime: string;
    suggestedTableIds?: string[];
    guests: string;
};

export default function ConfirmAlternativePage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [entry, setEntry] = useState<Alternative | null>(null);
    const [status, setStatus] = useState<'loading' | 'ready' | 'confirmed' | 'error' | 'expired'>('loading');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setError('Missing link');
            return;
        }
        fetch(`/api/crm/alternatives?token=${encodeURIComponent(token)}`)
            .then((r) => {
                if (r.status === 404) {
                    setStatus('expired');
                    return null;
                }
                return r.json();
            })
            .then((data) => {
                if (data) {
                    setEntry(data);
                    setStatus('ready');
                }
            })
            .catch(() => {
                setStatus('error');
                setError('Failed to load');
            });
    }, [token]);

    async function handleConfirm() {
        if (!token) return;
        setStatus('loading');
        try {
            const res = await fetch('/api/crm/alternatives', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });
            const data = await res.json();
            if (res.ok && data.ok) {
                setStatus('confirmed');
            } else {
                setStatus('error');
                setError(data.error || 'Failed to confirm');
            }
        } catch {
            setStatus('error');
            setError('Request failed');
        }
    }

    if (status === 'loading' && !entry) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
                <p className="text-slate-600">Loading…</p>
            </div>
        );
    }
    if (status === 'expired') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <h1 className="text-xl font-semibold text-slate-800 mb-2">Offer expired</h1>
                    <p className="text-slate-600">This offer has expired. Please contact us to rebook.</p>
                </div>
            </div>
        );
    }
    if (status === 'confirmed') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <div className="text-4xl text-green-600 mb-4">✓</div>
                    <h1 className="text-xl font-semibold text-slate-800 mb-2">Booking confirmed</h1>
                    <p className="text-slate-600">A confirmation email has been sent. See you soon!</p>
                </div>
            </div>
        );
    }
    if (status === 'error' && !entry) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <h1 className="text-xl font-semibold text-red-600 mb-2">Error</h1>
                    <p className="text-slate-600">{error}</p>
                </div>
            </div>
        );
    }
    if (!entry) return null;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                <h1 className="text-xl font-semibold text-[#631732] mb-4">Confirm your booking</h1>
                <p className="text-slate-600 mb-4">Hi {entry.name}, we’d like to offer you:</p>
                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                    <p><strong>Date:</strong> {entry.suggestedDate}</p>
                    <p><strong>Time:</strong> {entry.suggestedTime}</p>
                    <p><strong>Guests:</strong> {entry.guests}</p>
                </div>
                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={status === 'loading'}
                    className="w-full bg-[#631732] text-white py-3 rounded-lg font-medium hover:bg-[#631732]/90 disabled:opacity-50"
                >
                    {status === 'loading' ? 'Confirming…' : 'Confirm this booking'}
                </button>
            </div>
        </div>
    );
}
