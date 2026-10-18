import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';
import { NextRequest } from 'next/server';

const dataDir = mkdtempSync(join(tmpdir(), 'terracotta-reject-'));

process.env.TERRACOTTA_DATA_DIR = dataDir;
process.env.CRM_SECRET = 'test-reject-secret';
process.env.MOCK_NO_EMAIL = 'true';
process.env.NEXT_PUBLIC_BASE_URL = 'https://www.terracotta-acton.com';
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

function signRaw(payload: object): string {
    const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
    const sig = createHmac('sha256', process.env.CRM_SECRET!).update(payloadB64).digest('base64url');
    return `${payloadB64}.${sig}`;
}

describe('reservation reject route', { concurrency: false }, () => {
    let GET: typeof import('./route').GET;
    let POST: typeof import('./route').POST;
    let addToQueue: typeof import('../_queue').addToQueue;
    let listQueue: typeof import('../_queue').listQueue;
    let signDeclineToken: typeof import('../_confirmToken').signDeclineToken;
    let CONFIRM_TOKEN_TTL_MS: typeof import('../_confirmToken').CONFIRM_TOKEN_TTL_MS;

    const booking = {
        id: 'res-reject-test-1',
        name: 'Grace Hopper',
        email: 'grace@example.com',
        phone: '07000000003',
        date: '2099-09-01',
        time: '19:00',
        guests: '2',
        addedAt: new Date().toISOString(),
    };

    before(async () => {
        ({ GET, POST } = await import('./route'));
        ({ addToQueue, listQueue } = await import('../_queue'));
        ({ signDeclineToken, CONFIRM_TOKEN_TTL_MS } = await import('../_confirmToken'));

        const added = await addToQueue(booking);
        assert.equal(added.added, true);
    });

    after(() => {
        rmSync(dataDir, { recursive: true, force: true });
    });

    test('GET is read-only: shows decline prompt without removing queue entry', async () => {
        const token = signDeclineToken(booking.id);
        assert.ok(token);

        const res = await GET(new NextRequest(`http://localhost/api/reservation/reject?token=${encodeURIComponent(token!)}`));
        assert.equal(res.status, 200);
        const html = await res.text();
        assert.match(html, /Decline this booking/i);
        assert.match(html, /Grace Hopper/);

        const queue = await listQueue();
        assert.ok(queue.some((e) => e.id === booking.id));
    });

    test('POST declines once; replay is rejected', async () => {
        const token = signDeclineToken(booking.id);
        assert.ok(token);

        const first = await POST(
            new NextRequest('http://localhost/api/reservation/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ token: token! }),
            })
        );
        assert.equal(first.status, 200);
        assert.match(await first.text(), /Reservation declined/i);

        const queue = await listQueue();
        assert.equal(queue.filter((e) => e.id === booking.id).length, 0);

        const second = await POST(
            new NextRequest('http://localhost/api/reservation/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ token: token! }),
            })
        );
        assert.equal(second.status, 404);
        assert.match(await second.text(), /Already processed|no longer/i);
    });

    test('expired and confirm tokens are rejected', async () => {
        const expiredToken = signRaw({
            purpose: 'decline',
            queueId: 'res-expired-decline',
            exp: Date.now() - CONFIRM_TOKEN_TTL_MS,
        });
        const getRes = await GET(
            new NextRequest(`http://localhost/api/reservation/reject?token=${encodeURIComponent(expiredToken)}`)
        );
        assert.equal(getRes.status, 400);
        assert.match(await getRes.text(), /expired/i);

        const confirmToken = signRaw({
            purpose: 'confirm',
            queueId: booking.id,
            exp: Date.now() + CONFIRM_TOKEN_TTL_MS,
        });
        const wrongPurpose = await GET(
            new NextRequest(`http://localhost/api/reservation/reject?token=${encodeURIComponent(confirmToken)}`)
        );
        assert.equal(wrongPurpose.status, 400);
        assert.match(await wrongPurpose.text(), /Invalid/i);
    });
});
