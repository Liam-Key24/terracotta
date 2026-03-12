'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type DataSet = {
    reservations: unknown;
    queue: unknown;
    alternatives: unknown;
    tables: unknown;
};

export default function CrmDeveloperPage() {
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);
    const [revealed, setRevealed] = useState(false);
    const [password, setPassword] = useState('');
    const [revealError, setRevealError] = useState('');
    const [data, setData] = useState<DataSet | null>(null);
    const [activeTab, setActiveTab] = useState<'reservations' | 'queue' | 'alternatives' | 'tables'>('reservations');

    useEffect(() => {
        fetch('/api/crm/me')
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
                if (d?.role === 'developer') setRole('developer');
                else if (d) router.replace('/crm/dashboard');
            })
            .catch(() => router.replace('/crm'));
    }, [router]);

    async function handleReveal(e: React.FormEvent) {
        e.preventDefault();
        setRevealError('');
        try {
            const res = await fetch('/api/crm/developer/verify-reveal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const body = await res.json();
            if (!res.ok) {
                setRevealError(body.error || 'Invalid');
                return;
            }
            const token = body.token;
            const dataRes = await fetch(`/api/crm/developer/data?reveal=${encodeURIComponent(token)}`);
            if (!dataRes.ok) {
                setRevealError('Failed to load data');
                return;
            }
            const dataJson = await dataRes.json();
            setData(dataJson);
            setRevealed(true);
            setPassword('');
        } catch {
            setRevealError('Request failed');
        }
    }

    if (role === null) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <p className="text-slate-600">Loading…</p>
            </div>
        );
    }

    if (role !== 'developer') return null;

    return (
        <div>
            <h1 className="text-2xl font-light text-[#631732] mb-6">Developer data</h1>

            {!revealed ? (
                <div className="bg-white rounded-xl border border-[#631732]/20 p-6 max-w-md">
                    <p className="text-slate-600 mb-4">Re-enter your developer password to reveal data. Data is not stored in the page source.</p>
                    <form onSubmit={handleReveal} className="space-y-3">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Developer password"
                            className="w-full border rounded-lg px-3 py-2 text-slate-900"
                            autoComplete="current-password"
                        />
                        {revealError && <p className="text-red-600 text-sm">{revealError}</p>}
                        <button type="submit" className="w-full py-2 bg-[#631732] text-white rounded-lg font-medium">
                            Reveal data
                        </button>
                    </form>
                </div>
            ) : (
                <div>
                    <div className="flex gap-2 mb-4 border-b border-slate-200">
                        {(['reservations', 'queue', 'alternatives', 'tables'] as const).map((key) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setActiveTab(key)}
                                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                                    activeTab === key ? 'border-[#631732] text-[#631732]' : 'border-transparent text-slate-600'
                                }`}
                            >
                                {key}
                            </button>
                        ))}
                    </div>
                    <div
                        className="bg-white rounded-xl border border-[#631732]/20 p-4 overflow-x-auto text-sm select-none"
                        style={{ userSelect: 'none' }}
                    >
                        {data && (
                            <pre className="whitespace-pre-wrap break-words font-mono text-slate-800">
                                {JSON.stringify(data[activeTab], null, 2)}
                            </pre>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
