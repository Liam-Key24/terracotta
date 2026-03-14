import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import nodemailer from 'nodemailer';
import { asTrimmedString, clampLength, escapeHtml, escapeHtmlWithBreaks, isValidEmail } from '../_utils';
import { addToQueue } from './_queue';

// HTML Email Template for Owner
const reservationEmailTemplate = (formData: {
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    location: string;
    guests: string;
    specialRequests?: string;
}, confirmationUrl: string, rejectUrl: string) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Table Reservation</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0 auto;
            padding: 24px;
            background-color: #f5f5f5;
        }
        .email-wrapper {
            max-width: 400px;
            margin: 0 auto;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #631732 0%, #55122b 100%);
            color: white;
            padding: 24px 24px 28px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 600;
            letter-spacing: 0.02em;
        }
        .content {
            padding: 28px 24px 32px;
        }
        .info-section {
            margin-bottom: 0;
        }
        .info-row {
            display: flex;
            padding: 14px 0;
            border-bottom: 1px solid #eee;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #631732;
            width: 140px;
            flex-shrink: 0;
            font-size: 18px;
        }
        .info-value {
            color: #333;
            flex: 1;
            font-size: 18px;
        }
        .special-requests {
            background-color: #fafafa;
            padding: 16px;
            border-radius: 8px;
            margin-top: 16px;
            font-size: 18px;
        }
        .button-container {
            text-align: center;
            margin-top: 28px;
            padding: 24px;
            background-color: rgba(99, 23, 50, 0.06);
            border-radius: 10px;
            border: 1px solid rgba(99, 23, 50, 0.15);
        }
        .button-container p {
            margin: 0 0 20px 0;
            color: #631732;
            font-weight: 600;
            font-size: 16px;
        }
        .button-row {
            width: 100%;
            border-collapse: collapse;
        }
        .button-cell {
            width: 50%;
            padding: 0 6px;
            text-align: center;
            vertical-align: middle;
        }
        .button-cell:first-child {
            padding-right: 8px;
        }
        .button-cell:last-child {
            padding-left: 8px;
        }
        .button-cell a {
            display: block;
            width: 100%;
            box-sizing: border-box;
        }
        .confirm-button {
            display: inline-block;
            background: #16a34a;
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff;
            padding: 14px 28px;
            text-decoration: none !important;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            text-align: center;
        }
        .confirm-button:hover {
            background: #15803d;
            color: #ffffff !important;
        }
        .reject-button {
            display: inline-block;
            background: #b91c1c;
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff;
            padding: 14px 28px;
            text-decoration: none !important;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            text-align: center;
        }
        .reject-button:hover {
            background: #991b1b;
            color: #ffffff !important;
        }
        .footer {
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        .footer p {
            margin: 0 0 4px 0;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="header">
                <h1>New Table Reservation</h1>
            </div>
            <div class="content">
                <div class="info-section">
                    <div class="info-row">
                        <div class="info-label">Guest Name</div>
                        <div class="info-value">${escapeHtml(formData.name)}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Email</div>
                        <div class="info-value">${escapeHtml(formData.email)}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Phone</div>
                        <div class="info-value">${escapeHtml(formData.phone)}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Date</div>
                        <div class="info-value">${escapeHtml(formData.date)}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Time</div>
                        <div class="info-value">${escapeHtml(formData.time)}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Place</div>
                        <div class="info-value">${escapeHtml(formData.location)}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Guests</div>
                        <div class="info-value">${escapeHtml(formData.guests)}</div>
                    </div>
                    ${formData.specialRequests ? `
                    <div class="special-requests">
                        <strong>Special Requests</strong><br>
                        ${escapeHtmlWithBreaks(formData.specialRequests)}
                    </div>
                    ` : ''}
                </div>
                <div class="button-container">
                    <p>Confirm or decline this reservation:</p>
                    <table class="button-row" role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                            <td class="button-cell"><a href="${confirmationUrl}" class="confirm-button" style="background:#16a34a; color:#ffffff !important; text-decoration:none;">Confirm</a></td>
                            <td class="button-cell"><a href="${rejectUrl}" class="reject-button" style="color:#ffffff !important; text-decoration:none;">Reject</a></td>
                        </tr>
                    </table>
                </div>
                <div class="footer">
                    <p>Submitted via the Terracotta website.</p>
                    <p>Use the buttons above to confirm or decline and remove from the queue.</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

// Email configuration - these should be set as environment variables
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'reservations@terracotta-acton.com';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const IS_SMTP_CONFIGURED = Boolean(SMTP_USER && SMTP_PASS);

const createTransporter = () => {
    if (!IS_SMTP_CONFIGURED) {
        console.warn(
            '[reservation] SMTP credentials missing. Falling back to Nodemailer JSON transport for local testing. ' +
            'Set SMTP_USER/SMTP_PASS to enable real emails.'
        );

        return nodemailer.createTransport({
            jsonTransport: true,
        });
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465, // true for 465, false for other ports
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
};

export async function POST(request: NextRequest) {
    try {
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const raw = body as Record<string, unknown>;
        const name = asTrimmedString(raw.name);
        const email = asTrimmedString(raw.email);
        const phone = asTrimmedString(raw.phone);
        const date = asTrimmedString(raw.date);
        const time = asTrimmedString(raw.time);
        const location = asTrimmedString(raw.location);
        const guests = asTrimmedString(raw.guests);
        const specialRequestsRaw = asTrimmedString(raw.specialRequests);

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/1fcc1fa4-567e-4c98-a901-f11466da8e45',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:after-parse',message:'body parsed',data:{hasTime:!!time,hasLocation:!!location,timeLen:time.length},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
        // #endregion

        // Validate required fields
        if (!name || !email || !phone || !date || !time || !location || !guests) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }
        if (!isValidEmail(email)) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
        }
        if (!/^\d+$/.test(guests) || Number(guests) < 1 || Number(guests) > 20) {
            return NextResponse.json({ error: 'Invalid guests' }, { status: 400 });
        }

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/1fcc1fa4-567e-4c98-a901-f11466da8e45',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:after-validation',message:'validation passed',data:{},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
        // #endregion

        const formData = {
            name: clampLength(name, 100),
            email: clampLength(email, 254),
            phone: clampLength(phone, 50),
            date: clampLength(date, 20),
            time: clampLength(time, 20),
            location: clampLength(location, 10),
            guests,
            ...(specialRequestsRaw ? { specialRequests: clampLength(specialRequestsRaw, 2000) } : {}),
        };

        // Add to CRM queue so it appears in the CRM for approval
        const queueId = `res-${randomUUID()}`;
        const queueResult = addToQueue({
            id: queueId,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            date: formData.date,
            time: formData.time,
            guests: formData.guests,
            ...(formData.specialRequests ? { notes: formData.specialRequests } : {}),
            addedAt: new Date().toISOString(),
        });
        if (!queueResult.added) {
            console.warn('[reservation] Queue add failed:', queueResult.error);
        }

        // Create transporter for sending emails
        const transporter = createTransporter();

        // Generate confirmation token (form data + queueId for approve-from-email flow)
        const confirmationToken = Buffer.from(JSON.stringify({ ...formData, queueId })).toString('base64');
        
        // Get base URL for confirmation link
        const origin = request.headers.get('origin') || '';
        const allowedOrigins = new Set(['http://localhost:3000', 'https://terracotta-acton.com']);
        const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL ||
            (allowedOrigins.has(origin) ? origin : '') ||
            'http://localhost:3000';
        const confirmationUrl = `${baseUrl}/api/reservation/confirm?token=${encodeURIComponent(confirmationToken)}`;
        const rejectUrl = `${baseUrl}/api/reservation/reject?queueId=${encodeURIComponent(queueId)}`;

        // Generate HTML email using the template
        const htmlEmail = reservationEmailTemplate(formData, confirmationUrl, rejectUrl);

        // Send email to restaurant owner
        const mailOptions = {
            from: SMTP_USER
                ? `"Terracotta Reservations" <${SMTP_USER}>`
                : '"Terracotta Reservations" <no-reply@terracotta.local>',
            to: OWNER_EMAIL,
            subject: `New Table Reservation - ${formData.name} - ${formData.date} at ${formData.time}`,
            html: htmlEmail,
            // Also include a plain text version
            text: `
New Table Reservation

Guest Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Date: ${formData.date}
Time: ${formData.time}
Place: ${formData.location}
Number of Guests: ${formData.guests}
${formData.specialRequests ? `Special Requests: ${formData.specialRequests}` : ''}

This reservation was submitted through the Terracotta website.
Please confirm this reservation with the guest as soon as possible.
            `.trim(),
        };

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/1fcc1fa4-567e-4c98-a901-f11466da8e45',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:before-sendMail',message:'about to sendMail',data:{},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
        // #endregion

        let info: { messageId?: string };
        try {
            info = await transporter.sendMail(mailOptions);
        } catch (sendError) {
            const msg = sendError instanceof Error ? sendError.message : String(sendError);
            const isAuthError = /535|Invalid login|BadCredentials/i.test(msg);
            if (isAuthError && IS_SMTP_CONFIGURED) {
                console.warn('[reservation] SMTP credentials rejected. Falling back to local capture. Fix SMTP_USER/SMTP_PASS or use a Gmail App Password.');
                const fallback = nodemailer.createTransport({ jsonTransport: true });
                info = await fallback.sendMail(mailOptions);
            } else {
                throw sendError;
            }
        }

        if (!IS_SMTP_CONFIGURED) {
            console.info('[reservation] Email captured (not sent). Preview JSON payload:\n', info.messageId);
        }

        return NextResponse.json(
            { message: 'Reservation submitted successfully' },
            { status: 200 }
        );
    } catch (error) {
        // #region agent log
        const errMsg = error instanceof Error ? error.message : String(error);
        const errName = error instanceof Error ? error.name : '';
        fetch('http://127.0.0.1:7243/ingest/1fcc1fa4-567e-4c98-a901-f11466da8e45',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:catch',message:'server exception',data:{errorMessage:errMsg,errorName:errName},timestamp:Date.now(),hypothesisId:'H2,H4,H5'})}).catch(()=>{});
        // #endregion
        console.error('Error processing reservation:', error);
        return NextResponse.json(
            { error: 'Failed to process reservation' },
            { status: 500 }
        );
    }
}

// GET endpoint (optional - for testing or retrieving reservations)
export async function GET() {
    return NextResponse.json(
        { message: 'Reservation API endpoint. Use POST to submit a reservation.' },
        { status: 200 }
    );
}


