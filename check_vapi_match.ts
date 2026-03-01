import { db } from "./firebase/admin";

async function checkUser(userId: string) {
    console.log(`Checking Firestore for userId: ${userId}`);

    // 1. Check interviews
    const interviewsSnap = await db.collection("interviews")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(5)
        .get();

    console.log(`\nInterviews found: ${interviewsSnap.size}`);
    interviewsSnap.forEach(doc => {
        console.log(`- Interview ID: ${doc.id}, Job: ${doc.data().jobTitle}, Created: ${doc.data().createdAt.toDate().toISOString()}`);
    });

    // 2. Check vapi_debug_logs
    const debugLogsSnap = await db.collection("vapi_debug_logs")
        .orderBy("timestamp", "desc")
        .limit(10)
        .get();

    console.log(`\nRecent Debug Logs: ${debugLogsSnap.size}`);
    debugLogsSnap.forEach(doc => {
        const data = doc.data();
        console.log(`- Log: ${data.type || 'unknown'}, Received: ${data.receivedAt}, Timestamp: ${data.timestamp}`);
        if (data.userId === userId || data.message?.variableValues?.userid === userId) {
            console.log(`  >>> MATCHED USER ID: ${userId}`);
        }
    });
}

const targetUserId = "71CFvDt9UZU46wYylizhsvfZgwh1";
checkUser(targetUserId).catch(console.error);
