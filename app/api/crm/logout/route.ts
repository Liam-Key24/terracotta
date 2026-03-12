import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME } from '../auth';

function clearAndRedirect(request: NextRequest) {
    const response = NextResponse.redirect(new URL('/crm', request.url));
    response.cookies.set(COOKIE_NAME, '', { httpOnly: true, maxAge: 0, path: '/' });
    return response;
}

export async function POST(request: NextRequest) {
    return clearAndRedirect(request);
}

export async function GET(request: NextRequest) {
    return clearAndRedirect(request);
}
