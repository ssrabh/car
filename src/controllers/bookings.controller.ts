import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { bookings } from "../models/schema";
import { eq } from "drizzle-orm";

// Zod validation schema

const bookingSchema = z.object({

})