"use server";

import Groq from "groq-sdk";
import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";
import { z } from "zod";

/* ============================
   INIT GROQ
============================ */

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

/* ============================
   CREATE FEEDBACK (GROQ VERSION)
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

Use these metrics to help inform the "Confidence & Clarity" score.
`
      : "";

    console.log("Generating AI Feedback using GROQ for:", interviewId);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Best Groq model currently
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You are a strict professional interviewer. Return only valid JSON. Do not explain anything.",
        },
        {
          role: "user",
          content: `
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

Return strictly in this JSON format:

{
  "totalScore": number,
  "categoryScores": [
    { "name": string, "score": number, "comment": string }
  ],
  "strengths": string[],
  "areasForImprovement": string[],
  "finalAssessment": string
}
`,
        },
      ],
    });

    const rawOutput = completion.choices[0]?.message?.content;

    if (!rawOutput) {
      throw new Error("Groq returned empty response");
    }

    let parsed;

    try {
      parsed = JSON.parse(rawOutput);
    } catch (err) {
      console.error("Invalid JSON from Groq:", rawOutput);
      throw new Error("Failed to parse Groq JSON response");
    }

    // Validate using your existing Zod schema
    const object = feedbackSchema.parse(parsed);

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

    console.log("Feedback saved successfully (Groq)");

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error: any) {
    console.error("CRITICAL ERROR SAVING FEEDBACK:", error?.message || error);
    return { success: false };
  }
}

/* ============================
   KEEP ALL OTHER FUNCTIONS SAME
============================ */

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();
  if (!interview.exists) return null;
  return { id: interview.id, ...interview.data() } as Interview;
}

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