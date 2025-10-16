
import * as nodemailer from 'nodemailer';
import 'dotenv/config';

// -----------------------------------------------------------------
// 1. SECURE CONFIGURATION: Read from environment variables
// -----------------------------------------------------------------

// Validate and parse environment variables immediately
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
export const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER; // Default 'from' address


if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error("❌ Email service environment variables are not fully configured.");
    // In a production app, you might throw an error or log and exit here.
}

// -----------------------------------------------------------------
// 2. CREATE TRANSPORTER
// -----------------------------------------------------------------

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // Use 'secure: true' if port is 465 (SSL/TLS)
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
    // Optional: Add a timeout to prevent hanging connections
    // timeout: 5000 
});

// -----------------------------------------------------------------
// 3. EXPORT SENDING FUNCTION
// -----------------------------------------------------------------

/**
 * Sends an email using the configured transporter.
 * @param to The recipient email address.
 * @param subject The subject line of the email.
 * @param text The plain text body of the email.
 * @param html The HTML body of the email.
 */
export async function sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string
) {
    if (!SMTP_HOST) {
        console.warn("Email service is disabled (missing SMTP_HOST). Skipping email.");
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: EMAIL_FROM, // The default sender address from .env
            to: to,
            subject: subject,
            text: text,
            html: html,
        });

        console.log("✅ Message sent: %s", info.messageId);
        // Optional: Preview URL if using a testing service like Ethereal
        // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        return info;
    } catch (error) {
        console.error("❌ Error sending email to %s:", to, error);
        throw new Error("Failed to send email due to server error.");
    }
}

// -----------------------------------------------------------------
// 4. (OPTIONAL) CONNECTION VERIFICATION
// -----------------------------------------------------------------

// Only run this check once to ensure connectivity
// transporter.verify((error, success) => {
//     if (error) {
//         console.error("❌ SMTP Connection Error:", error.message);
//     } else {
//         console.log("✅ SMTP Server is ready to take our messages.");
//     }
// });