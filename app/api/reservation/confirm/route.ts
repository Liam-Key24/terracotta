import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { asTrimmedString, clampLength, escapeHtml, escapeHtmlWithBreaks, isValidEmail } from '../../_utils';

// HTML Email Template for Customer Confirmation
const customerConfirmationEmailTemplate = (formData: {
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    guests: string;
    specialRequests?: string;
}) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmed</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: #f6f6f6;
            color: #111;
            margin: 0;
            padding: 24px;
        }
        .card {
            max-width: 520px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 10px 35px rgba(16, 24, 40, 0.1);
        }
        .badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 10px 18px;
            border-radius: 999px;
            font-size: 14px;
            font-weight: 600;
            color: #16a34a;
            background: #ecfdf3;
            margin-bottom: 20px;
        }
        h1 {
            font-size: 24px;
            margin: 0 0 12px;
            color: #0f172a;
        }
        p {
            margin: 0 0 10px;
        }
        .details {
            margin-top: 24px;
            padding: 16px 20px;
            border-radius: 10px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
        }
        .details strong {
            color: #0f172a;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge">✓ Booking confirmed</div>
        <h1>Hi ${escapeHtml(formData.name)},</h1>
        <p>Your table at Terracotta is confirmed. We’re excited to host you!</p>

        <div class="details">
            <p><strong>Date:</strong> ${escapeHtml(formData.date)}</p>
            <p><strong>Time:</strong> ${escapeHtml(formData.time)}</p>
            <p><strong>Guests:</strong> ${escapeHtml(formData.guests)}</p>
            ${formData.specialRequests ? `<p><strong>Notes:</strong> ${escapeHtmlWithBreaks(formData.specialRequests)}</p>` : ''}
        </div>

        <p style="margin-top:24px;">If you need to adjust anything, just reply to this email. See you soon!</p>
        <p style="margin-top:16px; color:#64748b;">— Terracotta Team</p>
    </div>
</body>
</html>
    `;
};

// Email configuration
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const IS_SMTP_CONFIGURED = Boolean(SMTP_USER && SMTP_PASS);

const createTransporter = () => {
    if (!IS_SMTP_CONFIGURED) {
        console.warn(
            '[reservation-confirm] SMTP credentials missing. Using Nodemailer JSON transport. ' +
            'Set SMTP_USER/SMTP_PASS to send real emails.'
        );

        return nodemailer.createTransport({
            jsonTransport: true,
        });
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token || token.length > 8000) {
            return new NextResponse(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Error</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .error { color: #dc2626; }
                    </style>
                </head>
                <body>
                    <h1 class="error">Invalid confirmation link</h1>
                    <p>The confirmation link is invalid or missing.</p>
                </body>
                </html>
            `, {
                status: 400,
                headers: { 'Content-Type': 'text/html' },
            });
        }

        // Decode the reservation data from token
        let formData;
        try {
            const decoded = Buffer.from(decodeURIComponent(token), 'base64').toString('utf-8');
            formData = JSON.parse(decoded);
        } catch {
            return new NextResponse(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Error</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .error { color: #dc2626; }
                    </style>
                </head>
                <body>
                    <h1 class="error">Invalid confirmation token</h1>
                    <p>The confirmation token is invalid or corrupted.</p>
                </body>
                </html>
            `, {
                status: 400,
                headers: { 'Content-Type': 'text/html' },
            });
        }

        // Validate required fields
        if (!formData || typeof formData !== 'object') {
            throw new Error('Invalid token payload');
        }

        const raw = formData as Record<string, unknown>;
        const name = asTrimmedString(raw.name);
        const email = asTrimmedString(raw.email);
        const phone = asTrimmedString(raw.phone);
        const date = asTrimmedString(raw.date);
        const time = asTrimmedString(raw.time);
        const guests = asTrimmedString(raw.guests);
        const specialRequestsRaw = asTrimmedString(raw.specialRequests);

        if (!name || !email || !phone || !date || !time || !guests) {
            return new NextResponse(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Error</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .error { color: #dc2626; }
                    </style>
                </head>
                <body>
                    <h1 class="error">Invalid reservation data</h1>
                    <p>The reservation data is incomplete.</p>
                </body>
                </html>
            `, {
                status: 400,
                headers: { 'Content-Type': 'text/html' },
            });
        }
        if (!isValidEmail(email)) {
            return new NextResponse(
                '<!DOCTYPE html><html><head><title>Error</title></head><body><h1 class="error">Invalid email</h1><p>The reservation email is invalid.</p></body></html>',
                { status: 400, headers: { 'Content-Type': 'text/html' } }
            );
        }

        const safeFormData = {
            name: clampLength(name, 100),
            email: clampLength(email, 254),
            phone: clampLength(phone, 50),
            date: clampLength(date, 20),
            time: clampLength(time, 20),
            guests: clampLength(guests, 10),
            ...(specialRequestsRaw ? { specialRequests: clampLength(specialRequestsRaw, 2000) } : {}),
        };

        // Create transporter for sending emails
        const transporter = createTransporter();

        // Generate HTML confirmation email for customer
        const htmlEmail = customerConfirmationEmailTemplate(safeFormData);

        // Send confirmation email to customer
        const mailOptions = {
            from: SMTP_USER
                ? `"Terracotta Restaurant" <${SMTP_USER}>`
                : '"Terracotta Restaurant" <no-reply@terracotta.local>',
            to: safeFormData.email,
            subject: `Reservation Confirmed - ${safeFormData.date} at ${safeFormData.time}`,
            html: htmlEmail,
            text: `
Booking confirmed!

Hi ${safeFormData.name},

Your table at Terracotta is confirmed for ${safeFormData.date} at ${safeFormData.time} (${safeFormData.guests} guests).
${safeFormData.specialRequests ? `Notes: ${safeFormData.specialRequests}` : ''}

Reply to this email if you need anything. See you soon!
            `.trim(),
        };

        const info = await transporter.sendMail(mailOptions);

        if (!IS_SMTP_CONFIGURED) {
            console.info('[reservation-confirm] Customer email captured (not sent). Preview JSON payload:\n', info.messageId);
        }

        // Return success page
        return new NextResponse(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Reservation Confirmed</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        padding: 50px;
                        background-color: #f4f4f4;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                        padding: 40px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .success {
                        color: #16a34a;
                        font-size: 48px;
                        margin-bottom: 20px;
                    }
                    h1 {
                        color: #16a34a;
                        margin-bottom: 20px;
                    }
                    .details {
                        text-align: left;
                        background: #f9f9f9;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }
                    .detail-row {
                        padding: 8px 0;
                        border-bottom: 1px solid #e5e5e5;
                    }
                    .detail-row:last-child {
                        border-bottom: none;
                    }
                    .label {
                        font-weight: bold;
                        color: #16a34a;
                        display: inline-block;
                        width: 120px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="success">✓</div>
                    <h1>Reservation Confirmed!</h1>
                    <p>A confirmation email has been sent to <strong>${escapeHtml(safeFormData.email)}</strong></p>
                    
                    <div class="details">
                        <div class="detail-row">
                            <span class="label">Guest:</span>
                            <span>${escapeHtml(safeFormData.name)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Date:</span>
                            <span>${escapeHtml(safeFormData.date)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Time:</span>
                            <span>${escapeHtml(safeFormData.time)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Guests:</span>
                            <span>${escapeHtml(safeFormData.guests)}</span>
                        </div>
                    </div>
                    
                    <p style="color: #666; margin-top: 30px;">
                        The customer has been notified via email. You can close this page.
                    </p>
                </div>
            </body>
            </html>
        `, {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
        });
    } catch (error) {
        console.error('Error confirming reservation:', error);
        return new NextResponse(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Error</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .error { color: #dc2626; }
                </style>
            </head>
            <body>
                <h1 class="error">Error Confirming Reservation</h1>
                <p>There was an error processing the confirmation. Please try again or contact support.</p>
            </body>
            </html>
        `, {
            status: 500,
            headers: { 'Content-Type': 'text/html' },
        });
    }
}

