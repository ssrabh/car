// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { hashPassword, comparePassword } from "../utils/hash";
import { signJwt } from "../utils/jwt";
import db from "../config/db";
import { users } from "../models/schema";
import { eq } from "drizzle-orm";

// Zod validation schemas
const registerSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});

// Register controller
export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const data = registerSchema.parse(req.body);

        // Check if email already exists
        const existingUser = await db.select().from(users).where(eq(users.email, data.email));
        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        const hashed = await hashPassword(data.password);

        const inserted = await db
            .insert(users)
            .values({
                name: data.name,
                email: data.email,
                password: hashed,
            })
            .returning({ id: users.id, name: users.name, email: users.email });

        const newUser = inserted[0];

        res.status(201).json({
            success: true,
            message: "Registration successful",
            user: newUser,
        });
    } catch (err) {
        next(err);
    }
}

// Login controller
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


