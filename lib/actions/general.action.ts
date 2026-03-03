"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

/* ============================
   CREATE FEEDBACK
============================ */

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId, analysis } = params;

  try {
    const formattedTranscript =
      transcript && transcript.length > 0
        ? transcript
          .map(
            (sentence: { role: string; content: string }) =>
              `- ${sentence.role}: ${sentence.content}\n`
          )
          .join("")
        : "The candidate did not say anything or provide any responses.";

    const facialAnalysisData = analysis
      ? `
Additionally, real-time facial analysis during the interview showed:
- Average Eye Contact: ${analysis.avgEyeContact.toFixed(1)}%
- Confidence/Engagement Level: ${analysis.avgConfidence.toFixed(1)}%

Use these metrics to help inform your "Confidence & Clarity" score.
`
      : "";

    console.log("Generating AI Feedback for:", interviewId);

    const { object } = await generateObject({
      model: google("gemini-1.5-flash-latest"),
      schema: feedbackSchema,
      system:
        "You are a professional interviewer analyzing a mock interview. Be strict, detailed, and structured.",
      prompt: `
Evaluate the following interview transcript.

Transcript:
${formattedTranscript}

${facialAnalysisData}

Score the candidate from 0 to 100 in:
- Communication Skills
- Technical Knowledge
- Problem-Solving
- Cultural & Role Fit
- Confidence & Clarity

Return structured output according to schema.
`,
    });

    const feedback = {
      interviewId,
      userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    await db.collection("interviews").doc(interviewId).update({
      finalized: true,
    });

    console.log("Feedback saved successfully");

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error: any) {
    console.error("CRITICAL ERROR SAVING FEEDBACK:", error?.message || error);
    return { success: false };
  }
}

/* ============================
   GET INTERVIEW BY ID
============================ */

export async function getInterviewById(
  id: string
): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  if (!interview.exists) return null;

  return { id: interview.id, ...interview.data() } as Interview;
}

/* ============================
   GET FEEDBACK BY INTERVIEW ID
============================ */

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  if (!userId || !interviewId) return null;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];

  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

/* ============================
   FIXED: GET LATEST INTERVIEWS (DASHBOARD)
============================ */

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[]> {
  const { userId, limit = 20 } = params;

  if (!userId) return [];

  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .where("finalized", "==", true)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

/* ============================
   GET LATEST USER INTERVIEW
============================ */

export async function getLatestUserInterview(
  userId: string
): Promise<Interview | null> {
  if (!userId) return null;

  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  if (interviews.empty) return null;

  const doc = interviews.docs[0];

  return {
    id: doc.id,
    ...doc.data(),
  } as Interview;
}

/* ============================
   GET ALL INTERVIEWS BY USER
============================ */

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[]> {
  if (!userId) return [];

  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

/* ============================
   GET FEEDBACK BY USER
============================ */

export async function getFeedbackByUserId(
  userId: string
): Promise<Feedback[]> {
  if (!userId) return [];

  const feedbacks = await db
    .collection("feedback")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return feedbacks.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Feedback[];
}