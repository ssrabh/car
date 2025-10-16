// src/routes/index.ts
import { Router } from "express";
import authRoutes from "./auth.routes";
import bookingsRoutes from "./bookings.routes";
import servicesRoutes from "./services.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/bookings", bookingsRoutes);
router.use("/services", servicesRoutes);

router.get("/", (_, res) => res.json({ ok: true, message: "API is running" }));

export default router;
