import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'node:crypto';
import { requireDeveloper } from '../../requireAuth';

const DEVELOPER_PASSWORD = process.env.DEVELOPER_PASSWORD || '?611|C(9t4Oh';
const REVEAL_SECRET = process.env.CRM_SECRET || process.env.ADMIN_SECRET || 'terracotta-crm-secret-change-me';
const REVEAL_TTL_MS = 2 * 60 * 1000; // 2 minutes

export async function POST(request: NextRequest) {
    const auth = requireDeveloper(request);
    if (auth instanceof NextResponse) return auth;
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }
    const password = typeof (body as { password?: string }).password === 'string' ? (body as { password: string }).password : '';
    if (password !== DEVELOPER_PASSWORD) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    const exp = Date.now() + REVEAL_TTL_MS;
    const payload = JSON.stringify({ exp });
    const payloadB64 = Buffer.from(payload, 'utf-8').toString('base64url');
    const sig = createHmac('sha256', REVEAL_SECRET).update(payloadB64).digest('base64url');
    const token = `${payloadB64}.${sig}`;
    return NextResponse.json({ token });
}
