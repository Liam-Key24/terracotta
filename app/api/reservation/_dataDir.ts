import { join } from 'node:path';

/** Writable data directory. On Vercel the project filesystem is read-only; use /tmp. */
export function getDataDir(): string {
    if (process.env.VERCEL) {
        return '/tmp/terracotta-data';
    }
    return join(process.cwd(), 'data');
}
