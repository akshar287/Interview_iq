"use server";

import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai"; // Use this for Groq
import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

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
      model: groq("llama-3.3-70b-versatile"), // Groq Model ID
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