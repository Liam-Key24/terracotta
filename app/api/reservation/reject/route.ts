import { NextRequest, NextResponse } from 'next/server';
import { asTrimmedString, escapeHtml } from '../../_utils';
import { getQueueEntryById, removeFromQueue, type QueueEntry } from '../_queue';
import { sendRejectionEmail } from '../sendConfirmationEmail';
import { verifyDeclineToken, type ConfirmTokenPayload } from '../_confirmToken';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? '';

function htmlPage(title: string, bodyHtml: string, status: number): NextResponse {
    return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 48px 20px; background-color: #f5f5f5; margin: 0; }
        .container { max-width: 420px; margin: 0 auto; background: white; padding: 40px 36px 44px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #631732 0%, #55122b 100%); color: white; padding: 24px 20px; border-radius: 12px 12px 0 0; margin: -40px -36px 28px -36px; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3; }
        .lead { color: #631732; font-size: 18px; line-height: 1.45; margin: 0 0 20px; }
        .body { color: #444; font-size: 15px; line-height: 1.55; margin: 0 0 28px; }
        .error { color: #dc2626; }
        .details { text-align: left; background: #fafafa; padding: 8px 20px; border-radius: 10px; margin: 0 0 28px; font-size: 15px; }
        .detail-row { padding: 14px 0; border-bottom: 1px solid #ececec; line-height: 1.45; }
        .detail-row:last-child { border-bottom: none; }
        .btn { display: inline-block; background: #b91c1c; color: #ffffff !important; border: none; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; cursor: pointer; }
        .btn:hover { background: #991b1b; }
        .btn-secondary { background: #631732; }
        .btn-secondary:hover { background: #55122b; }
        .sub { color: #666; font-size: 14px; line-height: 1.5; margin: 28px 0 0; }
    </style>
</head>
<body>
    <div class="container">
        ${bodyHtml}
    </div>
</body>
</html>`,
        { status, headers: { 'Content-Type': 'text/html' } }
    );
}

function siteFormUrl(request: NextRequest): string {
    const siteBase = (BASE_URL || new URL(request.url).origin).replace(/\/$/, '');
    return `${siteBase}/#form`;
}

function extractTokenFromUrl(parsedUrl: URL): string | null {
    const { searchParams } = parsedUrl;
    let token = searchParams.get('token');
    if (!token) {
        const malformedTokenKey = Array.from(searchParams.keys()).find((k) => k.startsWith('token='));
        if (malformedTokenKey) {
            token = malformedTokenKey.slice('token='.length);
        }
    }
    if (!token) {
        const rawQuery = parsedUrl.search.startsWith('?') ? parsedUrl.search.slice(1) : parsedUrl.search;
        const decodedRawQuery = decodeURIComponent(rawQuery);
        if (decodedRawQuery.startsWith('token=')) {
            token = decodedRawQuery.slice('token='.length);
        }
    }
    return token;
}

function parseTokenOrError(token: string | null):
    | { ok: true; token: string; payload: ConfirmTokenPayload }
    | { ok: false; response: NextResponse } {
    if (!token || token.length > 8000) {
        return {
            ok: false,
            response: htmlPage(
                'Invalid link',
                `<div class="header"><h1 class="error">Invalid link</h1></div>
                <p class="body">This decline link is invalid or missing.</p>`,
                400
            ),
        };
    }
    const verified = verifyDeclineToken(token);
    if (!verified.ok) {
        if (verified.reason === 'expired') {
            return {
                ok: false,
                response: htmlPage(
                    'Link expired',
                    `<div class="header"><h1 class="error">Link expired</h1></div>
                    <p class="body">This decline link has expired. Please use a newer reservation email.</p>`,
                    400
                ),
            };
        }
        return {
            ok: false,
            response: htmlPage(
                'Invalid link',
                `<div class="header"><h1 class="error">Invalid link</h1></div>
                <p class="body">This decline link is invalid or corrupted.</p>`,
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
            response: htmlPage(
                'Invalid link',
                `<div class="header"><h1 class="error">Invalid link</h1></div>
                <p class="body">This decline link is missing booking scope and cannot be used.</p>`,
                400
            ),
        };
    }
    const entry = await getQueueEntryById(queueId);
    if (!entry) {
        return {
            ok: false,
            response: htmlPage(
                'Already processed',
                `<div class="header"><h1>Already processed</h1></div>
                <p class="lead">This request is no longer in the queue.</p>
                <p class="body">It may already have been approved or declined.</p>
                <p class="sub">You can close this tab.</p>`,
                404
            ),
        };
    }
    return { ok: true, entry, queueId };
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

function declinePromptPage(
    token: string,
    safeFormData: { name: string; date: string; time: string; guests: string; email: string }
) {
    return htmlPage(
        'Decline reservation',
        `<div class="header"><h1>Decline this booking?</h1></div>
        <p class="lead">This will remove the request and email the guest a link to book again.</p>
        <div class="details">
            <div class="detail-row"><strong>Guest:</strong> ${escapeHtml(safeFormData.name)}</div>
            <div class="detail-row"><strong>Email:</strong> ${escapeHtml(safeFormData.email)}</div>
            <div class="detail-row"><strong>Date:</strong> ${escapeHtml(safeFormData.date)}</div>
            <div class="detail-row"><strong>Time:</strong> ${escapeHtml(safeFormData.time)}</div>
            <div class="detail-row"><strong>Guests:</strong> ${escapeHtml(safeFormData.guests)}</div>
        </div>
        <form method="POST" action="">
            <input type="hidden" name="token" value="${escapeHtml(token)}" />
            <button type="submit" class="btn">Decline booking</button>
        </form>
        <p class="sub">This link expires 48 hours after it was created.</p>`,
        200
    );
}

function declineSuccessPage(formUrl: string) {
    return htmlPage(
        'Reservation declined',
        `<div class="header"><h1>Reservation declined</h1></div>
        <p class="lead">This booking request has been removed.</p>
        <p class="body">The guest has been emailed a link to book again on the Terracotta website.</p>
        <a href="${escapeHtml(formUrl)}" class="btn btn-secondary" style="color:#ffffff !important; text-decoration:none;">Open booking form</a>
        <p class="sub">You can close this tab.</p>`,
        200
    );
}

/** GET validates the token and shows a Decline form. Does not mutate queue. */
export async function GET(request: NextRequest) {
    try {
        const token = extractTokenFromUrl(new URL(request.url));
        const parsed = parseTokenOrError(token);
        if (!parsed.ok) return parsed.response;

        const resolved = await resolveQueueEntry(parsed.payload);
        if (!resolved.ok) return resolved.response;

        return declinePromptPage(parsed.token, safeBookingFromEntry(resolved.entry));
    } catch (error) {
        console.error('Error rendering decline page:', error);
        return htmlPage(
            'Error',
            `<div class="header"><h1 class="error">Error</h1></div>
            <p class="body">There was an error processing this link. Please try again.</p>`,
            500
        );
    }
}

/** POST declines: remove queue entry and email guest. */
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

        const parsed = parseTokenOrError(token);
        if (!parsed.ok) return parsed.response;

        const resolved = await resolveQueueEntry(parsed.payload);
        if (!resolved.ok) return resolved.response;

        const { entry, queueId } = resolved;
        await removeFromQueue(queueId);

        const formUrl = siteFormUrl(request);
        try {
            await sendRejectionEmail({
                name: entry.name,
                email: entry.email,
                date: entry.date,
                time: entry.time,
                formUrl,
            });
        } catch (err) {
            console.error('[reservation/reject] Send decline email failed:', err);
        }

        return declineSuccessPage(formUrl);
    } catch (error) {
        console.error('Error declining reservation:', error);
        return htmlPage(
            'Error',
            `<div class="header"><h1 class="error">Error</h1></div>
            <p class="body">There was an error declining this reservation. Please try again.</p>`,
            500
        );
    }
}
