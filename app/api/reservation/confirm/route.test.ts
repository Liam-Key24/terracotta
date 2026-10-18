import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';
import { NextRequest } from 'next/server';

const dataDir = mkdtempSync(join(tmpdir(), 'terracotta-confirm-'));

process.env.TERRACOTTA_DATA_DIR = dataDir;
process.env.CRM_SECRET = 'test-confirm-secret';
process.env.MOCK_NO_EMAIL = 'true';
delete process.env.BASE_CRM_URL;
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

function signRaw(payload: object): string {
    const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
    const sig = createHmac('sha256', process.env.CRM_SECRET!).update(payloadB64).digest('base64url');
    return `${payloadB64}.${sig}`;
}

describe('reservation confirm route', { concurrency: false }, () => {
    let GET: typeof import('./route').GET;
    let POST: typeof import('./route').POST;
    let addToQueue: typeof import('../_queue').addToQueue;
    let listQueue: typeof import('../_queue').listQueue;
    let loadReservations: typeof import('../_store').loadReservations;
    let signConfirmationToken: typeof import('../_confirmToken').signConfirmationToken;
    let CONFIRM_TOKEN_TTL_MS: typeof import('../_confirmToken').CONFIRM_TOKEN_TTL_MS;

    const booking = {
        id: 'res-confirm-test-1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: '07000000001',
        date: '2099-07-01',
        time: '20:00',
        guests: '2',
        addedAt: new Date().toISOString(),
    };

    before(async () => {
        ({ GET, POST } = await import('./route'));
        ({ addToQueue, listQueue } = await import('../_queue'));
        ({ loadReservations } = await import('../_store'));
        ({ signConfirmationToken, CONFIRM_TOKEN_TTL_MS } = await import('../_confirmToken'));

        const added = await addToQueue(booking);
        assert.equal(added.added, true);
    });

    after(() => {
        rmSync(dataDir, { recursive: true, force: true });
    });

    test('GET is read-only: does not add reservation or remove queue entry', async () => {
        const token = signConfirmationToken({
            queueId: booking.id,
            name: booking.name,
            email: booking.email,
            phone: booking.phone,
            date: booking.date,
            time: booking.time,
            guests: booking.guests,
        });
        assert.ok(token);

        const res = await GET(new NextRequest(`http://localhost/api/reservation/confirm?token=${encodeURIComponent(token!)}`));
        assert.equal(res.status, 200);
        const html = await res.text();
        assert.match(html, /Approve/);
        assert.match(html, /Ada Lovelace/);

        const queue = await listQueue();
        assert.ok(queue.some((e) => e.id === booking.id));
        const reservations = await loadReservations();
        assert.equal(reservations.filter((r) => r.id === booking.id).length, 0);
    });

    test('POST approves once; replay is rejected', async () => {
        const token = signConfirmationToken({
            queueId: booking.id,
            name: booking.name,
            email: booking.email,
            phone: booking.phone,
            date: booking.date,
            time: booking.time,
            guests: booking.guests,
        });
        assert.ok(token);

        const body = new URLSearchParams({ token: token! });
        const first = await POST(
            new NextRequest('http://localhost/api/reservation/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body,
            })
        );
        assert.equal(first.status, 200);
        const firstHtml = await first.text();
        assert.match(firstHtml, /Reservation approved|confirmed/i);
        assert.doesNotMatch(firstHtml, /Open CRM|BASE_CRM_URL/i);

        const reservations = await loadReservations();
        assert.ok(reservations.some((r) => r.id === booking.id));
        const queue = await listQueue();
        assert.equal(queue.filter((e) => e.id === booking.id).length, 0);

        const second = await POST(
            new NextRequest('http://localhost/api/reservation/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ token: token! }),
            })
        );
        assert.equal(second.status, 404);
        assert.match(await second.text(), /no longer available|Already processed/i);
    });

    test('expired token is rejected', async () => {
        const expiredToken = signRaw({
            queueId: 'res-expired',
            name: 'Expired',
            email: 'expired@example.com',
            phone: '07000000002',
            date: '2099-08-01',
            time: '18:00',
            guests: '2',
            exp: Date.now() - CONFIRM_TOKEN_TTL_MS,
        });

        const getRes = await GET(
            new NextRequest(`http://localhost/api/reservation/confirm?token=${encodeURIComponent(expiredToken)}`)
        );
        assert.equal(getRes.status, 400);
        assert.match(await getRes.text(), /expired/i);

        const postRes = await POST(
            new NextRequest('http://localhost/api/reservation/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ token: expiredToken }),
            })
        );
        assert.equal(postRes.status, 400);
        assert.match(await postRes.text(), /expired/i);
    });
});
