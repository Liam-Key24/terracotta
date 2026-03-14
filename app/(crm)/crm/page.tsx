'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CodeIcon, LockIcon, UserCircleIcon, WarningCircleIcon } from '@phosphor-icons/react';

export default function CrmLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isDeveloper, setIsDeveloper] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/crm/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: isDeveloper ? '' : username,
                    password,
                    developer: isDeveloper,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Login failed');
                return;
            }
            router.push('/crm/dashboard');
            router.refresh();
        } catch {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 border border-[#631732]/20">
            <h1 className="text-2xl font-light text-[#631732] mb-6 text-center">
                Terracotta CRM
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <p className="text-red-600 text-sm inline-flex items-center gap-1.5" role="alert">
                        <WarningCircleIcon size={14} weight="fill" />
                        {error}
                    </p>
                )}
                <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                        type="checkbox"
                        checked={isDeveloper}
                        onChange={(e) => setIsDeveloper(e.target.checked)}
                    />
                    <CodeIcon size={14} />
                    Developer login (password only)
                </label>
                {!isDeveloper && (
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                            <span className="inline-flex items-center gap-1.5">
                                <UserCircleIcon size={14} />
                                Username
                            </span>
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-[#631732]/50 focus:border-[#631732]"
                            autoComplete="username"
                            required={!isDeveloper}
                        />
                    </div>
                )}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                        <span className="inline-flex items-center gap-1.5">
                            <LockIcon size={14} />
                            Password
                        </span>
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-[#631732]/50 focus:border-[#631732]"
                        autoComplete="current-password"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#631732] text-white py-2.5 rounded-lg font-medium hover:bg-[#631732]/90 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                >
                    <LockIcon size={14} weight="fill" />
                    {loading ? 'Signing in…' : 'Sign in'}
                </button>
            </form>
        </div>
    );
}
