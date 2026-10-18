import { NextRequest, NextResponse } from 'next/server';
import { getQueueEntryById } from '../_queue';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? '';

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
        return new NextResponse(
            `<!DOCTYPE html>
<html><head><title>Error</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:50px;}.error{color:#dc2626;}</style></head>
<body><h1 class="error">Invalid link</h1><p>This rejection link is invalid or expired.</p></body></html>`,
            { status: 400, headers: { 'Content-Type': 'text/html' } }
        );
    }

    await getQueueEntryById(queueId);

    const targetBase = BASE_URL || new URL(request.url).origin;
    const target = `${targetBase}/crm/dashboard?queueId=${encodeURIComponent(queueId)}&source=email-reject`;
    return NextResponse.redirect(target, { status: 302 });
}
