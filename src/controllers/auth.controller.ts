import { Request, Response, NextFunction } from "express";
import { insertUserSchema, users } from "../models/schema";
import { hashPassword, comparePassword } from "../utils/hash";
import { signJwt } from "../utils/jwt";
import db from "../config/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

// ======================
// LOGIN SCHEMA
// ======================
const loginSchema = z.object({
    username: z.string().min(2, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// ======================
// REGISTER CONTROLLER
// ======================
export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        // ✅ Validate input
        const data = insertUserSchema.parse(req.body);

        // ✅ Check if username already exists
        const existingUser = await db.select().from(users).where(eq(users.username, data.username));
        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Username already exists. Please choose another one.",
            });
        }

        // ✅ Hash password
        const hashedPassword = await hashPassword(data.password);

        // ✅ Insert new user
        const [newUser] = await db
            .insert(users)
            .values({
                username: data.username,
                password: hashedPassword,
            })
            .returning({
                id: users.id,
                username: users.username,
            });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: newUser,
        });
    } catch (err) {
        next(err);
    }
}

// ======================
// LOGIN CONTROLLER
// ======================
export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        // ✅ Validate input
        const data = loginSchema.parse(req.body);

        // ✅ Find user by username
        const [user] = await db.select().from(users).where(eq(users.username, data.username));

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        // ✅ Compare password
        const isMatch = await comparePassword(data.password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        // ✅ Generate JWT
        const token = signJwt({ userId: user.id, username: user.username });

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: { id: user.id, username: user.username },
        });
    } catch (err) {
        next(err);
    }
}
