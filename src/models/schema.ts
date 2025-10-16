// src/models/schema.ts
import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ======================
// USERS TABLE
// ======================
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: text("password").notNull(),
    created_at: timestamp("created_at").defaultNow(),
});

// Validation for user creation
export const insertUserSchema = createInsertSchema(users)
    .omit({
        id: true,
        created_at: true,
    })
    .extend({
        name: z.string().min(2, "Name must be at least 2 characters long"),
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters long"),
    });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ======================
// SERVICES TABLE
// ======================
export const services = pgTable("services", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    price: varchar("price", { length: 50 }),
    created_at: timestamp("created_at").defaultNow(),
});

// Validation for services
export const insertServiceSchema = createInsertSchema(services)
    .omit({
        id: true,
        created_at: true,
    })
    .extend({
        title: z.string().min(2, "Service title is required"),
        price: z.string().optional(),
    });

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// ======================
// BOOKINGS TABLE
// ======================
export const bookings = pgTable("bookings", {
    id: serial("id").primaryKey(),
    user_id: serial("user_id").references(() => users.id),
    service_id: serial("service_id").references(() => services.id),
    date: timestamp("date").notNull(),
    status: varchar("status", { length: 50 }).default("pending"),
    created_at: timestamp("created_at").defaultNow(),
});

// Validation for bookings
export const insertBookingSchema = createInsertSchema(bookings)
    .omit({
        id: true,
        created_at: true,
    })
    .extend({
        user_id: z.number().int("Invalid user ID"),
        service_id: z.number().int("Invalid service ID"),
        date: z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
    });

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

