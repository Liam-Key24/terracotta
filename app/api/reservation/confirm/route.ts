import { NextRequest, NextResponse } from 'next/server';
import { asTrimmedString, escapeHtml } from '../../_utils';
import { addReservation } from '../_store';
import { getQueueEntryById, removeFromQueue, type QueueEntry } from '../_queue';
import { sendConfirmationEmail } from '../sendConfirmationEmail';
import { verifyConfirmationToken, type ConfirmTokenPayload } from '../_confirmToken';

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

const BASE_CRM_URL = process.env.BASE_CRM_URL ?? '';

function htmlErrorPage(title: string, message: string, status: number): NextResponse {
    return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Error</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .error { color: #dc2626; }
    </style>
</head>
<body>
    <h1 class="error">${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
</body>
</html>`,
        { status, headers: { 'Content-Type': 'text/html' } }
    );
}

const approvePromptPage = (
    token: string,
    safeFormData: { name: string; date: string; time: string; guests: string; email: string }
) =>
    `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Approve reservation</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
        .container { max-width: 400px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #631732 0%, #55122b 100%); color: white; padding: 20px; border-radius: 12px 12px 0 0; margin: -40px -40px 24px -40px; }
        .header h1 { margin: 0; font-size: 20px; }
        .details { text-align: left; background: #fafafa; padding: 16px; border-radius: 8px; margin: 16px 0; font-size: 14px; }
        .detail-row { padding: 6px 0; border-bottom: 1px solid #ececec; }
        .detail-row:last-child { border-bottom: none; }
        .approve-btn { display: inline-block; background: #631732; color: #ffffff !important; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px; margin-top: 16px; cursor: pointer; }
        .approve-btn:hover { background: #55122b; }
        .sub { color:#666;font-size:14px;margin-top:20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>Approve reservation</h1></div>
        <p>Review the booking details, then approve to add it to the CRM.</p>
        <div class="details">
            <div class="detail-row"><strong>Guest:</strong> ${escapeHtml(safeFormData.name)}</div>
            <div class="detail-row"><strong>Email:</strong> ${escapeHtml(safeFormData.email)}</div>
            <div class="detail-row"><strong>Date:</strong> ${escapeHtml(safeFormData.date)}</div>
            <div class="detail-row"><strong>Time:</strong> ${escapeHtml(safeFormData.time)}</div>
            <div class="detail-row"><strong>Guests:</strong> ${escapeHtml(safeFormData.guests)}</div>
        </div>
        <form method="POST" action="">
            <input type="hidden" name="token" value="${escapeHtml(token)}" />
            <button type="submit" class="approve-btn">Approve</button>
        </form>
        <p class="sub">This link expires 48 hours after it was created.</p>
    </div>
</body>
</html>`;

const approveSuccessPage = (
    safeFormData: { name: string; date: string; time: string; guests: string; email: string },
    crmUrl: string
) =>
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

function extractTokenFromUrl(parsedUrl: URL): string | null {
    const { searchParams } = parsedUrl;
    let token = searchParams.get('token');
    if (!token) {
        const malformedTokenKey = Array.from(searchParams.keys()).find((k) => k.startsWith('token='));
        if (malformedTokenKey) {
            token = malformedTokenKey.slice('token='.length);
            console.warn('[reservation/confirm] recovered token from malformed query key');
            debugLog('H9', 'confirm recovered token from malformed query key', {
                malformedKeyLength: malformedTokenKey.length,
                recoveredTokenLength: token.length,
            });
        }
    }
    if (!token) {
        const rawQuery = parsedUrl.search.startsWith('?') ? parsedUrl.search.slice(1) : parsedUrl.search;
        const decodedRawQuery = decodeURIComponent(rawQuery);
        if (decodedRawQuery.startsWith('token=')) {
            token = decodedRawQuery.slice('token='.length);
            console.warn('[reservation/confirm] recovered token from raw decoded query');
            debugLog('H9', 'confirm recovered token from raw decoded query', {
                rawQueryLength: rawQuery.length,
                recoveredTokenLength: token.length,
            });
        } else {
            debugLog('H9', 'confirm token recovery failed', {
                keyCount: Array.from(searchParams.keys()).length,
                rawQueryLength: rawQuery.length,
                hasEqualsInRawQuery: decodedRawQuery.includes('='),
            });
        }
    }
    return token;
}

function safeBookingFromEntry(entry: QueueEntry) {
    return {
        name: entry.name,
        email: entry.email,
        date: entry.date,
        time: entry.time,
        guests: entry.guests,
    };
}

function parseTokenOrError(token: string | null):
    | { ok: true; token: string; payload: ConfirmTokenPayload }
    | { ok: false; response: NextResponse } {
    if (!token || token.length > 8000) {
        return {
            ok: false,
            response: htmlErrorPage('Invalid confirmation link', 'The confirmation link is invalid or missing.', 400),
        };
    }
    const verified = verifyConfirmationToken(token);
    if (!verified.ok) {
        if (verified.reason === 'expired') {
            return {
                ok: false,
                response: htmlErrorPage(
                    'Confirmation link expired',
                    'This confirmation link has expired. Please request a new reservation approval email.',
                    400
                ),
            };
        }
        return {
            ok: false,
            response: htmlErrorPage(
                'Invalid confirmation token',
                'The confirmation token is invalid or corrupted.',
                400
            ),
        };
    }
    return { ok: true, token, payload: verified.payload };
}

async function resolveQueueEntry(payload: ConfirmTokenPayload): Promise<
    | { ok: true; entry: QueueEntry; queueId: string }
    | { ok: false; response: NextResponse }
> {
    const queueId = asTrimmedString(payload.queueId);
    if (!queueId) {
        return {
            ok: false,
            response: htmlErrorPage(
                'Invalid confirmation link',
                'This confirmation link is missing booking scope and cannot be used.',
                400
            ),
        };
    }
    const entry = await getQueueEntryById(queueId);
    if (!entry) {
        return {
            ok: false,
            response: htmlErrorPage(
                'Already processed or no longer available',
                'This reservation request is no longer in the queue. It may already have been approved or removed.',
                404
            ),
        };
    }
    return { ok: true, entry, queueId };
}

/** GET validates the token and shows an Approve form. Does not mutate queue or reservations. */
export async function GET(request: NextRequest) {
    try {
        const parsedUrl = new URL(request.url);
        const token = extractTokenFromUrl(parsedUrl);
        console.log('[reservation/confirm] GET entered', { hasToken: Boolean(token), tokenLength: token?.length ?? 0 });
        debugLog('H1', 'confirm GET entered', { hasToken: Boolean(token), tokenLength: token?.length ?? 0 });

        const parsed = parseTokenOrError(token);
        if (!parsed.ok) return parsed.response;

        const resolved = await resolveQueueEntry(parsed.payload);
        if (!resolved.ok) return resolved.response;

        return new NextResponse(approvePromptPage(parsed.token, safeBookingFromEntry(resolved.entry)), {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
        });
    } catch (error) {
        console.error('Error rendering confirmation page:', error);
        return htmlErrorPage(
            'Error Confirming Reservation',
            'There was an error processing the confirmation. Please try again or contact support.',
            500
        );
    }
}

/** POST performs approval: add reservation, remove queue entry, email guest. */
export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type') ?? '';
        let token: string | null = null;
        if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
            const form = await request.formData();
            const raw = form.get('token');
            token = typeof raw === 'string' ? raw : null;
        } else {
            try {
                const body = (await request.json()) as { token?: unknown };
                token = typeof body.token === 'string' ? body.token : null;
            } catch {
                token = null;
            }
        }

        console.log('[reservation/confirm] POST entered', { hasToken: Boolean(token), tokenLength: token?.length ?? 0 });
        debugLog('H1', 'confirm POST entered', { hasToken: Boolean(token), tokenLength: token?.length ?? 0 });

        const parsed = parseTokenOrError(token);
        if (!parsed.ok) return parsed.response;

        const resolved = await resolveQueueEntry(parsed.payload);
        if (!resolved.ok) return resolved.response;

        const { entry, queueId } = resolved;
        const result = await addReservation(entry.id, {
            name: entry.name,
            email: entry.email,
            phone: entry.phone,
            date: entry.date,
            time: entry.time,
            guests: entry.guests,
            notes: entry.notes,
            promoCode: entry.promoCode,
        });
        console.log('[reservation/confirm] addReservation result', {
            queueId,
            success: result.success,
            error: result.error ?? null,
        });
        debugLog('H3', 'confirm addReservation result', {
            queueId,
            success: result.success,
            error: result.error ?? null,
        });

        if (!result.success) {
            if (result.error === 'Already exists') {
                return htmlErrorPage(
                    'Already processed or no longer available',
                    'This reservation was already confirmed.',
                    400
                );
            }
            return htmlErrorPage('Could not confirm', result.error || 'Time slot may be full.', 400);
        }

        await removeFromQueue(queueId);
        debugLog('H4', 'confirm queue removal attempted', { queueId });

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
            debugLog('H5', 'confirm guest email send failed', {
                queueId,
                error: err instanceof Error ? err.message : 'unknown',
            });
        }

        const crmUrl = BASE_CRM_URL.trim();
        if (!crmUrl) {
            return htmlErrorPage('Server configuration error', 'BASE_CRM_URL is missing.', 503);
        }

        return new NextResponse(approveSuccessPage(safeBookingFromEntry(entry), crmUrl), {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
        });
    } catch (error) {
        console.error('Error confirming reservation:', error);
        return htmlErrorPage(
            'Error Confirming Reservation',
            'There was an error processing the confirmation. Please try again or contact support.',
            500
        );
    }
}
