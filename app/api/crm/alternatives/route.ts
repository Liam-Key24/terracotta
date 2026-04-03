import { NextRequest, NextResponse } from 'next/server';
import { getAlternativeByToken, removeAlternative } from '../../reservation/_alternatives';
import { addReservation, countForSlot } from '../../reservation/_store';
import { sendConfirmationEmail, sendOwnerAlternativeConfirmedEmail } from '../../reservation/sendConfirmationEmail';

const OWNER_EMAIL = process.env.OWNER_EMAIL ?? '';

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    const entry = await getAlternativeByToken(token);
    if (!entry) return NextResponse.json({ error: 'Not found or expired' }, { status: 404 });
    return NextResponse.json(entry);
}

export async function POST(request: NextRequest) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const token = typeof (body as { token?: string }).token === 'string' ? (body as { token: string }).token : '';
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    const entry = await getAlternativeByToken(token);
    if (!entry) return NextResponse.json({ error: 'Not found or expired' }, { status: 404 });

    const count = await countForSlot(entry.suggestedDate, entry.suggestedTime);
    if (count >= 5) {
        return NextResponse.json({ error: 'Time slot full' }, { status: 400 });
    }

    const id = `alt-${token.slice(0, 16)}-${Date.now()}`;
    const result = await addReservation(id, {
        name: entry.name,
        email: entry.email,
        phone: entry.phone,
        date: entry.suggestedDate,
        time: entry.suggestedTime,
        guests: entry.guests,
        notes: entry.notes,
        tableIds: entry.suggestedTableIds,
    });
    if (!result.success) {
        return NextResponse.json({ error: result.error ?? 'Failed' }, { status: 400 });
    }
    await removeAlternative(token);
    try {
        await sendConfirmationEmail({
            name: entry.name,
            email: entry.email,
            date: entry.suggestedDate,
            time: entry.suggestedTime,
            guests: entry.guests,
            specialRequests: entry.notes,
        });
    } catch (err) {
        console.error('[alternatives] Send confirmation email failed:', err);
    }
    try {
        await sendOwnerAlternativeConfirmedEmail({
            ownerEmail: OWNER_EMAIL,
            name: entry.name,
            email: entry.email,
            date: entry.suggestedDate,
            time: entry.suggestedTime,
            guests: entry.guests,
        });
    } catch (err) {
        console.error('[alternatives] Send owner alternative-confirmed email failed:', err);
    }
    return NextResponse.json({ ok: true, record: result.record });
}
