'use client';

import { usePathname } from 'next/navigation';
import NavBar from '../layout/navbar';
import Footer from '../layout/footer';

export default function ConditionalSiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    if (pathname?.startsWith('/crm')) {
        return <>{children}</>;
    }
    return (
        <>
            <NavBar />
            {children}
            <Footer />
        </>
    );
}
