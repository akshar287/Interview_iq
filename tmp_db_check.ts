import { db } from "./firebase/admin";

console.log("Script starting...");

import fs from "fs";

async function run() {
    const data: any = {
        users: [],
        interviews: [],
        feedback: []
    };

    const users = await db.collection("users").get();
    users.forEach(doc => {
        data.users.push({ id: doc.id, ...doc.data() });
    });

    const interviews = await db.collection("interviews").get();
    interviews.forEach(doc => {
        data.interviews.push({ id: doc.id, ...doc.data() });
    });

    const feedback = await db.collection("feedback").get();
    feedback.forEach(doc => {
        data.feedback.push({ id: doc.id, ...doc.data() });
    });

    fs.writeFileSync("db_dump.json", JSON.stringify(data, null, 2));
    console.log("Done writing to db_dump.json");
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
