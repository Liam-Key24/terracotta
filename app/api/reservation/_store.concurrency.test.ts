import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';

const dataDir = mkdtempSync(join(tmpdir(), 'terracotta-res-'));

process.env.TERRACOTTA_DATA_DIR = dataDir;
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

describe('addReservation concurrency', () => {
    let addReservation: typeof import('./_store').addReservation;
    let loadReservations: typeof import('./_store').loadReservations;
    let MAX_PER_SLOT: typeof import('./_store').MAX_PER_SLOT;

    before(async () => {
        const store = await import('./_store');
        addReservation = store.addReservation;
        loadReservations = store.loadReservations;
        MAX_PER_SLOT = store.MAX_PER_SLOT;

        const empty = await loadReservations();
        assert.equal(empty.length, 0);
    });

    after(() => {
        rmSync(dataDir, { recursive: true, force: true });
    });

    test('10 concurrent adds for the same slot: capacity held, none lost, numbers unique', async () => {
        const date = '2099-06-15';
        const time = '19:00';
        const total = 10;

        const results = await Promise.all(
            Array.from({ length: total }, (_, i) =>
                addReservation(`concurrent-${i}`, {
                    date,
                    time,
                    name: `Guest ${i}`,
                    email: `guest${i}@example.com`,
                    phone: '07000000000',
                    guests: '2',
                })
            )
        );

        const successes = results.filter((r) => r.success);
        const failures = results.filter((r) => !r.success);

        assert.equal(successes.length, MAX_PER_SLOT);
        assert.equal(failures.length, total - MAX_PER_SLOT);
        for (const f of failures) {
            assert.equal(f.error, 'Time slot full');
        }

        const persisted = await loadReservations();
        const slot = persisted.filter((r) => r.date === date && r.time === time);
        assert.equal(slot.length, successes.length);

        const successIds = new Set(successes.map((r) => r.record!.id));
        for (const id of successIds) {
            assert.ok(slot.some((r) => r.id === id), `successful id ${id} missing from store`);
        }

        const numbers = successes.map((r) => r.record!.number).sort((a, b) => a - b);
        assert.equal(new Set(numbers).size, numbers.length);
        for (let i = 0; i < numbers.length; i++) {
            assert.equal(numbers[i], i + 1);
        }
    });
});
