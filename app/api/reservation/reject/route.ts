import { NextRequest, NextResponse } from 'next/server';
import { getQueueEntryById } from '../_queue';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? '';

function debugLog(hypothesisId: string, message: string, data: Record<string, unknown>) {
    fetch('http://127.0.0.1:7243/ingest/1fcc1fa4-567e-4c98-a901-f11466da8e45', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            runId: 'confirm-reject-debug-1',
            hypothesisId,
            location: 'app/api/reservation/reject/route.ts',
            message,
            data,
            timestamp: Date.now(),
        }),
    }).catch(() => {});
}

export async function GET(request: NextRequest) {
    const parsedUrl = new URL(request.url);
    const { searchParams } = parsedUrl;
    let queueId = searchParams.get('queueId');
    if (!queueId) {
        const malformedQueueKey = Array.from(searchParams.keys()).find((k) => k.startsWith('queueId='));
        if (malformedQueueKey) {
            queueId = malformedQueueKey.slice('queueId='.length);
            console.warn('[reservation/reject] recovered queueId from malformed query key');
            // #region agent log
            debugLog('H10', 'reject recovered queueId from malformed query key', {
                malformedKeyLength: malformedQueueKey.length,
                recoveredQueueIdLength: queueId.length,
            });
            // #endregion
        }
    }
    if (!queueId) {
        const rawQuery = parsedUrl.search.startsWith('?') ? parsedUrl.search.slice(1) : parsedUrl.search;
        const decodedRawQuery = decodeURIComponent(rawQuery);
        if (decodedRawQuery.startsWith('queueId=')) {
            queueId = decodedRawQuery.slice('queueId='.length);
            console.warn('[reservation/reject] recovered queueId from raw decoded query');
            // #region agent log
            debugLog('H10', 'reject recovered queueId from raw decoded query', {
                rawQueryLength: rawQuery.length,
                recoveredQueueIdLength: queueId.length,
            });
            // #endregion
        } else {
            // #region agent log
            debugLog('H10', 'reject queueId recovery failed', {
                keyCount: Array.from(searchParams.keys()).length,
                rawQueryLength: rawQuery.length,
                hasEqualsInRawQuery: decodedRawQuery.includes('='),
            });
            // #endregion
        }
    }
    console.log('[reservation/reject] entered', { hasQueueId: Boolean(queueId), queueIdLength: queueId?.length ?? 0, hasBaseUrl: Boolean(BASE_URL) });
    // #region agent log
    debugLog('H6', 'reject route entered', { hasQueueId: Boolean(queueId), queueIdLength: queueId?.length ?? 0, hasBaseUrl: Boolean(BASE_URL) });
    // #endregion

    if (!queueId || typeof queueId !== 'string' || queueId.length > 100) {
        console.warn('[reservation/reject] invalid queueId', { hasQueueId: Boolean(queueId), queueIdLength: queueId?.length ?? 0 });
        // #region agent log
        debugLog('H6', 'reject invalid queueId', { hasQueueId: Boolean(queueId), queueIdLength: queueId?.length ?? 0 });
        // #endregion
        return new NextResponse(
            `<!DOCTYPE html>
<html><head><title>Error</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:50px;}.error{color:#dc2626;}</style></head>
<body><h1 class="error">Invalid link</h1><p>This rejection link is invalid or expired.</p></body></html>`,
            { status: 400, headers: { 'Content-Type': 'text/html' } }
        );
    }

    const entry = getQueueEntryById(queueId);
    console.log('[reservation/reject] queue lookup', { queueId, foundEntry: Boolean(entry) });
    // #region agent log
    debugLog('H7', 'reject queue lookup result', { queueId, foundEntry: Boolean(entry) });
    // #endregion

    const targetBase = BASE_URL || new URL(request.url).origin;
    const target = `${targetBase}/crm/dashboard?queueId=${encodeURIComponent(queueId)}&source=email-reject`;
    console.log('[reservation/reject] redirecting to CRM review', { queueId, foundEntry: Boolean(entry), target });
    return NextResponse.redirect(target, { status: 302 });
}
