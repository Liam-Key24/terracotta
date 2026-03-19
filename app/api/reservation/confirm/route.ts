import { NextRequest, NextResponse } from 'next/server';
import { asTrimmedString, clampLength, escapeHtml, escapeHtmlWithBreaks, isValidEmail } from '../../_utils';
import { addReservation, confirmationId, getAllReservations } from '../_store';
import { addToQueue, getQueueEntryById, listQueue, removeFromQueue, type QueueEntry } from '../_queue';
import { sendConfirmationEmail } from '../sendConfirmationEmail';
import { verifyConfirmationToken } from '../_confirmToken';

function debugLog(hypothesisId: string, message: string, data: Record<string, unknown>) {
    fetch('http://127.0.0.1:7243/ingest/1fcc1fa4-567e-4c98-a901-f11466da8e45', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            runId: 'confirm-reject-debug-1',
            hypothesisId,
            location: 'app/api/reservation/confirm/route.ts',
            message,
            data,
            timestamp: Date.now(),
        }),
    }).catch(() => {});
}

const successPage = (message: string, safeFormData: { name: string; date: string; time: string; guests: string; email: string }) =>
    `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reservation</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
        .container { max-width: 400px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #631732 0%, #55122b 100%); color: white; padding: 20px; border-radius: 12px 12px 0 0; margin: -40px -40px 24px -40px; }
        .header h1 { margin: 0; font-size: 20px; }
        .success { color: #631732; font-size: 17px; margin-bottom: 16px; }
        .details { text-align: left; background: #fafafa; padding: 16px; border-radius: 8px; margin: 16px 0; font-size: 14px; }
        .detail-row { padding: 6px 0; border-bottom: 1px solid #ececec; }
        .detail-row:last-child { border-bottom: none; }
        .sub { color:#666;font-size:14px;margin-top:20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>${escapeHtml(message)}</h1></div>
        <p class="success">${message.includes('Already') ? 'This reservation was already processed.' : 'This request has been queued for confirmation.'}</p>
        <div class="details">
            <div class="detail-row"><strong>Guest:</strong> ${escapeHtml(safeFormData.name)}</div>
            <div class="detail-row"><strong>Date:</strong> ${escapeHtml(safeFormData.date)}</div>
            <div class="detail-row"><strong>Time:</strong> ${escapeHtml(safeFormData.time)}</div>
            <div class="detail-row"><strong>Guests:</strong> ${escapeHtml(safeFormData.guests)}</div>
        </div>
        <p class="sub">You can close this page.</p>
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
        .sub { color:#666;font-size:13px;margin-top:8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>Reservation confirmed</h1></div>
        <p class="success">Confirmed and added to CRM.</p>
        <div class="details">
            <div class="detail-row"><strong>Guest:</strong> ${escapeHtml(safeFormData.name)}</div>
            <div class="detail-row"><strong>Date:</strong> ${escapeHtml(safeFormData.date)}</div>
            <div class="detail-row"><strong>Time:</strong> ${escapeHtml(safeFormData.time)}</div>
            <div class="detail-row"><strong>Guests:</strong> ${escapeHtml(safeFormData.guests)}</div>
        </div>
        <a href="${escapeHtml(crmUrl)}" class="crm-btn" style="color:#ffffff !important; text-decoration:none;">Open CRM</a>
        <p style="color:#666;font-size:14px;margin-top:20px;">You can close this tab now.</p>
        <p class="sub">Attempting to close automatically...</p>
    </div>
    <script>
      (function () {
        try { window.close(); } catch (_) {}
      })();
    </script>
</body>
</html>`;

export async function GET(request: NextRequest) {
    try {
        const parsedUrl = new URL(request.url);
        const { searchParams } = parsedUrl;
        let token = searchParams.get('token');
        if (!token) {
            const malformedTokenKey = Array.from(searchParams.keys()).find((k) => k.startsWith('token='));
            if (malformedTokenKey) {
                token = malformedTokenKey.slice('token='.length);
                console.warn('[reservation/confirm] recovered token from malformed query key');
                // #region agent log
                debugLog('H9', 'confirm recovered token from malformed query key', {
                    malformedKeyLength: malformedTokenKey.length,
                    recoveredTokenLength: token.length,
                });
                // #endregion
            }
        }
        if (!token) {
            const rawQuery = parsedUrl.search.startsWith('?') ? parsedUrl.search.slice(1) : parsedUrl.search;
            const decodedRawQuery = decodeURIComponent(rawQuery);
            if (decodedRawQuery.startsWith('token=')) {
                token = decodedRawQuery.slice('token='.length);
                console.warn('[reservation/confirm] recovered token from raw decoded query');
                // #region agent log
                debugLog('H9', 'confirm recovered token from raw decoded query', {
                    rawQueryLength: rawQuery.length,
                    recoveredTokenLength: token.length,
                });
                // #endregion
            } else {
                // #region agent log
                debugLog('H9', 'confirm token recovery failed', {
                    keyCount: Array.from(searchParams.keys()).length,
                    rawQueryLength: rawQuery.length,
                    hasEqualsInRawQuery: decodedRawQuery.includes('='),
                });
                // #endregion
            }
        }
        console.log('[reservation/confirm] entered', { hasToken: Boolean(token), tokenLength: token?.length ?? 0 });
        // #region agent log
        debugLog('H1', 'confirm route entered', { hasToken: Boolean(token), tokenLength: token?.length ?? 0 });
        // #endregion

        if (!token || token.length > 8000) {
            console.warn('[reservation/confirm] invalid token in query', { hasToken: Boolean(token), tokenLength: token?.length ?? 0 });
            // #region agent log
            debugLog('H1', 'confirm rejected due to missing/oversized token', { hasToken: Boolean(token), tokenLength: token?.length ?? 0 });
            // #endregion
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
            console.warn('[reservation/confirm] token verification failed', { tokenLength: token.length });
            // #region agent log
            debugLog('H1', 'confirm token verification failed', { tokenLength: token.length });
            // #endregion
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
            let entry: QueueEntry | null = getQueueEntryById(queueIdFromToken);
            console.log('[reservation/confirm] queue lookup', { queueIdFromToken, foundQueueEntry: Boolean(entry) });
            // #region agent log
            debugLog('H2', 'confirm queue lookup result', { queueIdFromToken, foundQueueEntry: Boolean(entry) });
            // #endregion
            // On serverless (e.g. Vercel), queue is filesystem-local so confirm may hit a different instance with no queue file.
            // Fall back to token payload so the link still works.
            if (!entry) {
                if (!name || !email || !phone || !date || !time || !guests) {
                    return new NextResponse(
                        `<!DOCTYPE html><html><head><title>Error</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:50px;}.error{color:#dc2626;}</style></head>
<body><h1 class="error">Request not found</h1><p>This reservation request is no longer in the queue and the link data is incomplete.</p></body></html>`,
                        { status: 404, headers: { 'Content-Type': 'text/html' } }
                    );
                }
                entry = {
                    id: queueIdFromToken,
                    name,
                    email,
                    phone,
                    date,
                    time,
                    guests,
                    notes: specialRequestsRaw ?? undefined,
                    addedAt: new Date().toISOString(),
                };
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
            console.log('[reservation/confirm] addReservation result', { queueIdFromToken, success: result.success, error: result.error ?? null });
            // #region agent log
            debugLog('H3', 'confirm addReservation result', { queueIdFromToken, success: result.success, error: result.error ?? null });
            // #endregion
            if (!result.success) {
                if (result.error === 'Already exists') {
                    const safeFormData = { name: entry.name, email: entry.email, date: entry.date, time: entry.time, guests: entry.guests };
                    return new NextResponse(successPage('Already confirmed', safeFormData), {
                        status: 200,
                        headers: { 'Content-Type': 'text/html' },
                    });
                }
                return new NextResponse(
                    `<!DOCTYPE html><html><head><title>Error</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:50px;}.error{color:#dc2626;}</style></head>
<body><h1 class="error">Could not confirm</h1><p>${escapeHtml(result.error || 'Time slot may be full.')}</p></body></html>`,
                    { status: 400, headers: { 'Content-Type': 'text/html' } }
                );
            }
            removeFromQueue(queueIdFromToken);
            console.log('[reservation/confirm] removeFromQueue called', { queueIdFromToken });
            // #region agent log
            debugLog('H4', 'confirm queue removal attempted', { queueIdFromToken });
            // #endregion
            try {
                await sendConfirmationEmail({
                    name: entry.name,
                    email: entry.email,
                    date: entry.date,
                    time: entry.time,
                    guests: entry.guests,
                    specialRequests: entry.notes,
                });
                console.log('[reservation/confirm] customer confirmation email sent', {
                    queueIdFromToken,
                    hasRecipientEmail: Boolean(entry.email),
                });
                // #region agent log
                debugLog('H11', 'confirm customer email sent', {
                    queueIdFromToken,
                    hasRecipientEmail: Boolean(entry.email),
                });
                // #endregion
            } catch (err) {
                console.error('[reservation/confirm] Send confirmation email failed:', err);
                console.error('[reservation/confirm] customer email diagnostics', {
                    queueIdFromToken,
                    hasSmtpHost: Boolean(process.env.SMTP_HOST),
                    hasSmtpUser: Boolean(process.env.SMTP_USER),
                    hasSmtpPass: Boolean(process.env.SMTP_PASS),
                    hasOwnerEmail: Boolean(process.env.OWNER_EMAIL),
                });
                // #region agent log
                debugLog('H5', 'confirm guest email send failed', { queueIdFromToken, error: err instanceof Error ? err.message : 'unknown' });
                // #endregion
                // #region agent log
                debugLog('H11', 'confirm customer email diagnostics', {
                    queueIdFromToken,
                    hasSmtpHost: Boolean(process.env.SMTP_HOST),
                    hasSmtpUser: Boolean(process.env.SMTP_USER),
                    hasSmtpPass: Boolean(process.env.SMTP_PASS),
                    hasOwnerEmail: Boolean(process.env.OWNER_EMAIL),
                });
                // #endregion
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

