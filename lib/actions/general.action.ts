"use server";

import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai"; // Use this for Groq
import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

function toIsoString(value: unknown): string {
  if (!value) return new Date(0).toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();

  // Firestore Timestamp has toDate()
  if (typeof value === "object" && value !== null && "toDate" in value) {
    const maybeTimestamp = value as { toDate?: () => Date };
    if (typeof maybeTimestamp.toDate === "function") {
      return maybeTimestamp.toDate().toISOString();
    }
  }

  if (typeof value === "number") return new Date(value).toISOString();
  return new Date(String(value)).toISOString();
}

function asInterview(id: string, data: FirebaseFirestore.DocumentData): Interview {
  return {
    id,
    role: data.role ?? "",
    level: data.level ?? "",
    questions: Array.isArray(data.questions) ? data.questions : [],
    techstack: Array.isArray(data.techstack) ? data.techstack : [],
    createdAt: toIsoString(data.createdAt),
    userId: data.userId ?? "",
    type: data.type ?? "",
    finalized: Boolean(data.finalized),
  };
}

function asFeedback(id: string, data: FirebaseFirestore.DocumentData): Feedback {
  return {
    id,
    interviewId: data.interviewId ?? "",
    totalScore: Number(data.totalScore ?? 0),
    categoryScores: Array.isArray(data.categoryScores) ? data.categoryScores : [],
    strengths: Array.isArray(data.strengths) ? data.strengths : [],
    areasForImprovement: Array.isArray(data.areasForImprovement)
      ? data.areasForImprovement
      : [],
    finalAssessment: data.finalAssessment ?? "",
    createdAt: toIsoString(data.createdAt),
  };
}

export async function getInterviewById(interviewId: string): Promise<Interview | null> {
  try {
    const doc = await db.collection("interviews").doc(interviewId).get();
    if (!doc.exists) return null;

    return asInterview(doc.id, doc.data() || {});
  } catch (error) {
    console.error("getInterviewById error:", error);
    return null;
  }
}

export async function getInterviewsByUserId(userId: string): Promise<Interview[]> {
  try {
    const snap = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .get();

    const interviews = snap.docs.map((d) => asInterview(d.id, d.data()));
    interviews.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return interviews;
  } catch (error) {
    console.error("getInterviewsByUserId error:", error);
    return [];
  }
}

export async function getLatestInterviews({
  userId,
  limit = 8,
}: GetLatestInterviewsParams): Promise<Interview[]> {
  try {
    // Avoid composite index requirements by sorting/filtering in-memory.
    const fetchLimit = Math.max(limit * 5, 30);
    const snap = await db
      .collection("interviews")
      .orderBy("createdAt", "desc")
      .limit(fetchLimit)
      .get();

    const interviews = snap.docs
      .map((d) => asInterview(d.id, d.data()))
      .filter((i) => i.userId !== userId)
      .filter((i) => i.finalized)
      .slice(0, limit);

    return interviews;
  } catch (error) {
    console.error("getLatestInterviews error:", error);
    return [];
  }
}

export async function getFeedbackByInterviewId({
  interviewId,
  userId,
}: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
  try {
    // Fetch feedback documents for this interview and return the latest one.
    // Since each interview belongs to a single user, filtering only by
    // interviewId is enough to get the correct feedback while keeping
    // Firestore indexes simple.
    const snap = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .get();

    const feedbackItems = snap.docs.map((d) => asFeedback(d.id, d.data()));

    feedbackItems.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return feedbackItems[0] ?? null;
  } catch (error) {
    console.error("getFeedbackByInterviewId error:", error);
    return null;
  }
}

export async function getFeedbackByUserId(userId: string): Promise<Feedback[]> {
  try {
    const snap = await db.collection("feedback").where("userId", "==", userId).get();
    const feedback = snap.docs.map((d) => asFeedback(d.id, d.data()));

    feedback.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return feedback;
  } catch (error) {
    console.error("getFeedbackByUserId error:", error);
    return [];
  }
}

// 1. Initialize the Groq Client
const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

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
      ? `\nAdditionally, real-time facial analysis during the interview showed:
           - Average Eye Contact: ${analysis.avgEyeContact.toFixed(1)}%
           - Confidence/Engagement Level: ${analysis.avgConfidence.toFixed(1)}%
           Use these metrics to help inform your "Confidence & Clarity" score.`
      : "";

    console.log("GENERATING GROQ AI FEEDBACK FOR:", { interviewId, userId });

    // 2. Change the model to a Groq model (Llama 3.3 is excellent for this)
    const { object } = await generateObject({
      // Type casting avoids provider/version mismatches during build-time typing.
      model: groq("llama-3.3-70b-versatile") as any, // Groq Model ID
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Evaluate the candidate strictly.
        Transcript:
        ${formattedTranscript}
        ${facialAnalysisData}

        Score from 0 to 100 in:
        - Communication Skills
        - Technical Knowledge
        - Problem-Solving
        - Cultural & Role Fit
        - Confidence & Clarity
        `,
      system: "You are a professional interviewer. Evaluate based on structured categories.",
    });

    // ... (rest of your Firebase saving logic remains EXACTLY the same)
    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef = feedbackId
      ? db.collection("feedback").doc(feedbackId)
      : db.collection("feedback").doc();

    await feedbackRef.set(feedback);
    await db.collection("interviews").doc(interviewId).update({ finalized: true });

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error: any) {
    console.error("CRITICAL ERROR SAVING FEEDBACK:", error?.message || error);
    return { success: false };
  }
}