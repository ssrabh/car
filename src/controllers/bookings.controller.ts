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
 * Constructs and sends the booking confirmation email with modern UI.
 */
async function sendBookingConfirmationEmail(booking: typeof bookings.$inferSelect) {
    const servicesList = booking.services.map(service =>
        `<li style="margin-bottom: 5px; color: #555;">${service}</li>`
    ).join('');

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
                
                <tr>
                    <td align="center" style="padding: 20px; background-color: #007bff; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Car Care India</h1>
                    </td>
                </tr>

                <tr>
                    <td style="padding: 30px;">
                        <h2 style="color: #007bff; margin-top: 0; font-size: 22px;">Booking Confirmed! 🎉</h2>
                        
                        <p style="font-size: 16px;">Dear <strong>${booking.name}</strong>,</p>
                        <p style="font-size: 16px;">Thank you for choosing us! Your booking has been successfully received and is currently **${booking.status.toUpperCase()}**.</p>
                        
                        <table width="100%" border="0" cellspacing="0" cellpadding="10" style="margin-top: 20px; border: 1px solid #eee; border-radius: 4px;">
                            <tr style="background-color: #f9f9f9;">
                                <td style="font-weight: bold; color: #007bff;">Booking ID:</td>
                                <td align="right" style="font-weight: bold;">#${booking.id.substring(0, 8)}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold; color: #333;">Vehicle Type:</td>
                                <td align="right">${booking.vehicleType}</td>
                            </tr>
                            <tr style="background-color: #f9f9f9;">
                                <td style="font-weight: bold; color: #333;">Date & Time:</td>
                                <td align="right">${booking.preferredDate || 'N/A'} at ${booking.preferredTime || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold; color: #333;">Date Created:</td>
                                <td align="right">${new Date(booking.createdAt).toLocaleDateString()}</td>
                            </tr>
                        </table>

                        <h3 style="color: #333; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Requested Services:</h3>
                        <ul style="list-style-type: none; padding-left: 0; margin-top: 10px;">
                            ${servicesList}
                        </ul>
                        
                        ${booking.message ? `
                            <div style="margin-top: 20px; padding: 10px; border-left: 3px solid #007bff; background-color: #e9f5ff;">
                                <p style="margin: 0; font-style: italic; color: #333;">**Customer Message:** ${booking.message}</p>
                            </div>
                        ` : ''}

                        <p style="margin-top: 30px; font-size: 16px; text-align: center;">
                            <a href="#" style="background-color: #28a745; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Booking Details</a>
                        </p>

                        <p style="margin-top: 25px; font-size: 15px;">We will contact you shortly to confirm the final appointment slot. If you have any questions, please reply to this email.</p>
                        
                    </td>
                </tr>

                <tr>
                    <td align="center" style="padding: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                        &copy; ${new Date().getFullYear()} Car Care India. All rights reserved.
                    </td>
                </tr>
            </table>
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