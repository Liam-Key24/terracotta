import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { asTrimmedString, clampLength, escapeHtml, escapeHtmlWithBreaks, isValidEmail } from '../_utils';

// HTML Email Template for Contact Form
const contactEmailTemplate = (formData: {
    name: string;
    email: string;
    subject: string;
    message: string;
}) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            margin: -30px -30px 30px -30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .info-section {
            margin-bottom: 25px;
        }
        .info-row {
            display: flex;
            padding: 12px 0;
            border-bottom: 1px solid #e5e5e5;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: bold;
            color: #ea580c;
            width: 100px;
            flex-shrink: 0;
        }
        .info-value {
            color: #333;
            flex: 1;
        }
        .message-box {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #ea580c;
            margin-top: 10px;
            white-space: pre-wrap;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e5e5e5;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>📧 New Contact Form Submission</h1>
        </div>
        
        <div class="info-section">
            <div class="info-row">
                <div class="info-label">Name:</div>
                <div class="info-value">${escapeHtml(formData.name)}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value">${escapeHtml(formData.email)}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Subject:</div>
                <div class="info-value">${escapeHtml(formData.subject)}</div>
            </div>
            <div class="message-box">
                <strong>Message:</strong><br><br>
                ${escapeHtmlWithBreaks(formData.message)}
            </div>
        </div>
        
        <div class="footer">
            <p>This message was submitted through the Terracotta website contact form.</p>
            <p>You can reply directly to this email to respond to ${escapeHtml(formData.name)}.</p>
        </div>
    </div>
</body>
</html>
    `;
};

// Email configuration
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'owner@terracotta.com';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const IS_SMTP_CONFIGURED = Boolean(SMTP_USER && SMTP_PASS);

const createTransporter = () => {
    if (!IS_SMTP_CONFIGURED) {
        console.warn(
            '[contact] SMTP credentials missing. Falling back to Nodemailer JSON transport for local testing. ' +
            'Set SMTP_USER/SMTP_PASS to enable real emails.'
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
        const subject = asTrimmedString(raw.subject);
        const message = asTrimmedString(raw.message);

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }
        if (!isValidEmail(email)) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
        }

        const formData = {
            name: clampLength(name, 100),
            email: clampLength(email, 254),
            subject: clampLength(subject, 200),
            message: clampLength(message, 5000),
        };

        // Create transporter for sending emails
        const transporter = createTransporter();

        // Generate HTML email using the template
        const htmlEmail = contactEmailTemplate(formData);

        // Send email to restaurant owner
        const mailOptions = {
            from: SMTP_USER
                ? `"Terracotta Contact Form" <${SMTP_USER}>`
                : '"Terracotta Contact Form" <no-reply@terracotta.local>',
            to: OWNER_EMAIL,
            replyTo: formData.email, // Allow replying directly to the customer
            subject: `Contact Form: ${formData.subject}`,
            html: htmlEmail,
            text: `
New Contact Form Submission

Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}

---
This message was submitted through the Terracotta website contact form.
You can reply directly to this email to respond to ${formData.name}.
            `.trim(),
        };

        const info = await transporter.sendMail(mailOptions);

        if (!IS_SMTP_CONFIGURED) {
            console.info('[contact] Email captured (not sent). Preview JSON payload:\n', info.messageId);
        }

        return NextResponse.json(
            { message: 'Message sent successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error processing contact form:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}

// GET endpoint (optional - for testing)
export async function GET() {
    return NextResponse.json(
        { message: 'Contact API endpoint. Use POST to submit a contact form.' },
        { status: 200 }
    );
}

