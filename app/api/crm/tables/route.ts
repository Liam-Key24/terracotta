import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { requireCrm } from '../requireAuth';

export async function GET(request: NextRequest) {
    const auth = requireCrm(request);
    if (auth instanceof NextResponse) return auth;
    const path = join(process.cwd(), 'data', 'tables.json');
    try {
        if (!existsSync(path)) return NextResponse.json([]);
        const raw = readFileSync(path, 'utf-8');
        const data = JSON.parse(raw);
        return NextResponse.json(Array.isArray(data) ? data : []);
    } catch {
        return NextResponse.json([]);
    }
}
