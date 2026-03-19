import { NextRequest, NextResponse } from 'next/server';
import { requireCrm } from '../../../requireAuth';
import { cancelReservationWithKvFallback } from '../../../../reservation/_store';

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

    const result = await cancelReservationWithKvFallback(id, reason);
    if (!result.success) {
        return NextResponse.json({ error: result.error ?? 'Unable to cancel booking' }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        cancelled: result.cancelled,
        cancellation: result.record,
    });
}
