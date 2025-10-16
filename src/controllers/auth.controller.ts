// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { insertUserSchema } from "../models/schema";
import { hashPassword, comparePassword } from "../utils/hash";
import { signJwt } from "../utils/jwt";
import db from "../config/db";
import { users } from "../models/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Login schema (still explicit, since not all fields are from DB)
const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// ======================
// REGISTER
// ======================
export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        // Validate input using shared schema
        const data = insertUserSchema.parse(req.body);

        // Check if email already exists
        const existing = await db.select().from(users).where(eq(users.email, data.email));
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        // Hash password
        const hashedPassword = await hashPassword(data.password);

        // Insert into DB
        const [newUser] = await db
            .insert(users)
            .values({ ...data, password: hashedPassword })
            .returning({ id: users.id, name: users.name, email: users.email });

        res.status(201).json({
            success: true,
            message: "Registration successful",
            user: newUser,
        });
    } catch (err) {
        next(err);
    }
}

// ======================
// LOGIN
// ======================
export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const data = loginSchema.parse(req.body);

        const user = await db.select().from(users).where(eq(users.email, data.email));
        if (user.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await comparePassword(data.password, user[0].password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = signJwt({ userId: user[0].id });

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: { id: user[0].id, name: user[0].name, email: user[0].email },
        });
    } catch (err) {
        next(err);
    }
}
