
import * as admin from "firebase-admin";
import * as fs from "fs";
import * as dotenv from "dotenv";

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
        const setups = await db.collection("interview_setups").get();
        const interviews = await db.collection("interviews").get();

        console.log(`Setups: ${setups.size}, Interviews: ${interviews.size}`);

        const data = {
            interview_setups: {
                count: setups.size,
                docs: setups.docs.slice(0, 10).map(d => ({ id: d.id, ...d.data() }))
            },
            interviews: {
                count: interviews.size,
                docs: interviews.docs.slice(0, 5).map(d => ({ id: d.id, ...d.data() }))
            }
        };

        const outputPath = "c:/Users/Akshar/Desktop/talent_iq/ai_mock_interviews/final_check_results.json";
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log("Results written to:", outputPath);
    } catch (e: any) {
        console.error("Error:", e);
    }
}

run();
