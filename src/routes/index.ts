// src/routes/index.ts
import { Router } from "express";
import authRoutes from "./auth.routes";
import bookingsRoutes from "./bookings.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/bookings", bookingsRoutes);

router.get("/", (_, res) => res.json({ ok: true, message: "API is running 🚀" }));

export default router;
