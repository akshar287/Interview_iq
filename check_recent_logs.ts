import { db } from "./firebase/admin";

async function checkRecentLogs() {
    console.log("--- FETCHING LAST 5 LOG TIMESTAMPS ---");
    const snap = await db.collection("vapi_debug_logs")
        .orderBy("receivedAt", "desc")
        .limit(5)
        .get();

    if (snap.empty) {
        console.log("No logs found at all.");
        return;
    }

    snap.forEach(doc => {
        const data = doc.data();
        console.log(`Log ID: ${doc.id} | Received At: ${data.receivedAt} | Type: ${data.vapiMessageType || 'unknown'}`);
    });
}

checkRecentLogs().catch(console.error);
