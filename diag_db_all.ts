
import { db } from "./firebase/admin";
import * as fs from "fs";

async function diag() {
    console.log("--- STARTING DATABASE DIAGNOSTIC ---");
    const results: any = {};
    try {
        const collections = ["interviews", "feedback", "vapi_debug_logs", "users", "interview_setups"];
        for (const col of collections) {
            const snapshot = await db.collection(col).limit(10).get();
            results[col] = {
                count: snapshot.size,
                docs: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            };
        }
        const outputPath = "c:/Users/Akshar/Desktop/talent_iq/ai_mock_interviews/diag_db_all_output.json";
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        console.log(`Results written to ${outputPath}`);
    } catch (err: any) {
        console.error("DIAG ERROR:", err);
        fs.writeFileSync("diag_db_all_output.json", JSON.stringify({ error: err.message || err }, null, 2));
    }
}

diag();
