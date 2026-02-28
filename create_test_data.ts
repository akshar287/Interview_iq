import { db } from "./firebase/admin";
import fs from "fs";

async function create() {
    const interview = {
        role: "Software Engineer",
        type: "Technical",
        level: "Mid",
        techstack: ["React", "Node", "TypeScript"],
        questions: [
            "Explain the difference between useMemo and useCallback.",
            "How does the event loop work in Node.js?",
            "What are the benefits of using TypeScript generic types?"
        ],
        userId: "71CFvDt9UZU46wYylizhsvfZgwh1",
        finalized: true,
        coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
        createdAt: new Date().toISOString()
    };

    console.log("Creating interview for userId: 71CFvDt9UZU46wYylizhsvfZgwh1");
    const docRef = await db.collection("interviews").add(interview);
    console.log("Created successfully! ID:", docRef.id);

    // FIXED: categoryScores is now an ARRAY to match feedbackSchema and the UI
    const feedback = {
        interviewId: docRef.id,
        userId: "71CFvDt9UZU46wYylizhsvfZgwh1",
        totalScore: 85,
        categoryScores: [
            {
                name: "Communication Skills",
                score: 90,
                comment: "Very clear and articulate responses."
            },
            {
                name: "Technical Knowledge",
                score: 80,
                comment: "Demonstrated good understanding of React hooks."
            },
            {
                name: "Problem Solving",
                score: 85,
                comment: "Approached problems with a structured mindset."
            },
            {
                name: "Cultural Fit",
                score: 85,
                comment: "Values align well with our agile culture."
            },
            {
                name: "Confidence and Clarity",
                score: 90,
                comment: "Maintained great eye contact and clarity throughout."
            }
        ],
        strengths: ["Strong React knowledge", "Clear communication"],
        areasForImprovement: ["Focus on Node.js internals"],
        finalAssessment: "Excellent candidate with strong frontend skills.",
        createdAt: new Date().toISOString()
    };

    const fRef = await db.collection("feedback").add(feedback);
    console.log("Created feedback successfully! ID:", fRef.id);

    process.exit(0);
}

create().catch(err => {
    console.error("FAILED to create data:", err);
    process.exit(1);
});
