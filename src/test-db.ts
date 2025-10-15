import { db } from "./config/db";
import { users } from "./models/schema";

async function test() {
    try {
        const result = await db.select().from(users);
        console.log("✅ DB Connected! Found users:", result.length);
    } catch (err) {
        console.error("❌ DB Error:", err);
    }
}

test();
