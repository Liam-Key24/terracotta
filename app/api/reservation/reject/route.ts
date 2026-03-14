import { NextRequest, NextResponse } from 'next/server';
import { getQueueEntryById, removeFromQueue } from '../_queue';
import { sendRejectionEmail } from '../sendConfirmationEmail';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const queueId = searchParams.get('queueId');

    if (!queueId || typeof queueId !== 'string' || queueId.length > 100) {
        return new NextResponse(
            `<!DOCTYPE html>
<html><head><title>Error</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:50px;}.error{color:#dc2626;}</style></head>
<body><h1 class="error">Invalid link</h1><p>This rejection link is invalid or expired.</p></body></html>`,
            { status: 400, headers: { 'Content-Type': 'text/html' } }
        );
    }

    const entry = getQueueEntryById(queueId);
    const removed = removeFromQueue(queueId);

    if (entry) {
        try {
            const formUrl = `${BASE_URL}/#form`;
            await sendRejectionEmail({
                name: entry.name,
                email: entry.email,
                formUrl,
            });
        } catch (err) {
            console.error('[reservation/reject] Send rejection email failed:', err);
        }
    }

    return new NextResponse(
        `<!DOCTYPE html>
<html><head><title>Reservation Rejected</title><style>
body{font-family:Arial,sans-serif;text-align:center;padding:50px;background:#f5f5f5;}
.container{max-width:400px;margin:0 auto;background:#fff;padding:32px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
h1{color:#631732;margin:0 0 12px;font-size:22px;}
p{margin:0;color:#333;}
</style></head>
<body><div class="container"><h1>Reservation declined</h1><p>${removed ? 'The request has been removed from the queue and the guest has been notified.' : 'This request was already processed or is no longer in the queue.'}</p></div></body></html>`,
        { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
}
