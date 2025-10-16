import { Request, Response, NextFunction } from "express";
import db from "../config/db";
import { bookings, insertBookingSchema } from "../models/schema";
import { eq } from "drizzle-orm";

// ======================
// CREATE BOOKING
// ======================
export async function createBooking(req: Request, res: Response, next: NextFunction) {
    try {
        const data = insertBookingSchema.parse(req.body);

        const [newBooking] = await db.insert(bookings).values(data).returning();

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking: newBooking,
        });
    } catch (err) {
        next(err);
    }
}

// ======================
// GET ALL BOOKINGS
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
// GET BOOKING BY ID
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
