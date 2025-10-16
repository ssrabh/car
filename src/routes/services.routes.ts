// src/routes/services.routes.ts
import { Router } from "express";
import { createService, getAllServices, getServiceById } from "../controllers/services.controller";
import { requireAuth } from "../middlewares/auth.middleware"; // optional, if you want protection

const r = Router();

r.get("/", getAllServices);
r.get("/:id", getServiceById);
r.post("/", requireAuth, createService); // only authenticated users can add new service

export default r;
