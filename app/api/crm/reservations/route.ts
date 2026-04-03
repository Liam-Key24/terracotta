import { NextRequest, NextResponse } from 'next/server';
import { requireCrm } from '../requireAuth';
import { getMergedReservations, addReservation } from '../../reservation/_store';
import { createHash } from 'node:crypto';

export async function GET(request: NextRequest) {
    const auth = requireCrm(request);
    if (auth instanceof NextResponse) return auth;
    const list = await getMergedReservations();
    return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
    const auth = requireCrm(request);
    if (auth instanceof NextResponse) return auth;
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const o = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
    const name = String(o.name ?? '').trim();
    const email = String(o.email ?? '').trim();
    const phone = String(o.phone ?? '').trim();
    const date = String(o.date ?? '').trim();
    const time = String(o.time ?? '').trim();
    const guests = String(o.guests ?? '2').trim();
    const notes = typeof o.notes === 'string' ? o.notes.trim() : undefined;
    const tableIds = Array.isArray(o.tableIds) ? (o.tableIds as string[]).filter((t) => typeof t === 'string') : undefined;
    if (!name || !date || !time) {
        return NextResponse.json({ error: 'Missing name, date or time' }, { status: 400 });
    }
    const id = createHash('sha256').update(`${Date.now()}-${name}-${email}`).digest('hex');
    const result = await addReservation(id, {
        name,
        email,
        phone,
        date,
        time,
        guests,
        notes,
        tableIds,
    });
    if (!result.success) {
        return NextResponse.json({ error: result.error ?? 'Failed to add' }, { status: 400 });
    }
    return NextResponse.json(result.record);
}
