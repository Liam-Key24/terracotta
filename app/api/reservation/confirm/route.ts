import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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
    <title>Reservation Confirmed</title>
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
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
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
        .confirmation-badge {
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background-color: #f0fdf4;
            border: 2px solid #16a34a;
            border-radius: 8px;
            color: #166534;
            font-weight: bold;
            font-size: 18px;
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
            color: #16a34a;
            width: 140px;
            flex-shrink: 0;
        }
        .info-value {
            color: #333;
            flex: 1;
        }
        .special-requests {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #16a34a;
            margin-top: 10px;
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
            <h1>✓ Reservation Confirmed!</h1>
        </div>
        
        <div class="confirmation-badge">
            🎉 Your table reservation has been confirmed!
        </div>
        
        <p>Dear ${formData.name},</p>
        <p>We're excited to confirm your reservation at Terracotta. Here are your reservation details:</p>
        
        <div class="info-section">
            <div class="info-row">
                <div class="info-label">Date:</div>
                <div class="info-value">${formData.date}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Time:</div>
                <div class="info-value">${formData.time}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Number of Guests:</div>
                <div class="info-value">${formData.guests}</div>
            </div>
            ${formData.specialRequests ? `
            <div class="special-requests">
                <strong>Special Requests:</strong><br>
                ${formData.specialRequests.replace(/\n/g, '<br>')}
            </div>
            ` : ''}
        </div>
        
        <p>We look forward to serving you! If you need to make any changes or have questions, please don't hesitate to contact us.</p>
        
        <div class="footer">
            <p><strong>Terracotta Restaurant</strong></p>
            <p>Thank you for choosing us!</p>
        </div>
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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
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
        } catch (error) {
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
        if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time || !formData.guests) {
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

        // Create transporter for sending emails
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_PORT === 465,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });

        // Generate HTML confirmation email for customer
        const htmlEmail = customerConfirmationEmailTemplate(formData);

        // Send confirmation email to customer
        const mailOptions = {
            from: `"Terracotta Restaurant" <${SMTP_USER}>`,
            to: formData.email,
            subject: `Reservation Confirmed - ${formData.date} at ${formData.time}`,
            html: htmlEmail,
            text: `
Reservation Confirmed!

Dear ${formData.name},

We're excited to confirm your reservation at Terracotta.

Date: ${formData.date}
Time: ${formData.time}
Number of Guests: ${formData.guests}
${formData.specialRequests ? `Special Requests: ${formData.specialRequests}` : ''}

We look forward to serving you!

Terracotta Restaurant
            `.trim(),
        };

        await transporter.sendMail(mailOptions);

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
                    <p>A confirmation email has been sent to <strong>${formData.email}</strong></p>
                    
                    <div class="details">
                        <div class="detail-row">
                            <span class="label">Guest:</span>
                            <span>${formData.name}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Date:</span>
                            <span>${formData.date}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Time:</span>
                            <span>${formData.time}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Guests:</span>
                            <span>${formData.guests}</span>
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

