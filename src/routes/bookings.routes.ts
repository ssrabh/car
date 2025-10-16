
// src/routes/bookings.routes.ts
import { Router } from "express";
import { createBooking, getAllBookings, getBookingById } from "../controllers/bookings.controller";

const router = Router();

router.post("/", createBooking);
router.get("/", getAllBookings);
router.get("/:id", getBookingById);

export default router;

