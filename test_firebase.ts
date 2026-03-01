
import { db } from "./firebase/admin";

async function test() {
    console.log("Testing Firestore connection...");
    try {
        const collections = await db.listCollections();
        console.log("Success! Collections:", collections.map(c => c.id));
    } catch (err) {
        console.error("Firestore connection failed:", err);
    }
}

test();
