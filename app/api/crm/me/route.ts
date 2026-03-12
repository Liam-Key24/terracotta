import { NextRequest, NextResponse } from 'next/server';
import { getCrmSession } from '../requireAuth';

export async function GET(request: NextRequest) {
    const session = getCrmSession(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ role: session.role });
}
