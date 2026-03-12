import { NextRequest, NextResponse } from 'next/server';
import { verifyCookie, type Role } from './auth';

const COOKIE_NAME = 'crm_session';

export function getCrmSession(request: NextRequest): { role: Role } | null {
    const cookie = request.cookies.get(COOKIE_NAME)?.value;
    if (!cookie) return null;
    return verifyCookie(cookie);
}

export function requireCrm(request: NextRequest): NextResponse | { role: Role } {
    const session = getCrmSession(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return session;
}

export function requireDeveloper(request: NextRequest): NextResponse | { role: 'developer' } {
    const session = getCrmSession(request);
    if (!session || session.role !== 'developer') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return { role: 'developer' };
}
