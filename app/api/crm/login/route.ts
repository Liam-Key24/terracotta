import { NextRequest, NextResponse } from 'next/server';
import { signCookie, getCookieOptions, COOKIE_NAME, type Role } from '../auth';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';
const DEVELOPER_PASSWORD = process.env.DEVELOPER_PASSWORD ?? '';

export async function POST(request: NextRequest) {
    try {
        if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !DEVELOPER_PASSWORD) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });
        }
        const body = await request.json();
        const username = typeof body.username === 'string' ? body.username.trim() : '';
        const password = typeof body.password === 'string' ? body.password : '';
        const isDeveloper = body.developer === true || body.isDeveloper === true;

        let role: Role | null = null;
        if (isDeveloper && password === DEVELOPER_PASSWORD) {
            role = 'developer';
        } else if (!isDeveloper && username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            role = 'admin';
        }

        if (!role) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const value = signCookie(role);
        if (!value) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });
        }
        const response = NextResponse.json({ ok: true, role });
        response.cookies.set(COOKIE_NAME, value, getCookieOptions());
        return response;
    } catch {
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }
}
