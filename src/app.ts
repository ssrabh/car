import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import routes from "./routes";
import { NODE_ENV } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

// Security + parsing
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));

// Basic rate limiter
app.use(
    rateLimit({
        windowMs: 60 * 1000,
        max: 100
    })
);

// API routes
app.use("/api", routes);

// Error handler (last)
app.use(errorHandler);

export default app;

