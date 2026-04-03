import { NextRequest, NextResponse } from 'next/server';
import { requireCrm } from '../../requireAuth';
import { countForSlot, getMergedReservationById, updateReservation } from '../../../reservation/_store';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = requireCrm(request);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const o = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
    const patch: {
        date?: string;
        time?: string;
        tableIds?: string[];
        name?: string;
        email?: string;
        phone?: string;
        guests?: string;
        notes?: string;
    } = {};
    if (typeof o.date === 'string') patch.date = o.date.trim();
    if (typeof o.time === 'string') patch.time = o.time.trim();
    if (Array.isArray(o.tableIds)) patch.tableIds = (o.tableIds as string[]).filter((t) => typeof t === 'string');
    if (typeof o.name === 'string') patch.name = o.name.trim();
    if (typeof o.email === 'string') patch.email = o.email.trim();
    if (typeof o.phone === 'string') patch.phone = o.phone.trim();
    if (typeof o.guests === 'string') patch.guests = o.guests.trim();
    if (typeof o.notes === 'string') {
        const notes = o.notes.trim();
        patch.notes = notes;
    }

    const existing = await getMergedReservationById(id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const newDate = patch.date ?? existing.date;
    const newTime = patch.time ?? existing.time;
    const count = await countForSlot(newDate, newTime);
    const alreadyInSlot = existing.date === newDate && existing.time === newTime;
    if (!alreadyInSlot && count >= 5) {
        return NextResponse.json({ error: 'Time slot full' }, { status: 400 });
    }

    const updated = await updateReservation(id, patch);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
}
