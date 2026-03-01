"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

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
         Use these metrics to help inform your "Confidence & Clarity" score and provide tips for better physical engagement.`
      : "";

    console.log("GENERATING AI FEEDBACK FOR:", { interviewId, userId });
    const { object } = await generateObject({
      model: google("gemini-1.5-flash-latest"),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}
        ${facialAnalysisData}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    console.log("AI FEEDBACK OBJECT RECEIVED:", JSON.stringify(object, null, 2));

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

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    console.log("SAVING FEEDBACK TO DOC:", feedbackRef.id);
    await feedbackRef.set(feedback);

    console.log("Updating interview finalized status for:", interviewId);
    await db.collection("interviews").doc(interviewId).update({
      finalized: true,
    });

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error: any) {
    console.error("CRITICAL ERROR SAVING FEEDBACK:", error?.message || error);
    return { success: false };
  }
}

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
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  if (!userId) return [];

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .limit(limit + 20)
    .get();

  const formattedInterviews = interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];

  return formattedInterviews
    .filter(
      (interview) => interview.userId !== userId && interview.finalized === true
    )
    .slice(0, limit);
}

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

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  if (!userId) return [];

  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .get();

  const formatted = interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];

  return formatted.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
export async function getFeedbackByUserId(
  userId: string
): Promise<Feedback[] | null> {
  if (!userId) return [];

  const feedbacks = await db
    .collection("feedback")
    .where("userId", "==", userId)
    .get();

  return feedbacks.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Feedback[];
}
