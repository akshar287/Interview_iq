
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load .env
dotenv.config();

const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const formattedKey = privateKey
    ? privateKey
        .replace(/\\n/g, "\n")
        .replace(/^"(.*)"$/, "$1")
        .replace(/^'(.*)'$/, "$1")
    : undefined;

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: formattedKey,
        }),
    });
}

const db = admin.firestore();

async function run() {
    console.log("Checking collections...");
    try {
        const interviewSetups = await db.collection("interview_setups").get();
        const interviews = await db.collection("interviews").get();

        const data = {
            interview_setups_count: interviewSetups.size,
            interviews_count: interviews.size,
            samples_setups: interviewSetups.docs.slice(0, 3).map(d => ({ id: d.id, ...d.data() })),
            samples_interviews: interviews.docs.slice(0, 3).map(d => ({ id: d.id, ...d.data() }))
        };

        fs.writeFileSync("migration_check_results.json", JSON.stringify(data, null, 2));
        console.log("Done checking.");
    } catch (e) {
        console.error("Error:", e);
        fs.writeFileSync("migration_check_results.json", JSON.stringify({ error: e.message }, null, 2));
    }
}

run();
