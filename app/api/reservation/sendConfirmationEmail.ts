import nodemailer from 'nodemailer';
import { customerConfirmationEmailTemplate } from './confirm/route';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
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

function rejectionEmailHtml(name: string, formUrl: string): string {
    const escapedName = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const escapedUrl = formUrl.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reservation update</title>
    <style>
        body { font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 24px; background-color: #f5f5f5; }
        .email-wrapper { max-width: 400px; margin: 0 auto; }
        .card { background: #fff; border-radius: 12px; padding: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }
        .header { background: linear-gradient(135deg, #631732 0%, #55122b 100%); color: white; padding: 24px 24px 28px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.02em; }
        .content { padding: 28px 24px 32px; }
        .message { font-size: 17px; margin: 0 0 20px; color: #333; }
        .footer { margin-top: 24px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
        a { color: #631732; font-weight: 600; }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="card">
            <div class="header"><h1>Reservation update</h1></div>
            <div class="content">
                <p class="message">Hi ${escapedName},</p>
                <p class="message">We're sorry — we couldn't accommodate your request for this time. Please try another date or time; we'd love to have you.</p>
                <p class="message"><a href="${escapedUrl}">Book another time</a></p>
                <div class="footer">— Terracotta Team</div>
            </div>
        </div>
    </div>
</body>
</html>`;
}

export async function sendRejectionEmail(params: { name: string; email: string; formUrl: string }): Promise<void> {
    if (MOCK_NO_EMAIL) return;
    const transporter = createTransporter();
    await transporter.sendMail({
        from: SMTP_USER ? `"Terracotta Restaurant" <${SMTP_USER}>` : '"Terracotta" <noreply@local>',
        to: params.email,
        subject: 'Reservation request – try another time',
        html: rejectionEmailHtml(params.name, params.formUrl),
        text: `Hi ${params.name}, we're sorry we couldn't accommodate your request for this time. Please try another date or time. Book here: ${params.formUrl}`,
    });
}

function slotFullEmailHtml(name: string, date: string, time: string, formUrl: string): string {
    const escapedName = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const escapedDate = date.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const escapedTime = time.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const escapedUrl = formUrl.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking not available</title>
    <style>
        body { font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 24px; background-color: #f5f5f5; }
        .email-wrapper { max-width: 400px; margin: 0 auto; }
        .card { background: #fff; border-radius: 12px; padding: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }
        .header { background: linear-gradient(135deg, #631732 0%, #55122b 100%); color: white; padding: 24px 24px 28px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.02em; }
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
            <div class="header"><h1>Booking not available</h1></div>
            <div class="content">
                <p class="message">Hi ${escapedName},</p>
                <p class="message">This date and time is fully booked. Please choose another time.</p>
                <p class="message"><a href="${escapedUrl}" class="btn" style="color:#ffffff !important; text-decoration:none;">Go to website</a></p>
                <div class="footer">— Terracotta Team</div>
            </div>
        </div>
    </div>
</body>
</html>`;
}

export async function sendSlotFullEmail(params: { name: string; email: string; date: string; time: string; formUrl: string }): Promise<void> {
    if (MOCK_NO_EMAIL) return;
    const transporter = createTransporter();
    await transporter.sendMail({
        from: SMTP_USER ? `"Terracotta Restaurant" <${SMTP_USER}>` : '"Terracotta" <noreply@local>',
        to: params.email,
        subject: `Booking not available — ${params.date} at ${params.time} is fully booked`,
        html: slotFullEmailHtml(params.name, params.date, params.time, params.formUrl),
        text: `Hi ${params.name}, this date and time is fully booked. Please choose another time. ${params.formUrl}`,
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
