import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// HTML Email Template for Owner
const reservationEmailTemplate = (formData: {
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    guests: string;
    specialRequests?: string;
}, confirmationUrl: string) => {
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
            border-left: 4px solid #ea580c;
            margin-top: 10px;
        }
        .confirm-button {
            display: inline-block;
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .confirm-button:hover {
            background: linear-gradient(135deg, #15803d 0%, #166534 100%);
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background-color: #f0fdf4;
            border-radius: 8px;
            border: 2px solid #16a34a;
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
            <h1>🍽️ New Table Reservation</h1>
        </div>
        
        <div class="info-section">
            <div class="info-row">
                <div class="info-label">Guest Name:</div>
                <div class="info-value">${formData.name}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value">${formData.email}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Phone:</div>
                <div class="info-value">${formData.phone}</div>
            </div>
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
        
        <div class="button-container">
            <p style="margin-bottom: 15px; color: #166534; font-weight: bold;">Click the button below to confirm this reservation and send a confirmation email to the customer:</p>
            <a href="${confirmationUrl}" class="confirm-button">✓ Confirm Reservation</a>
        </div>
        
        <div class="footer">
            <p>This reservation was submitted through the Terracotta website.</p>
            <p>Click the button above to confirm and notify the customer.</p>
        </div>
    </div>
</body>
</html>
    `;
};

// Email configuration - these should be set as environment variables
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'owner@terracotta.com';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.json();

        // Validate required fields
        if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time || !formData.guests) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create transporter for sending emails
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_PORT === 465, // true for 465, false for other ports
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });

        // Generate confirmation token (base64 encoded reservation data)
        const confirmationToken = Buffer.from(JSON.stringify(formData)).toString('base64');
        
        // Get base URL for confirmation link
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                       request.headers.get('origin') || 
                       'http://localhost:3000';
        const confirmationUrl = `${baseUrl}/api/reservation/confirm?token=${encodeURIComponent(confirmationToken)}`;
        
        // Generate HTML email using the template
        const htmlEmail = reservationEmailTemplate(formData, confirmationUrl);

        // Send email to restaurant owner
        const mailOptions = {
            from: `"Terracotta Reservations" <${SMTP_USER}>`,
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
Number of Guests: ${formData.guests}
${formData.specialRequests ? `Special Requests: ${formData.specialRequests}` : ''}

This reservation was submitted through the Terracotta website.
Please confirm this reservation with the guest as soon as possible.
            `.trim(),
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json(
            { message: 'Reservation submitted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error processing reservation:', error);
        return NextResponse.json(
            { error: 'Failed to process reservation' },
            { status: 500 }
        );
    }
}

// GET endpoint (optional - for testing or retrieving reservations)
export async function GET(request: NextRequest) {
    return NextResponse.json(
        { message: 'Reservation API endpoint. Use POST to submit a reservation.' },
        { status: 200 }
    );
}

