import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
        const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - (payloadB64.length % 4)) % 4);
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
    if (!pathname.startsWith('/crm')) return NextResponse.next();

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

export const config = { matcher: ['/crm', '/crm/:path*'] };
