import { createHmac } from 'node:crypto';

const SECRET = process.env.CRM_SECRET ?? process.env.ADMIN_SECRET ?? '';

/** Confirmation / approve links expire after 48 hours. */
export const CONFIRM_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

export type ConfirmTokenPayload = Record<string, unknown> & {
    exp: number;
    queueId?: string;
};

export type VerifyConfirmationTokenResult =
    | { ok: true; payload: ConfirmTokenPayload }
    | { ok: false; reason: 'invalid' | 'expired' };

/** Sign a confirmation payload and return token string (payloadB64.sig). Returns null if SECRET not set. */
export function signConfirmationToken(payload: object): string | null {
    if (!SECRET) return null;
    const withExp: ConfirmTokenPayload = {
        ...(payload as Record<string, unknown>),
        exp: Date.now() + CONFIRM_TOKEN_TTL_MS,
    };
    const payloadB64 = Buffer.from(JSON.stringify(withExp), 'utf-8').toString('base64url');
    const sig = createHmac('sha256', SECRET).update(payloadB64).digest('base64url');
    return `${payloadB64}.${sig}`;
}

/** Verify HMAC-SHA256 signed token, require exp, reject expired. */
export function verifyConfirmationToken(token: string): VerifyConfirmationTokenResult {
    if (!SECRET || !token || token.length > 8000) return { ok: false, reason: 'invalid' };
    const decoded = decodeURIComponent(token);
    if (!decoded.includes('.')) return { ok: false, reason: 'invalid' };
    const [payloadB64, sig] = decoded.split('.');
    if (!payloadB64 || !sig) return { ok: false, reason: 'invalid' };
    const expectedSig = createHmac('sha256', SECRET).update(payloadB64).digest('base64url');
    if (sig !== expectedSig) return { ok: false, reason: 'invalid' };
    try {
        const json = Buffer.from(payloadB64, 'base64url').toString('utf-8');
        const payload = JSON.parse(json) as Record<string, unknown>;
        if (typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)) {
            return { ok: false, reason: 'invalid' };
        }
        if (Date.now() > payload.exp) {
            return { ok: false, reason: 'expired' };
        }
        return { ok: true, payload: payload as ConfirmTokenPayload };
    } catch {
        return { ok: false, reason: 'invalid' };
    }
}
