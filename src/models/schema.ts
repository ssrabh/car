// src/models/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ======================
// USERS TABLE (Admin/Registered Users)
// ======================
export const users = pgTable("users", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
    username: true,
    password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ======================
// BOOKINGS TABLE (Public & Registered Users)
// ======================
export const bookings = pgTable("bookings", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    vehicleType: text("vehicle_type").notNull(),
    services: text("services").array().notNull(),
    preferredDate: text("preferred_date"),
    preferredTime: text("preferred_time"),
    message: text("message"),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookings)
    .omit({
        id: true,
        status: true,
        createdAt: true,
    })
    .extend({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email"),
        phone: z
            .string()
            .min(10, "Phone number must be at least 10 digits")
            .max(15, "Phone number too long"),
        vehicleType: z.string().min(1, "Please select a vehicle type"),
        services: z.array(z.string()).min(1, "Please select at least one service"),
        preferredDate: z.string().optional(),
        preferredTime: z.string().optional(),
        message: z.string().optional(),
    });

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;


