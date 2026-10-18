import { NextRequest, NextResponse } from 'next/server';
import { escapeHtml } from '../../_utils';
import { getQueueEntryById, removeFromQueue } from '../_queue';
import { sendRejectionEmail } from '../sendConfirmationEmail';

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
        .btn { display: inline-block; background: #631732; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; }
        .btn:hover { background: #55122b; }
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

export async function GET(request: NextRequest) {
    const parsedUrl = new URL(request.url);
    const { searchParams } = parsedUrl;
    let queueId = searchParams.get('queueId');
    if (!queueId) {
        const malformedQueueKey = Array.from(searchParams.keys()).find((k) => k.startsWith('queueId='));
        if (malformedQueueKey) {
            queueId = malformedQueueKey.slice('queueId='.length);
        }
    }
    if (!queueId) {
        const rawQuery = parsedUrl.search.startsWith('?') ? parsedUrl.search.slice(1) : parsedUrl.search;
        const decodedRawQuery = decodeURIComponent(rawQuery);
        if (decodedRawQuery.startsWith('queueId=')) {
            queueId = decodedRawQuery.slice('queueId='.length);
        }
    }

    if (!queueId || typeof queueId !== 'string' || queueId.length > 100) {
        return htmlPage(
            'Invalid link',
            `<div class="header"><h1 class="error">Invalid link</h1></div>
            <p class="body">This decline link is invalid or expired.</p>`,
            400
        );
    }

    const siteBase = (BASE_URL || new URL(request.url).origin).replace(/\/$/, '');
    const formUrl = `${siteBase}/#form`;
    const entry = await getQueueEntryById(queueId);

    if (!entry) {
        return htmlPage(
            'Already processed',
            `<div class="header"><h1>Already processed</h1></div>
            <p class="lead">This request is no longer in the queue.</p>
            <p class="body">It may already have been approved or declined.</p>
            <a href="${escapeHtml(formUrl)}" class="btn" style="color:#ffffff !important; text-decoration:none;">Book a table</a>
            <p class="sub">You can close this tab.</p>`,
            404
        );
    }

    await removeFromQueue(queueId);

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

    return htmlPage(
        'Reservation declined',
        `<div class="header"><h1>Reservation declined</h1></div>
        <p class="lead">This booking request has been removed.</p>
        <p class="body">The guest has been emailed a link to book again on the Terracotta website.</p>
        <a href="${escapeHtml(formUrl)}" class="btn" style="color:#ffffff !important; text-decoration:none;">Open booking form</a>
        <p class="sub">You can close this tab.</p>`,
        200
    );
}
