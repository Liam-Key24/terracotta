import { NextRequest, NextResponse } from 'next/server';
import { requireCrm } from '../requireAuth';
import { listQueue, getQueueEntryById, removeFromQueue } from '../../reservation/_queue';
import { addReservation } from '../../reservation/_store';
import { createAlternative } from '../../reservation/_alternatives';
import { sendAlternativeOfferEmail, sendConfirmationEmail } from '../../reservation/sendConfirmationEmail';

const OWNER_EMAIL = process.env.OWNER_EMAIL ?? '';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? '';

function buildEntryFromPayload(payload: Record<string, unknown>, queueId: string) {
    const fallbackName = typeof payload.entryName === 'string' ? payload.entryName.trim() : '';
    const fallbackEmail = typeof payload.entryEmail === 'string' ? payload.entryEmail.trim() : '';
    const fallbackPhone = typeof payload.entryPhone === 'string' ? payload.entryPhone.trim() : '';
    const fallbackGuests = typeof payload.entryGuests === 'string' ? payload.entryGuests.trim() : '';
    const fallbackNotes = typeof payload.entryNotes === 'string' ? payload.entryNotes.trim() : undefined;
    if (!fallbackName || !fallbackEmail || !fallbackPhone || !fallbackGuests) return null;
    return {
        id: queueId,
        name: fallbackName,
        email: fallbackEmail,
        phone: fallbackPhone,
        guests: fallbackGuests,
        notes: fallbackNotes,
        date: typeof payload.entryDate === 'string' ? payload.entryDate.trim() : '',
        time: typeof payload.entryTime === 'string' ? payload.entryTime.trim() : '',
        addedAt: new Date().toISOString(),
    };
}

function debugLog(hypothesisId: string, message: string, data: Record<string, unknown>) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/1fcc1fa4-567e-4c98-a901-f11466da8e45', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            runId: 'crm-queue-alternative-debug-1',
            hypothesisId,
            location: 'app/api/crm/queue/route.ts',
            message,
            data,
            timestamp: Date.now(),
        }),
    }).catch(() => {});
    // #endregion
}

export async function GET(request: NextRequest) {
    const auth = requireCrm(request);
    if (auth instanceof NextResponse) return auth;
    const queue = await listQueue();
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
    let entry = await getQueueEntryById(queueId);

    if (action === 'approve') {
        if (!entry) {
            entry = buildEntryFromPayload(o, queueId);
        }
        if (!entry) return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });
        const tableIds = Array.isArray(o.tableIds) ? (o.tableIds as string[]).filter((t) => typeof t === 'string') : undefined;
        const result = await addReservation(entry.id, {
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
        await removeFromQueue(entry.id);
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

    if (action === 'reject' || action === 'delete') {
        // Treat missing queue records as already-removed so CRM delete stays idempotent.
        if (!entry) {
            await removeFromQueue(queueId);
            return NextResponse.json({ ok: true });
        }
        await removeFromQueue(entry.id);
        return NextResponse.json({ ok: true });
    }

    if (action === 'suggest-alternative') {
        const suggestedDate = typeof o.suggestedDate === 'string' ? o.suggestedDate.trim() : '';
        const suggestedTime = typeof o.suggestedTime === 'string' ? o.suggestedTime.trim() : '';
        const suggestedTableIds = Array.isArray(o.suggestedTableIds) ? (o.suggestedTableIds as string[]).filter((t) => typeof t === 'string') : undefined;
        debugLog('A1', 'suggest-alternative entered', {
            queueId,
            hasEntry: Boolean(entry),
            hasSuggestedDate: Boolean(suggestedDate),
            hasSuggestedTime: Boolean(suggestedTime),
        });
        // Fallback for stale queue UI state: allow suggest flow using entry data supplied by drawer.
        if (!entry) {
            entry = buildEntryFromPayload(o, queueId);
            if (entry) {
                if (!entry.date) entry.date = suggestedDate;
                if (!entry.time) entry.time = suggestedTime;
                debugLog('A2', 'suggest-alternative rebuilt entry from payload', {
                    queueId,
                    hasFallbackName: Boolean(entry.name),
                    hasFallbackEmail: Boolean(entry.email),
                    hasFallbackPhone: Boolean(entry.phone),
                    hasFallbackGuests: Boolean(entry.guests),
                });
            }
        }
        if (!entry) {
            debugLog('A2', 'suggest-alternative missing entry after fallback', { queueId });
            return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });
        }
        if (!suggestedDate || !suggestedTime) {
            debugLog('A3', 'suggest-alternative missing date/time', { queueId, suggestedDate, suggestedTime });
            return NextResponse.json({ error: 'Missing suggestedDate or suggestedTime' }, { status: 400 });
        }
        try {
            const token = await createAlternative({
                name: entry.name,
                email: entry.email,
                phone: entry.phone,
                guests: entry.guests,
                notes: entry.notes,
                suggestedDate,
                suggestedTime,
                suggestedTableIds: suggestedTableIds?.length ? suggestedTableIds : undefined,
            });
            await removeFromQueue(entry.id);
            if (!BASE_URL) {
                debugLog('A4', 'suggest-alternative missing BASE_URL', { queueId });
                return NextResponse.json({ error: 'Server configuration error (NEXT_PUBLIC_BASE_URL missing)' }, { status: 503 });
            }
            const confirmUrl = `${BASE_URL}/reservation/confirm-alternative?token=${encodeURIComponent(token)}`;
            await sendAlternativeOfferEmail({
                name: entry.name,
                email: entry.email,
                suggestedDate,
                suggestedTime,
                confirmUrl,
            });
            debugLog('A5', 'suggest-alternative email sent', { queueId, hasConfirmUrl: Boolean(confirmUrl) });
            return NextResponse.json({ ok: true, token });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'unknown';
            console.error('[crm/queue] suggest-alternative failed:', err);
            debugLog('A6', 'suggest-alternative failed', {
                queueId,
                error: message,
            });
            return NextResponse.json({ error: `Failed to send alternative offer: ${message}` }, { status: 500 });
        }
    }

    if (!entry) return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
