import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { NextRequest } from 'next/server';

process.env.CRM_SECRET = 'test-login-secret-at-least-32-chars!!';
process.env.ADMIN_USERNAME = 'admin';
process.env.ADMIN_PASSWORD = 'admin-pass';
process.env.DEVELOPER_PASSWORD = 'dev-pass';
process.env.NEXT_PUBLIC_BASE_URL = 'https://www.terracotta-acton.com';
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

describe('crm login route', { concurrency: false }, () => {
    let POST: typeof import('./route').POST;
    let resetLoginRateLimitForTests: typeof import('./_loginGuard').resetLoginRateLimitForTests;

    before(async () => {
        ({ POST } = await import('./route'));
        ({ resetLoginRateLimitForTests } = await import('./_loginGuard'));
    });

    after(() => {
        resetLoginRateLimitForTests();
    });

    function loginRequest(body: object, headers: Record<string, string> = {}) {
        return new NextRequest('http://localhost:3000/api/crm/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://www.terracotta-acton.com',
                ...headers,
            },
            body: JSON.stringify(body),
        });
    }

    test('normal admin login succeeds with same-origin Origin', async () => {
        resetLoginRateLimitForTests();
        const res = await POST(
            loginRequest({ username: 'admin', password: 'admin-pass' })
        );
        assert.equal(res.status, 200);
        const json = (await res.json()) as { ok: boolean; role: string };
        assert.equal(json.ok, true);
        assert.equal(json.role, 'admin');
        assert.ok(res.cookies.get('crm_session')?.value);
    });

    test('rejects cross-origin POST', async () => {
        resetLoginRateLimitForTests();
        const res = await POST(
            loginRequest(
                { username: 'admin', password: 'admin-pass' },
                { Origin: 'https://evil.example' }
            )
        );
        assert.equal(res.status, 403);
    });

    test('rate-limits failed logins after 5 attempts', async () => {
        resetLoginRateLimitForTests();
        for (let i = 0; i < 5; i++) {
            const res = await POST(
                loginRequest(
                    { username: 'admin', password: 'wrong' },
                    { 'x-real-ip': '203.0.113.50' }
                )
            );
            assert.equal(res.status, 401);
        }
        const blocked = await POST(
            loginRequest(
                { username: 'admin', password: 'admin-pass' },
                { 'x-real-ip': '203.0.113.50' }
            )
        );
        assert.equal(blocked.status, 429);
    });
});
