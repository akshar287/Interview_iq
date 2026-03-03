"use server";

import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

/* ============================
   CREATE FEEDBACK
============================ */

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId, analysis } = params;

  try {
    if (!interviewId || !userId) {
      throw new Error("Missing interviewId or userId");
    }

    /* ============================
       FORMAT TRANSCRIPT
    ============================ */

    const formattedTranscript =
      transcript && transcript.length > 0
        ? transcript
          .map(
            (sentence: { role: string; content: string }) =>
              `- ${sentence.role}: ${sentence.content}\n`
          )
          .join("")
        : "The candidate did not say anything or provide any responses.";

    /* ============================
       FACIAL ANALYSIS (SAFE)
    ============================ */

    const facialAnalysisData =
      analysis &&
        typeof analysis.avgEyeContact === "number" &&
        typeof analysis.avgConfidence === "number"
        ? `
Additionally, real-time facial analysis during the interview showed:
- Average Eye Contact: ${analysis.avgEyeContact.toFixed(1)}%
- Confidence/Engagement Level: ${analysis.avgConfidence.toFixed(1)}%
Use these metrics to help inform your "Confidence & Clarity" score and provide tips for better physical engagement.
`
        : "";

    /* ============================
       GENERATE AI FEEDBACK
    ============================ */

    const { object } = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: feedbackSchema,
      system:
        "You are a strict and professional interviewer analyzing a mock interview. Be detailed and critical.",
      prompt: `
You are evaluating a mock interview.

Transcript:
${formattedTranscript}

${facialAnalysisData}

Score the candidate from 0–100 in ONLY the following categories:
- Communication Skills
- Technical Knowledge
- Problem-Solving
- Cultural & Role Fit
- Confidence & Clarity

Do NOT add extra categories.
Provide strengths, areas for improvement, and a final professional assessment.
`,
    });

    /* ============================
       VALIDATE AI RESPONSE
    ============================ */

    if (!object?.totalScore || !object?.categoryScores) {
      throw new Error("Invalid AI response structure");
    }

    /* ============================
       PREPARE FEEDBACK OBJECT
    ============================ */

    const feedback = {
      interviewId,
      userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths ?? [],
      areasForImprovement: object.areasForImprovement ?? [],
      finalAssessment: object.finalAssessment ?? "",
      createdAt: new Date().toISOString(),
    };

    /* ============================
       SAVE TO FIRESTORE
    ============================ */

    const feedbackRef = feedbackId
      ? db.collection("feedback").doc(feedbackId)
      : db.collection("feedback").doc();

    await feedbackRef.set(feedback);

    /* ============================
       MARK INTERVIEW FINALIZED
    ============================ */

    await db.collection("interviews").doc(interviewId).update({
      finalized: true,
    });

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error: any) {
    console.error("ERROR CREATING FEEDBACK:", error?.message || error);
    return { success: false, error: error?.message };
  }
}

/* ============================
   GET INTERVIEW BY ID
============================ */

export async function getInterviewById(
  id: string
): Promise<Interview | null> {
  if (!id) return null;

  const interview = await db.collection("interviews").doc(id).get();
  if (!interview.exists) return null;

  return { id: interview.id, ...interview.data() } as Interview;
}

/* ============================
   GET FEEDBACK BY INTERVIEW
============================ */

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  if (!interviewId || !userId) return null;

  const snapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Feedback;
}

/* ============================
   GET LATEST PUBLIC INTERVIEWS
============================ */

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[]> {
  const { userId, limit = 20 } = params;

  if (!userId) return [];

  const snapshot = await db
    .collection("interviews")
    .where("finalized", "==", true)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter((interview) => interview.userId !== userId) as Interview[];
}

/* ============================
   GET LATEST USER INTERVIEW
============================ */

export async function getLatestUserInterview(
  userId: string
): Promise<Interview | null> {
  if (!userId) return null;

  const snapshot = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Interview;
}

/* ============================
   GET ALL USER INTERVIEWS
============================ */

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[]> {
  if (!userId) return [];

  const snapshot = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

/* ============================
   GET ALL USER FEEDBACK
============================ */

export async function getFeedbackByUserId(
  userId: string
): Promise<Feedback[]> {
  if (!userId) return [];

  const snapshot = await db
    .collection("feedback")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Feedback[];
}