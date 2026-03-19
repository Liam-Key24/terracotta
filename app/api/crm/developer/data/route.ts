import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getCrmSession } from '../../requireAuth';
import { getMergedReservations, listReservationCancellations } from '../../../reservation/_store';
import { listQueue } from '../../../reservation/_queue';

const REVEAL_SECRET = process.env.CRM_SECRET || process.env.ADMIN_SECRET || '';

function verifyRevealToken(token: string): boolean {
    if (!REVEAL_SECRET || !token || !token.includes('.')) return false;
    const [payloadB64, sig] = token.split('.');
    const expectedSig = createHmac('sha256', REVEAL_SECRET).update(payloadB64).digest('base64url');
    if (sig !== expectedSig) return false;
    try {
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
        return payload.exp && payload.exp > Date.now();
    } catch {
        return false;
    }
}

function readJsonFile(name: string): unknown {
    const path = join(process.cwd(), 'data', name);
    try {
        if (!existsSync(path)) return [];
        const raw = readFileSync(path, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest) {
    const session = getCrmSession(request);
    if (!session || session.role !== 'developer') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const revealToken = request.nextUrl.searchParams.get('reveal');
    if (!revealToken || !verifyRevealToken(revealToken)) {
        return NextResponse.json({ error: 'Reveal required' }, { status: 403 });
    }
    const reservations = await getMergedReservations();
    const cancellations = listReservationCancellations();
    const queue = listQueue();
    const alternatives = readJsonFile('reservation-alternatives.json');
    const tables = readJsonFile('tables.json');
    const response = NextResponse.json(
        { reservations, cancellations, queue, alternatives, tables },
        { headers: { 'Cache-Control': 'no-store' } }
    );
    return response;
}
