import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Flip to false (or set MAINTENANCE_MODE=false) after SMTP is fixed. */
const MAINTENANCE_MODE =
    process.env.MAINTENANCE_MODE === 'false' ? false : true;

const COOKIE_NAME = 'crm_session';
const SECRET = process.env.CRM_SECRET ?? process.env.ADMIN_SECRET ?? '';

async function verifyCookie(value: string): Promise<{ role: string } | null> {
    if (!SECRET || !value || !value.includes('.')) return null;
    const [payloadB64, sig] = value.split('.');
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sigBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(payloadB64)
    );
    const expectedSig = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    if (sig !== expectedSig) return null;
    try {
        const base64 =
            payloadB64.replace(/-/g, '+').replace(/_/g, '/') +
            '=='.slice(0, (4 - (payloadB64.length % 4)) % 4);
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const payload = JSON.parse(new TextDecoder().decode(bytes));
        if (payload.exp && payload.exp > Date.now()) return { role: payload.role };
    } catch {
        // ignore
    }
    return null;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Staff CRM stays available for phone bookings during maintenance
    if (pathname.startsWith('/crm')) {
        if (pathname === '/crm' || pathname === '/crm/') {
            const cookie = request.cookies.get(COOKIE_NAME)?.value;
            const session = cookie ? await verifyCookie(cookie) : null;
            if (session) {
                const url = request.nextUrl.clone();
                url.pathname = '/crm/dashboard';
                return NextResponse.redirect(url);
            }
            return NextResponse.next();
        }

        const cookie = request.cookies.get(COOKIE_NAME)?.value;
        const session = cookie ? await verifyCookie(cookie) : null;
        if (!session) {
            const url = request.nextUrl.clone();
            url.pathname = '/crm';
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    if (pathname.startsWith('/api/crm')) {
        return NextResponse.next();
    }

    if (!MAINTENANCE_MODE) {
        return NextResponse.next();
    }

    if (pathname.startsWith('/api/')) {
        return NextResponse.json(
            { error: 'Site under maintenance. Please call 020 4629 8759 to book.' },
            { status: 503 }
        );
    }

    if (pathname === '/maintenance') {
        return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
};
