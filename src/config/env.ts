import dotenv from "dotenv";
dotenv.config();

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) throw new Error(`Missing required environment variable: ${key}`);
    return value;
}

export const PORT = parseInt(process.env.PORT ?? "3000", 10);
export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const DATABASE_URL = requireEnv("DATABASE_URL");
export const JWT_SECRET = requireEnv("JWT_SECRET");
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1d";


