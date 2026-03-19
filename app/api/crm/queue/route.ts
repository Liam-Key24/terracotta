import { NextRequest, NextResponse } from 'next/server';
import { requireCrm } from '../requireAuth';
import { listQueue, getQueueEntryById, removeFromQueue } from '../../reservation/_queue';
import { addReservation } from '../../reservation/_store';
import { createAlternative } from '../../reservation/_alternatives';
import { sendAlternativeOfferEmail, sendConfirmationEmail } from '../../reservation/sendConfirmationEmail';

const OWNER_EMAIL = process.env.OWNER_EMAIL ?? '';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? '';

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
    let entry = getQueueEntryById(queueId);

    if (action === 'approve') {
        if (!entry) return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });
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
        if (!entry) return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });
        removeFromQueue(entry.id);
        return NextResponse.json({ ok: true });
    }

    if (action === 'suggest-alternative') {
        const suggestedDate = typeof o.suggestedDate === 'string' ? o.suggestedDate.trim() : '';
        const suggestedTime = typeof o.suggestedTime === 'string' ? o.suggestedTime.trim() : '';
        const suggestedTableIds = Array.isArray(o.suggestedTableIds) ? (o.suggestedTableIds as string[]).filter((t) => typeof t === 'string') : undefined;
        // Fallback for stale queue UI state: allow suggest flow using entry data supplied by drawer.
        if (!entry) {
            const fallbackName = typeof o.entryName === 'string' ? o.entryName.trim() : '';
            const fallbackEmail = typeof o.entryEmail === 'string' ? o.entryEmail.trim() : '';
            const fallbackPhone = typeof o.entryPhone === 'string' ? o.entryPhone.trim() : '';
            const fallbackGuests = typeof o.entryGuests === 'string' ? o.entryGuests.trim() : '';
            const fallbackNotes = typeof o.entryNotes === 'string' ? o.entryNotes.trim() : undefined;
            if (fallbackName && fallbackEmail && fallbackPhone && fallbackGuests) {
                entry = {
                    id: queueId,
                    name: fallbackName,
                    email: fallbackEmail,
                    phone: fallbackPhone,
                    guests: fallbackGuests,
                    notes: fallbackNotes,
                    date: typeof o.entryDate === 'string' ? o.entryDate.trim() : suggestedDate,
                    time: typeof o.entryTime === 'string' ? o.entryTime.trim() : suggestedTime,
                    addedAt: new Date().toISOString(),
                };
            }
        }
        if (!entry) return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });
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
        if (!BASE_URL) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });
        }
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

    if (!entry) return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
