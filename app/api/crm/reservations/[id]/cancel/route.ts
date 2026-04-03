import { NextRequest, NextResponse } from 'next/server';
import { requireCrm } from '../../../requireAuth';
import { cancelReservation, getMergedReservations } from '../../../../reservation/_store';

export async function POST(
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
    const reason = typeof o.reason === 'string' ? o.reason.trim() : '';
    if (!reason) {
        return NextResponse.json({ error: 'Cancellation reason is required' }, { status: 400 });
    }

    let result = await cancelReservation(id, reason);
    if (!result.success && result.error === 'Reservation not found') {
        // Fallback for records created through alternative-confirmation flows where ID mismatch can occur across instances.
        const fallbackName = typeof o.name === 'string' ? o.name.trim() : '';
        const fallbackEmail = typeof o.email === 'string' ? o.email.trim() : '';
        const fallbackDate = typeof o.date === 'string' ? o.date.trim() : '';
        const fallbackTime = typeof o.time === 'string' ? o.time.trim() : '';
        const fallbackGuests = typeof o.guests === 'string' ? o.guests.trim() : '';

        if (fallbackName && fallbackDate && fallbackTime) {
            const all = await getMergedReservations();
            const candidate = all.find((entry) => {
                if (entry.name !== fallbackName) return false;
                if (entry.date !== fallbackDate || entry.time !== fallbackTime) return false;
                if (fallbackEmail && entry.email !== fallbackEmail) return false;
                if (fallbackGuests && entry.guests !== fallbackGuests) return false;
                return true;
            });
            if (candidate) {
                result = await cancelReservation(candidate.id, reason);
            }
        }
    }
    if (!result.success) {
        return NextResponse.json({ error: result.error ?? 'Unable to cancel booking' }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        cancelled: result.cancelled,
        cancellation: result.record,
    });
}
