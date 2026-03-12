'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CrmLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
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
        { href: '/crm/stats', label: 'Stats' },
    ];
    if (role === 'developer') nav.push({ href: '/crm/developer', label: 'Developer' });

    return (
        <div className="min-h-screen bg-slate-100 flex">
            <aside className="w-56 bg-[#631732]/90 text-white flex flex-col shrink-0">
                <div className="p-4 border-b border-white/20">
                    <Link href="/crm/dashboard" className="font-semibold text-lg">
                        Terracotta CRM
                    </Link>
                </div>
                <nav className="p-2 flex-1">
                    {nav.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`block px-3 py-2 rounded mb-1 ${
                                pathname === href ? 'bg-white/20' : 'hover:bg-white/10'
                            }`}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
                <div className="p-2 border-t border-white/20">
                    <form action="/api/crm/logout" method="POST">
                        <button
                            type="submit"
                            className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm"
                        >
                            Log out
                        </button>
                    </form>
                </div>
            </aside>
            <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
    );
}
