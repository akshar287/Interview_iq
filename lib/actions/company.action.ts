"use server";

import { auth as adminAuth, db } from "@/firebase/admin";
import { revalidatePath } from "next/cache";

export async function addIntern({
    companyId,
    companyName,
    name,
    role,
    experience,
}: {
    companyId: string;
    companyName: string;
    name: string;
    role: string;
    experience: string;
}) {
    try {
        console.log("Adding intern for company:", { companyId, companyName, name, role });

        // Generate a unique ID (email) and password for the intern
        const internId = `${name.toLowerCase().replace(/\s+/g, ".")}.${Math.floor(
            1000 + Math.random() * 9000
        )}@intern.talent-iq.com`;

        // Ensure password is at least 8 characters
        const internPassword = Math.random().toString(36).slice(-10).padStart(8, '0');

        console.log("Generated intern credentials:", { internId, internPasswordLength: internPassword.length });

        // Create user in Firebase Auth
        console.log("Creating user in Firebase Auth...");
        const userRecord = await adminAuth.createUser({
            email: internId,
            password: internPassword,
            displayName: name,
        });
        console.log("Firebase Auth user created:", userRecord.uid);

        // Store intern details in 'users' collection with special flags
        console.log("Storing intern details in Firestore...");
        await db.collection("users").doc(userRecord.uid).set({
            name,
            email: internId,
            password: internPassword, // Store password so company can see it
            role,
            experience,
            companyId,
            companyName,
            isIntern: true,
            createdAt: new Date(),
        });
        console.log("Firestore record created successfully.");

        // Automatically create an interview for the intern based on company input
        console.log("Creating automated interview profile for intern...");
        await db.collection("interviews").add({
            userId: userRecord.uid,
            role: role,
            position: role,
            experience: experience,
            techstack: [],
            type: "Technical",
            finalized: false,
            createdAt: new Date().toISOString(),
        });
        console.log("Automated interview profile created.");

        revalidatePath("/company");

        return {
            success: true,
            internCredentials: {
                id: internId,
                password: internPassword,
            },
        };
    } catch (error: any) {
        console.error("CRITICAL ERROR IN ADD_INTERN:", error);
        return {
            success: false,
            message: error.message || "Failed to add intern.",
        };
    }
}

export async function getCompanyInterns(companyId: string) {
    try {
        const snapshot = await db
            .collection("users")
            .where("companyId", "==", companyId)
            .where("isIntern", "==", true)
            .get();

        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
            };
        });
    } catch (error) {
        console.error("Error fetching interns:", error);
        return [];
    }
}
export async function deleteIntern(uid: string) {
    try {
        console.log("Deleting intern with UID:", uid);

        // Delete from Firebase Auth
        await adminAuth.deleteUser(uid);
        console.log("Firebase Auth user deleted.");

        // Delete from Firestore 'users' collection
        await db.collection("users").doc(uid).delete();
        console.log("Firestore 'users' record deleted.");

        // Note: Related interviews and feedback are kept for historical records 
        // but could be deleted here if needed.

        revalidatePath("/company");

        return { success: true };
    } catch (error: any) {
        console.error("Error deleting intern:", error);
        return { success: false, message: error.message || "Failed to delete intern." };
    }
}
