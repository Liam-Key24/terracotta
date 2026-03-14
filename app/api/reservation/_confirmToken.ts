import { createHmac } from 'node:crypto';

const SECRET = process.env.CRM_SECRET ?? process.env.ADMIN_SECRET ?? '';

/** Sign a confirmation payload and return token string (payloadB64.sig). Returns null if SECRET not set. */
export function signConfirmationToken(payload: object): string | null {
    if (!SECRET) return null;
    const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
    const sig = createHmac('sha256', SECRET).update(payloadB64).digest('base64url');
    return `${payloadB64}.${sig}`;
}

/** Verify HMAC-SHA256 signed token and decode payload. Only signed tokens accepted; no legacy unsigned. */
export function verifyConfirmationToken(token: string): object | null {
    if (!SECRET || !token || token.length > 8000) return null;
    const decoded = decodeURIComponent(token);
    if (!decoded.includes('.')) return null;
    const [payloadB64, sig] = decoded.split('.');
    if (!payloadB64 || !sig) return null;
    const expectedSig = createHmac('sha256', SECRET).update(payloadB64).digest('base64url');
    if (sig !== expectedSig) return null;
    try {
        const json = Buffer.from(payloadB64, 'base64url').toString('utf-8');
        return JSON.parse(json) as object;
    } catch {
        return null;
    }
}
