// src/controllers/bookings.controller.ts
import { Request, Response, NextFunction } from "express";
import db from "../config/db";
import { bookings, insertBookingSchema, users, services } from "../models/schema";
import { eq } from "drizzle-orm";

// ======================
// CREATE BOOKING
// ======================
export async function createBooking(req: Request, res: Response, next: NextFunction) {
    try {
        const data = insertBookingSchema.parse(req.body);

        // Optionally: check if user and service exist
        const [user] = await db.select().from(users).where(eq(users.id, data.user_id));
        const [service] = await db.select().from(services).where(eq(services.id, data.service_id));

        if (!user) return res.status(400).json({ success: false, message: "Invalid user ID" });
        if (!service) return res.status(400).json({ success: false, message: "Invalid service ID" });

        const [newBooking] = await db.insert(bookings)
            .values({
                ...data,
                date: new Date(data.date),
            })
            .returning();

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
        const all = await db.select().from(bookings);
        res.json({ success: true, bookings: all });
    } catch (err) {
        next(err);
    }
}

// ======================
// GET BOOKING BY ID
// ======================
export async function getBookingById(req: Request, res: Response, next: NextFunction) {
    try {
        const id = parseInt(req.params.id);
        const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        res.json({ success: true, booking });
    } catch (err) {
        next(err);
    }
}

