import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, fullName, position, experience, resumeFileName, createdAt } = body;

        if (!userId || !position || !experience) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Save the interview setup form data to Firestore
        const docRef = await db.collection("interviews").add({
            userId,
            fullName,
            role: position,
            position,
            experience,
            techstack: [], // Initial empty techstack, can be updated later
            type: "Technical",
            finalized: false,
            resumeFileName: resumeFileName || null,
            createdAt: createdAt || new Date().toISOString(),
        });

        console.log(`Interview saved to 'interviews' collection for user ${userId}: ${docRef.id}`);

        return NextResponse.json({ success: true, setupId: docRef.id });
    } catch (error: any) {
        console.error("Error saving interview setup:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
