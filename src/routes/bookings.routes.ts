// src/routes/bookings.routes.ts
import { Router } from "express";
import { createBooking, getAllBookings, getBookingById } from "../controllers/bookings.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const r = Router();

r.get("/", requireAuth, getAllBookings);
r.get("/:id", requireAuth, getBookingById);
r.post("/", requireAuth, createBooking);

export default r;
