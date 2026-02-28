
import { db } from "./firebase/admin";
import * as fs from "fs";

async function diagRecent() {
    console.log("Checking for recent interviews...");
    try {
        const snapshot = await db.collection("interviews")
            .orderBy("createdAt", "desc")
            .limit(5)
            .get();

        if (snapshot.empty) {
            fs.writeFileSync("diag_output.json", JSON.stringify({ message: "No interviews found" }, null, 2));
            return;
        }

        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        fs.writeFileSync("diag_output.json", JSON.stringify(data, null, 2));
        console.log("Results written to diag_output.json");
    } catch (error: any) {
        fs.writeFileSync("diag_output.json", JSON.stringify({ error: error.message || error }, null, 2));
    }
}

diagRecent();
