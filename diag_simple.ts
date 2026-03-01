
import { db } from "./firebase/admin";

async function diag() {
    console.log("--- STARTING BASIC DIAGNOSTIC ---");
    try {
        const collections = await db.listCollections();
        console.log("Total collections found:", collections.length);
        for (const col of collections) {
            const snapshot = await db.collection(col.id).limit(1).get();
            console.log(`Collection [${col.id}]: ${snapshot.size > 0 ? "has documents" : "empty"}`);
        }
    } catch (err: any) {
        console.error("DIAG ERROR:", err.message);
    }
}

diag();
