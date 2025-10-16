// src/controllers/bookingController.ts (or wherever your createBooking is)

import { Request, Response, NextFunction } from "express";
import db from "../config/db";
import { bookings, insertBookingSchema } from "../models/schema"; // Your schemas
import { eq } from "drizzle-orm";
import { sendEmail, EMAIL_FROM } from "../services/emailService"; // Import the service and 'from' address

// ======================
// CREATE BOOKING
// ======================
export async function createBooking(req: Request, res: Response, next: NextFunction) {
    try {
        // 1. Validate incoming data
        const data = insertBookingSchema.parse(req.body);

        // 2. Insert into database
        const [newBooking] = await db.insert(bookings).values(data).returning();

        // 3. Prepare and Send Confirmation Email
        // The data object contains all customer info (name, email, phone, etc.)
        await sendBookingConfirmationEmail(newBooking);

        // 4. Respond to client
        res.status(201).json({
            success: true,
            message: "Booking created successfully. Confirmation email sent.",
            booking: newBooking,
        });

    } catch (err) {
        next(err);
    }
}


// ======================
// HELPER FUNCTION: SEND EMAIL
// ======================
/**
 * Constructs and sends the booking confirmation email.
 * Uses the returned booking object from the database for confirmation details.
 */
async function sendBookingConfirmationEmail(booking: typeof bookings.$inferSelect) {
    const servicesList = booking.services.map(service => `<li>${service}</li>`).join('');

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Booking Confirmation 🎉</h2>
            
            <p>Dear **${booking.name}**,</p>
            <p>Thank you for choosing Car Care India! Your booking has been successfully received and is currently **${booking.status.toUpperCase()}**.</p>
            
            <h3 style="color: #007bff;">Your Booking Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px 0; font-weight: bold;">Booking ID:</td><td style="padding: 5px 0;">#**${booking.id.substring(0, 8)}**</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Vehicle Type:</td><td style="padding: 5px 0;">${booking.vehicleType}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Preferred Date:</td><td style="padding: 5px 0;">${booking.preferredDate || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Preferred Time:</td><td style="padding: 5px 0;">${booking.preferredTime || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 0; font-weight: bold;">Date Created:</td><td style="padding: 5px 0;">${new Date(booking.createdAt).toLocaleDateString()}</td></tr>
            </table>

            <h3 style="color: #007bff; margin-top: 20px;">Requested Services:</h3>
            <ul style="list-style-type: disc; padding-left: 20px;">
                ${servicesList}
            </ul>

            <h3 style="color: #007bff; margin-top: 20px;">Contact Details:</h3>
            <p>Email: ${booking.email}</p>
            <p>Phone: ${booking.phone}</p>
            ${booking.message ? `<p>Message: *${booking.message}*</p>` : ''}

            <p style="margin-top: 25px; border-top: 1px solid #f0f0f0; padding-top: 15px; font-size: 0.9em; color: #666;">
                We will contact you shortly to confirm the exact appointment time. Thank you for your business!
            </p>
            <p style="font-size: 0.9em; color: #666;">
                The Car Care India Team
            </p>
        </div>
    `;

    const textContent = `
        Dear ${booking.name},

        Thank you for choosing Car Care India! Your booking has been successfully received.

        --- Booking Details ---
        Booking ID: #${booking.id.substring(0, 8)}
        Status: ${booking.status.toUpperCase()}
        Vehicle Type: ${booking.vehicleType}
        Date/Time: ${booking.preferredDate || 'N/A'} at ${booking.preferredTime || 'N/A'}
        
        Services: ${booking.services.join(', ')}

        We will contact you shortly to confirm the exact appointment time.

        The Car Care India Team
    `;

    // Call the email service function
    await sendEmail(
        booking.email,
        `Booking Confirmed! (ID: #${booking.id.substring(0, 8)})`,
        textContent,
        htmlContent
    );
}

// ======================
// GET ALL BOOKINGS (keep as is)
// ======================
export async function getAllBookings(_req: Request, res: Response, next: NextFunction) {
    try {
        const allBookings = await db.select().from(bookings).orderBy(bookings.createdAt);
        res.json({ success: true, bookings: allBookings });
    } catch (err) {
        next(err);
    }
}

// ======================
// GET BOOKING BY ID (keep as is)
// ======================
export async function getBookingById(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id;
        const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        res.json({ success: true, booking });
    } catch (err) {
        next(err);
    }
}