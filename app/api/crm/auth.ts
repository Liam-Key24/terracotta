import { createHmac } from 'node:crypto';

const COOKIE_NAME = 'crm_session';
const SECRET = process.env.CRM_SECRET ?? process.env.ADMIN_SECRET ?? '';
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export type Role = 'admin' | 'developer';

export function signCookie(role: Role): string | null {
    if (!SECRET) return null;
    const exp = Date.now() + EXPIRY_MS;
    const payload = JSON.stringify({ role, exp });
    const payloadB64 = Buffer.from(payload, 'utf-8').toString('base64url');
    const sig = createHmac('sha256', SECRET).update(payloadB64).digest('base64url');
    return `${payloadB64}.${sig}`;
}

export function verifyCookie(value: string): { role: Role; exp: number } | null {
    if (!SECRET || !value || !value.includes('.')) return null;
    const [payloadB64, sig] = value.split('.');
    const expectedSig = createHmac('sha256', SECRET).update(payloadB64).digest('base64url');
    if (sig !== expectedSig) return null;
    try {
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
        if (payload.exp && payload.exp > Date.now() && (payload.role === 'admin' || payload.role === 'developer')) {
            return { role: payload.role as Role, exp: payload.exp };
        }
    } catch {
        // ignore
    }
    return null;
}

export function getCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 24 * 60 * 60, // 24h in seconds
        path: '/',
    };
}

export { COOKIE_NAME, EXPIRY_MS };
