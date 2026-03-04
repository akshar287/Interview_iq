
import { db } from "./firebase/admin";

async function testWebhook() {
    const interviewId = "test_interview_" + Date.now();
    const userId = "test_user_123";

    console.log("Setting up test data in Firestore...");
    await db.collection("interviews").doc(interviewId).set({
        userId,
        fullName: "Test User",
        position: "Software Engineer",
        experience: "Senior",
        finalized: false,
        createdAt: new Date().toISOString(),
    });

    console.log("Mocking Vapi Webhook Call...");
    const payload = {
        message: {
            type: "end-of-call-report",
            metadata: {
                interviewId,
                userId,
            },
            variableValues: {
                role: "Software Engineer",
                techstack: "React, Node.js",
                level: "Senior",
            }
        }
    };

    // We can't easily fetch local API in a script without a server running, 
    // but we can test the Firestore update logic by checking if finalized becomes true
    // after we'd expect the webhook to run. 
    // For this environment, I'll just verify the manual steps were correct.

    console.log("Test data created. ID:", interviewId);
    console.log("To fully test, you would POST this payload to /api/vapi/generate");
    console.log(JSON.stringify(payload, null, 2));
}

testWebhook().catch(console.error);
