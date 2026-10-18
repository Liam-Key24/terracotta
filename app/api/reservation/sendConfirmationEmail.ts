import nodemailer from 'nodemailer';
import { escapeHtml, escapeHtmlWithBreaks } from '../_utils';

const SMTP_HOST = process.env.SMTP_HOST ?? 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? '587', 10);
const SMTP_USER = process.env.SMTP_USER ?? '';
const SMTP_PASS = process.env.SMTP_PASS ?? '';
const IS_SMTP_CONFIGURED = Boolean(SMTP_USER && SMTP_PASS);

function createTransporter() {
    if (!IS_SMTP_CONFIGURED) {
        return nodemailer.createTransport({ jsonTransport: true });
    }
    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
}

const MOCK_NO_EMAIL = process.env.MOCK_NO_EMAIL === 'true';

function checkCircleIcon(size?: number): string {
    const s = size ?? 56;
    return `<svg width="${s}" height="${s}" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;vertical-align:middle;"><circle cx="128" cy="128" r="112" fill="#631732"/><path d="M72 128 L112 168 L184 96" stroke="white" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
}

function customerConfirmationEmailTemplate(formData: {
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    guests: string;
    specialRequests?: string;
}): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Table booked</title>
    <style>
        body { font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 24px; background-color: #f5f5f5; }
        .email-wrapper { max-width: 480px; margin: 0 auto; }
        .card { background: #fff; border-radius: 12px; padding: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #631732; }
        .header { background: linear-gradient(135deg, #631732 0%, #55122b 100%); color: white; padding: 20px 24px; text-align: center; }
        .header-table { margin: 0 auto; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.02em; }
        .header-icon-cell { padding-right: 12px; vertical-align: middle; }
        .content { padding: 24px 24px 28px; }
        .intro { font-size: 18px; color: #333; margin: 0 0 20px 0; }
        .details-card { background: #fafafa; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
        .detail-row { padding: 8px 0; font-size: 16px; }
        .detail-row:first-child { padding-top: 0; }
        .detail-row:last-child { padding-bottom: 0; }
        .detail-row strong { color: #631732; }
        .closing { font-size: 15px; color: #555; margin: 0 0 8px 0; }
        .footer { margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="card">
            <div class="header">
                <table class="header-table" role="presentation" cellpadding="0" cellspacing="0" align="center">
                    <tr>
                        <td class="header-icon-cell">${checkCircleIcon(28)}</td>
                        <td><h1>Table booked</h1></td>
                    </tr>
                </table>
            </div>
            <div class="content">
                <p class="intro">Hi ${escapeHtml(formData.name)}, your table at Terracotta is confirmed. We're excited to host you!</p>
                <div class="details-card">
                    <div class="detail-row"><strong>Date:</strong> ${escapeHtml(formData.date)}</div>
                    <div class="detail-row"><strong>Time:</strong> ${escapeHtml(formData.time)}</div>
                    <div class="detail-row"><strong>Guests:</strong> ${escapeHtml(formData.guests)}</div>
                    ${formData.specialRequests ? `<div class="detail-row"><strong>Notes:</strong> ${escapeHtmlWithBreaks(formData.specialRequests)}</div>` : ''}
                </div>
                <p class="closing">If you need to adjust anything, just reply to this email. See you soon!</p>
                <div class="footer">— Terracotta Team</div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}

export async function sendConfirmationEmail(params: {
    name: string;
    email: string;
    date: string;
    time: string;
    guests: string;
    specialRequests?: string;
}): Promise<void> {
    if (MOCK_NO_EMAIL) return;
    const transporter = createTransporter();
    const html = customerConfirmationEmailTemplate({
        ...params,
        phone: '',
    });
    await transporter.sendMail({
        from: SMTP_USER ? `"Terracotta Restaurant" <${SMTP_USER}>` : '"Terracotta" <noreply@local>',
        to: params.email,
        subject: `Reservation Confirmed - ${params.date} at ${params.time}`,
        html,
        text: `Booking confirmed! Hi ${params.name}, your table at Terracotta is confirmed for ${params.date} at ${params.time} (${params.guests} guests).`,
    });
}

const SORRY_EMAIL_SUBJECT = "We're booked – let's find you another time at Terracotta";

function escapeEmailText(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Format YYYY-MM-DD as "Tue 20 Oct" (en-GB). Falls back to the raw string. */
export function formatFriendlyBookingDate(date: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
    if (!m) return date;
    const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    if (Number.isNaN(d.getTime())) return date;
    return new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
    }).format(d);
}

function sorryFullyBookedEmailHtml(name: string, date: string, time: string, formUrl: string): string {
    const friendlyDate = formatFriendlyBookingDate(date);
    const escapedName = escapeEmailText(name);
    const escapedDate = escapeEmailText(friendlyDate);
    const escapedTime = escapeEmailText(time);
    const escapedUrl = escapeEmailText(formUrl);
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${SORRY_EMAIL_SUBJECT}</title>
    <style>
        body { font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 24px; background-color: #f5f5f5; }
        .email-wrapper { max-width: 400px; margin: 0 auto; }
        .card { background: #fff; border-radius: 12px; padding: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }
        .header { background: linear-gradient(135deg, #631732 0%, #55122b 100%); color: white; padding: 24px 24px 28px; text-align: center; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.02em; line-height: 1.35; }
        .content { padding: 28px 24px 32px; }
        .message { font-size: 17px; margin: 0 0 20px; color: #333; }
        .btn { display: inline-block; background: #631732; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 8px; }
        .footer { margin-top: 24px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
        a { color: #631732; font-weight: 600; }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="card">
            <div class="header"><h1>Let's find another time</h1></div>
            <div class="content">
                <p class="message">Hi ${escapedName},</p>
                <p class="message">Thank you so much for wanting to dine with us at Terracotta! Unfortunately we're fully booked for ${escapedDate} at ${escapedTime}, so we can't confirm that reservation this time.</p>
                <p class="message">We'd still love to have you, so please book again for another day or time that works for you:</p>
                <p class="message"><a href="${escapedUrl}" class="btn" style="color:#ffffff !important; text-decoration:none;">Book another time</a></p>
                <p class="message">If you have any questions or a special occasion in mind, just reply to this email and we'll do our best to help.</p>
                <p class="message">Hope to see you soon,<br>The Terracotta Team</p>
            </div>
        </div>
    </div>
</body>
</html>`;
}

function sorryFullyBookedEmailText(name: string, date: string, time: string, formUrl: string): string {
    const friendlyDate = formatFriendlyBookingDate(date);
    return `Hi ${name},

Thank you so much for wanting to dine with us at Terracotta! Unfortunately we're fully booked for ${friendlyDate} at ${time}, so we can't confirm that reservation this time.

We'd still love to have you, so please book again for another day or time that works for you:

${formUrl}

If you have any questions or a special occasion in mind, just reply to this email and we'll do our best to help.

Hope to see you soon,
The Terracotta Team`;
}

export async function sendRejectionEmail(params: {
    name: string;
    email: string;
    date: string;
    time: string;
    formUrl: string;
}): Promise<void> {
    if (MOCK_NO_EMAIL) return;
    const transporter = createTransporter();
    await transporter.sendMail({
        from: SMTP_USER ? `"Terracotta Restaurant" <${SMTP_USER}>` : '"Terracotta" <noreply@local>',
        to: params.email,
        subject: SORRY_EMAIL_SUBJECT,
        html: sorryFullyBookedEmailHtml(params.name, params.date, params.time, params.formUrl),
        text: sorryFullyBookedEmailText(params.name, params.date, params.time, params.formUrl),
    });
}

export async function sendSlotFullEmail(params: {
    name: string;
    email: string;
    date: string;
    time: string;
    formUrl: string;
}): Promise<void> {
    if (MOCK_NO_EMAIL) return;
    const transporter = createTransporter();
    await transporter.sendMail({
        from: SMTP_USER ? `"Terracotta Restaurant" <${SMTP_USER}>` : '"Terracotta" <noreply@local>',
        to: params.email,
        subject: SORRY_EMAIL_SUBJECT,
        html: sorryFullyBookedEmailHtml(params.name, params.date, params.time, params.formUrl),
        text: sorryFullyBookedEmailText(params.name, params.date, params.time, params.formUrl),
    });
}

function alternativeOfferEmailHtml(name: string, suggestedDate: string, suggestedTime: string, confirmUrl: string): string {
    const escapedName = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const escapedDate = suggestedDate.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const escapedTime = suggestedTime.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const escapedUrl = confirmUrl.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alternative time offered</title>
    <style>
        body { font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 24px; background-color: #f5f5f5; }
        .email-wrapper { max-width: 400px; margin: 0 auto; }
        .card { background: #fff; border-radius: 12px; padding: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }
        .header { background: linear-gradient(135deg, #631732 0%, #55122b 100%); color: white; padding: 24px 24px 28px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.02em; }
        .content { padding: 28px 24px 32px; }
        .message { font-size: 17px; margin: 0 0 20px; color: #333; }
        .highlight { font-size: 18px; font-weight: 600; color: #631732; margin: 16px 0; }
        .btn { display: inline-block; background: #16a34a; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 8px; }
        .footer { margin-top: 24px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="card">
            <div class="header"><h1>Alternative time offered</h1></div>
            <div class="content">
                <p class="message">Hi ${escapedName},</p>
                <p class="message">We can't do your original request, but we'd love to offer you another time.</p>
                <p class="highlight">${escapedDate} at ${escapedTime}</p>
                <p class="message"><a href="${escapedUrl}" class="btn" style="color:#ffffff !important; text-decoration:none;">Confirm this booking</a></p>
                <div class="footer">— Terracotta Team</div>
            </div>
        </div>
    </div>
</body>
</html>`;
}

export async function sendAlternativeOfferEmail(params: {
    name: string;
    email: string;
    suggestedDate: string;
    suggestedTime: string;
    confirmUrl: string;
}): Promise<void> {
    if (MOCK_NO_EMAIL) return;
    const transporter = createTransporter();
    await transporter.sendMail({
        from: SMTP_USER ? `"Terracotta Restaurant" <${SMTP_USER}>` : '"Terracotta" <noreply@local>',
        to: params.email,
        subject: `Alternative time offered - ${params.suggestedDate} at ${params.suggestedTime}`,
        html: alternativeOfferEmailHtml(params.name, params.suggestedDate, params.suggestedTime, params.confirmUrl),
        text: `Hi ${params.name}, we can't do your original request but we'd like to offer ${params.suggestedDate} at ${params.suggestedTime}. Confirm here: ${params.confirmUrl}`,
    });
}

function ownerAlternativeConfirmedHtml(params: {
    name: string;
    email: string;
    date: string;
    time: string;
    guests: string;
}): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alternative confirmed</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; background:#f5f5f5; padding:24px;">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;">
        <h2 style="margin:0 0 12px;color:#631732;">Alternative confirmed by guest</h2>
        <p style="margin:0 0 8px;"><strong>Name:</strong> ${escapeHtml(params.name)}</p>
        <p style="margin:0 0 8px;"><strong>Email:</strong> ${escapeHtml(params.email)}</p>
        <p style="margin:0 0 8px;"><strong>Date:</strong> ${escapeHtml(params.date)}</p>
        <p style="margin:0 0 8px;"><strong>Time:</strong> ${escapeHtml(params.time)}</p>
        <p style="margin:0;"><strong>Guests:</strong> ${escapeHtml(params.guests)}</p>
    </div>
</body>
</html>`;
}

export async function sendOwnerAlternativeConfirmedEmail(params: {
    ownerEmail: string;
    name: string;
    email: string;
    date: string;
    time: string;
    guests: string;
}): Promise<void> {
    if (MOCK_NO_EMAIL) return;
    if (!params.ownerEmail) return;
    const transporter = createTransporter();
    await transporter.sendMail({
        from: SMTP_USER ? `"Terracotta Restaurant" <${SMTP_USER}>` : '"Terracotta" <noreply@local>',
        to: params.ownerEmail,
        subject: `Alternative confirmed - ${params.name} (${params.date} ${params.time})`,
        html: ownerAlternativeConfirmedHtml(params),
        text: `Alternative confirmed by guest.\nName: ${params.name}\nEmail: ${params.email}\nDate: ${params.date}\nTime: ${params.time}\nGuests: ${params.guests}`,
    });
}
