
import { db } from "./firebase/admin";
import * as fs from "fs";

async function readLogs() {
    console.log("Starting readLogs script...");
    try {
        const collections = await db.listCollections();
        console.log("Available collections:", collections.map(c => c.id));

        const snapshot = await db.collection("vapi_debug_logs")
            .orderBy("receivedAt", "desc")
            .limit(10)
            .get();

        if (snapshot.empty) {
            console.log("No documents found in vapi_debug_logs.");
            fs.writeFileSync("vapi_logs_output.json", JSON.stringify({ message: "No documents found", collections: collections.map(c => c.id) }, null, 2));
            return;
        }

        console.log(`Found ${snapshot.docs.length} documents.`);
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        fs.writeFileSync("vapi_logs_output.json", JSON.stringify(data, null, 2));
        console.log("Successfully wrote logs to vapi_logs_output.json.");
    } catch (error: any) {
        console.error("FATAL ERROR IN readLogs:");
        console.error(error);
        fs.writeFileSync("vapi_logs_output.json", JSON.stringify({ error: error.message || error, stack: error.stack }, null, 2));
    }
}

readLogs();
