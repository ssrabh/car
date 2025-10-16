// src/controllers/services.controller.ts
import { Request, Response, NextFunction } from "express";
import db from "../config/db";
import { services, insertServiceSchema } from "../models/schema";
import { eq } from "drizzle-orm";

// ======================
// CREATE SERVICE
// ======================
export async function createService(req: Request, res: Response, next: NextFunction) {
    try {
        const data = insertServiceSchema.parse(req.body);

        const [newService] = await db.insert(services)
            .values(data)
            .returning();

        res.status(201).json({
            success: true,
            message: "Service created successfully",
            service: newService,
        });
    } catch (err) {
        next(err);
    }
}

// ======================
// GET ALL SERVICES
// ======================
export async function getAllServices(_req: Request, res: Response, next: NextFunction) {
    try {
        const all = await db.select().from(services);
        res.json({ success: true, services: all });
    } catch (err) {
        next(err);
    }
}

// ======================
// GET SERVICE BY ID
// ======================
export async function getServiceById(req: Request, res: Response, next: NextFunction) {
    try {
        const id = parseInt(req.params.id);
        const [service] = await db.select().from(services).where(eq(services.id, id));

        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        res.json({ success: true, service });
    } catch (err) {
        next(err);
    }
}
