import { NextRequest, NextResponse } from 'next/server';
import { requireCrm } from '../requireAuth';
import { listQueue, getQueueEntryById, removeFromQueue } from '../../reservation/_queue';
import { addReservation } from '../../reservation/_store';
import { createAlternative } from '../../reservation/_alternatives';
import { sendAlternativeOfferEmail, sendConfirmationEmail } from '../../reservation/sendConfirmationEmail';

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'reservations@terracotta-acton.com';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
    const auth = requireCrm(request);
    if (auth instanceof NextResponse) return auth;
    const queue = listQueue();
    return NextResponse.json(queue);
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
    const action = typeof o.action === 'string' ? o.action : '';
    const queueId = typeof o.queueId === 'string' ? o.queueId : '';

    if (!queueId) return NextResponse.json({ error: 'Missing queueId' }, { status: 400 });

    const entry = getQueueEntryById(queueId);
    if (!entry) return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });

    if (action === 'approve') {
        const tableIds = Array.isArray(o.tableIds) ? (o.tableIds as string[]).filter((t) => typeof t === 'string') : undefined;
        const result = addReservation(entry.id, {
            name: entry.name,
            email: entry.email,
            phone: entry.phone,
            date: entry.date,
            time: entry.time,
            guests: entry.guests,
            notes: entry.notes,
            tableIds: tableIds?.length ? tableIds : undefined,
        });
        if (!result.success) {
            return NextResponse.json({ error: result.error ?? 'Slot full' }, { status: 400 });
        }
        removeFromQueue(entry.id);
        try {
            await sendConfirmationEmail({
                name: entry.name,
                email: entry.email,
                date: entry.date,
                time: entry.time,
                guests: entry.guests,
                specialRequests: entry.notes,
            });
        } catch (err) {
            console.error('[crm/queue] Send confirmation email failed:', err);
        }
        return NextResponse.json({ ok: true, record: result.record });
    }

    if (action === 'reject') {
        removeFromQueue(entry.id);
        return NextResponse.json({ ok: true });
    }

    if (action === 'suggest-alternative') {
        const suggestedDate = typeof o.suggestedDate === 'string' ? o.suggestedDate.trim() : '';
        const suggestedTime = typeof o.suggestedTime === 'string' ? o.suggestedTime.trim() : '';
        const suggestedTableIds = Array.isArray(o.suggestedTableIds) ? (o.suggestedTableIds as string[]).filter((t) => typeof t === 'string') : undefined;
        if (!suggestedDate || !suggestedTime) {
            return NextResponse.json({ error: 'Missing suggestedDate or suggestedTime' }, { status: 400 });
        }
        const token = createAlternative({
            name: entry.name,
            email: entry.email,
            phone: entry.phone,
            guests: entry.guests,
            notes: entry.notes,
            suggestedDate,
            suggestedTime,
            suggestedTableIds: suggestedTableIds?.length ? suggestedTableIds : undefined,
        });
        removeFromQueue(entry.id);
        const confirmUrl = `${BASE_URL}/reservation/confirm-alternative?token=${encodeURIComponent(token)}`;
        try {
            await sendAlternativeOfferEmail({
                name: entry.name,
                email: entry.email,
                suggestedDate,
                suggestedTime,
                confirmUrl,
            });
        } catch (err) {
            console.error('[crm/queue] Send alternative offer email failed:', err);
        }
        return NextResponse.json({ ok: true, token });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
