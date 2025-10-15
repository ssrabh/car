import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql", // 👈 REQUIRED for new Drizzle versions
    schema: "./src/models/schema.ts",
    out: "./drizzle",
    dbCredentials: {
        url: process.env.DATABASE_URL!, // 👈 updated key name
    },
});
