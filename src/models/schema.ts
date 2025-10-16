import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: text("password").notNull(),
    created_at: timestamp("created_at").defaultNow()
});

export const services = pgTable("services", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    price: varchar("price", { length: 50 }),
    created_at: timestamp("created_at").defaultNow()
});

export const bookings = pgTable("bookings", {
    id: serial("id").primaryKey(),
    user_id: serial("user_id").references(() => users.id),
    service_id: serial("service_id").references(() => services.id),
    date: timestamp("date").notNull(),
    status: varchar("status", { length: 50 }).default("pending"),
    created_at: timestamp("created_at").defaultNow()
});


