import { NextRequest, NextResponse } from 'next/server';
import { asTrimmedString, clampLength, escapeHtml, escapeHtmlWithBreaks, isValidEmail } from '../../_utils';
import { addReservation, confirmationId, getAllReservations } from '../_store';
import { addToQueue, getQueueEntryById, listQueue, removeFromQueue } from '../_queue';
import { sendConfirmationEmail } from '../sendConfirmationEmail';
import { verifyConfirmationToken } from '../_confirmToken';

const successPage = (message: string, safeFormData: { name: string; date: string; time: string; guests: string; email: string }) =>
    `<!DOCTYPE html>
<html>
<head>
    <title>Reservation</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .success { color: #16a34a; font-size: 48px; margin-bottom: 20px; }
        h1 { color: #16a34a; margin-bottom: 20px; }
        .details { text-align: left; background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { padding: 8px 0; border-bottom: 1px solid #e5e5e5; }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #16a34a; display: inline-block; width: 120px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="success">✓</div>
        <h1>${escapeHtml(message)}</h1>
        <p>${message.includes('Already') ? 'You can close this page.' : 'The request has been queued for confirmation. We will confirm with the guest soon.'}</p>
        <div class="details">
            <div class="detail-row"><span class="label">Guest:</span><span>${escapeHtml(safeFormData.name)}</span></div>
            <div class="detail-row"><span class="label">Date:</span><span>${escapeHtml(safeFormData.date)}</span></div>
            <div class="detail-row"><span class="label">Time:</span><span>${escapeHtml(safeFormData.time)}</span></div>
            <div class="detail-row"><span class="label">Guests:</span><span>${escapeHtml(safeFormData.guests)}</span></div>
        </div>
    </div>
</body>
</html>`;

const approveSuccessPage = (safeFormData: { name: string; date: string; time: string; guests: string; email: string }, crmUrl: string) =>
    `<!DOCTYPE html>
<html>
<head>
    <title>Reservation Confirmed</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
        .container { max-width: 400px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #631732 0%, #55122b 100%); color: white; padding: 20px; border-radius: 12px 12px 0 0; margin: -40px -40px 24px -40px; }
        .header h1 { margin: 0; font-size: 20px; }
        .success { color: #631732; font-size: 18px; margin-bottom: 16px; }
        .details { text-align: left; background: #fafafa; padding: 16px; border-radius: 8px; margin: 16px 0; font-size: 14px; }
        .detail-row { padding: 6px 0; }
        .crm-btn { display: inline-block; background: #631732; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px; margin-top: 16px; }
        .crm-btn:hover { background: #55122b; color: #ffffff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>Reservation confirmed</h1></div>
        <p class="success">A confirmation email has been sent to the guest. This reservation is now in the CRM.</p>
        <div class="details">
            <div class="detail-row"><strong>Guest:</strong> ${escapeHtml(safeFormData.name)}</div>
            <div class="detail-row"><strong>Date:</strong> ${escapeHtml(safeFormData.date)}</div>
            <div class="detail-row"><strong>Time:</strong> ${escapeHtml(safeFormData.time)}</div>
            <div class="detail-row"><strong>Guests:</strong> ${escapeHtml(safeFormData.guests)}</div>
        </div>
        <a href="${escapeHtml(crmUrl)}" class="crm-btn" style="color:#ffffff !important; text-decoration:none;">Open CRM</a>
        <p style="color:#666;font-size:14px;margin-top:20px;">You can close this page.</p>
    </div>
</body>
</html>`;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token || token.length > 8000) {
            return new NextResponse(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Error</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .error { color: #dc2626; }
                    </style>
                </head>
                <body>
                    <h1 class="error">Invalid confirmation link</h1>
                    <p>The confirmation link is invalid or missing.</p>
                </body>
                </html>
            `, {
                status: 400,
                headers: { 'Content-Type': 'text/html' },
            });
        }

        const formData = verifyConfirmationToken(token);
        if (!formData || typeof formData !== 'object') {
            return new NextResponse(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Error</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .error { color: #dc2626; }
                    </style>
                </head>
                <body>
                    <h1 class="error">Invalid confirmation token</h1>
                    <p>The confirmation token is invalid or corrupted.</p>
                </body>
            </html>
            `, {
                status: 400,
                headers: { 'Content-Type': 'text/html' },
            });
        }

        const raw = formData as Record<string, unknown>;
        const queueIdFromToken = typeof raw.queueId === 'string' ? raw.queueId : '';
        const name = asTrimmedString(raw.name);
        const email = asTrimmedString(raw.email);
        const phone = asTrimmedString(raw.phone);
        const date = asTrimmedString(raw.date);
        const time = asTrimmedString(raw.time);
        const guests = asTrimmedString(raw.guests);
        const specialRequestsRaw = asTrimmedString(raw.specialRequests);

        // Approve-from-email flow: token includes queueId → add to reservations, remove from queue, email guest
        if (queueIdFromToken) {
            const entry = getQueueEntryById(queueIdFromToken);
            if (!entry) {
                return new NextResponse(
                    `<!DOCTYPE html><html><head><title>Error</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:50px;}.error{color:#dc2626;}</style></head>
<body><h1 class="error">Request not found</h1><p>This reservation request is no longer in the queue (it may have been confirmed or declined already).</p></body></html>`,
                    { status: 404, headers: { 'Content-Type': 'text/html' } }
                );
            }
            const result = addReservation(entry.id, {
                name: entry.name,
                email: entry.email,
                phone: entry.phone,
                date: entry.date,
                time: entry.time,
                guests: entry.guests,
                notes: entry.notes,
            });
            if (!result.success) {
                return new NextResponse(
                    `<!DOCTYPE html><html><head><title>Error</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:50px;}.error{color:#dc2626;}</style></head>
<body><h1 class="error">Could not confirm</h1><p>${escapeHtml(result.error || 'Time slot may be full.')}</p></body></html>`,
                    { status: 400, headers: { 'Content-Type': 'text/html' } }
                );
            }
            removeFromQueue(queueIdFromToken);
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
                console.error('[reservation/confirm] Send confirmation email failed:', err);
            }
            const safeFormData = {
                name: entry.name,
                email: entry.email,
                date: entry.date,
                time: entry.time,
                guests: entry.guests,
            };
            const origin = request.headers.get('origin') || new URL(request.url).origin;
            const crmUrl = `${origin}/crm`;
            return new NextResponse(approveSuccessPage(safeFormData, crmUrl), {
                status: 200,
                headers: { 'Content-Type': 'text/html' },
            });
        }

        if (!name || !email || !phone || !date || !time || !guests) {
            return new NextResponse(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Error</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .error { color: #dc2626; }
                    </style>
                </head>
                <body>
                    <h1 class="error">Invalid reservation data</h1>
                    <p>The reservation data is incomplete.</p>
                </body>
                </html>
            `, {
                status: 400,
                headers: { 'Content-Type': 'text/html' },
            });
        }
        if (!isValidEmail(email)) {
            return new NextResponse(
                '<!DOCTYPE html><html><head><title>Error</title></head><body><h1 class="error">Invalid email</h1><p>The reservation email is invalid.</p></body></html>',
                { status: 400, headers: { 'Content-Type': 'text/html' } }
            );
        }

        const safeFormData = {
            name: clampLength(name, 100),
            email: clampLength(email, 254),
            phone: clampLength(phone, 50),
            date: clampLength(date, 20),
            time: clampLength(time, 20),
            guests: clampLength(guests, 10),
            ...(specialRequestsRaw ? { specialRequests: clampLength(specialRequestsRaw, 2000) } : {}),
        };

        const id = confirmationId(token);
        const inQueue = listQueue().some((e) => e.id === id);
        const inReservations = getAllReservations().some((r) => r.id === id);
        if (inQueue || inReservations) {
            return new NextResponse(successPage('Already processed', safeFormData), {
                status: 200,
                headers: { 'Content-Type': 'text/html' },
            });
        }

        const { added } = addToQueue({
            id,
            name: safeFormData.name,
            email: safeFormData.email,
            phone: safeFormData.phone,
            date: safeFormData.date,
            time: safeFormData.time,
            guests: safeFormData.guests,
            notes: safeFormData.specialRequests,
            addedAt: new Date().toISOString(),
        });

        return new NextResponse(
            successPage(added ? 'Request received' : 'Already processed', safeFormData),
            { status: 200, headers: { 'Content-Type': 'text/html' } }
        );
    } catch (error) {
        console.error('Error confirming reservation:', error);
        return new NextResponse(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Error</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .error { color: #dc2626; }
                </style>
            </head>
            <body>
                <h1 class="error">Error Confirming Reservation</h1>
                <p>There was an error processing the confirmation. Please try again or contact support.</p>
            </body>
            </html>
        `, {
            status: 500,
            headers: { 'Content-Type': 'text/html' },
        });
    }
}

