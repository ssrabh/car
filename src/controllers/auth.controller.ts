import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { hashPassword, comparePassword } from "../utils/hash";
import { signJwt } from "../utils/jwt";

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6)
});

// NOTE: These controllers are simplified to illustrate flow.
export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const data = registerSchema.parse(req.body);
        // TODO: insert into DB using drizzle
        // Example: await db.insert(users).values({ ... })
        const hashed = await hashPassword(data.password);
        // return safe response (do not return hashed password)
        res.status(201).json({ success: true, user: { name: data.name, email: data.email } });
    } catch (err) {
        next(err);
    }
}

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const data = loginSchema.parse(req.body);
        // TODO: fetch user from DB, compare password
        // if success:
        const token = signJwt({ userId: 1 }); // replace with real id
        res.json({ success: true, token });
    } catch (err) {
        next(err);
    }
}

