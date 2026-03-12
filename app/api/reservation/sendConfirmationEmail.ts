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

const MOCK_NO_EMAIL = process.env.MOCK_NO_EMAIL === 'true' || process.env.NODE_ENV === 'development';

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
