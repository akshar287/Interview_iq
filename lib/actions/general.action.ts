"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams): Promise<CreateFeedbackResponse> {
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
    console.log("TRANSCRIPT PREVIEW:", formattedTranscript.slice(0, 100));

    let object;
    try {
      const response = await generateObject({
        model: google("gemini-flash-latest"),
        schema: feedbackSchema,
        prompt: `
          You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed.
          
          Transcript:
          ${formattedTranscript}
          ${facialAnalysisData}

          Please evaluate the candidate for these EXACT categories (use these exact names):
          1. Communication Skills
          2. Technical Knowledge
          3. Problem-Solving
          4. Cultural & Role Fit
          5. Confidence & Clarity

          Return a TotalScore (0-100) as a weighted average.
          `,
        system:
          "You are a professional interviewer. You must evaluate the candidate using ONLY the five categories provided: 'Communication Skills', 'Technical Knowledge', 'Problem-Solving', 'Cultural & Role Fit', and 'Confidence & Clarity'.",
      });
      object = response.object;
      console.log("AI FEEDBACK OBJECT RECEIVED SUCCESS");
    } catch (aiError: any) {
      console.error("AI GENERATION ERROR:", aiError?.message || aiError);
      throw aiError; // Re-throw to be caught by the outer catch
    }

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

    // Sync with Intern Profile if applicable
    const userDoc = await db.collection("users").doc(userId).get();
    if (userDoc.exists && userDoc.data()?.isIntern) {
      console.log("Syncing feedback with intern profile for user:", userId);
      await db.collection("users").doc(userId).update({
        lastInterviewId: interviewId,
        lastFeedbackId: feedbackRef.id,
        lastInterviewScore: object.totalScore,
        interviewStatus: "Completed",
      });
    }

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error: any) {
    console.error("CRITICAL ERROR SAVING FEEDBACK:", error?.message || error);
    return { success: false, error: error?.message || "Internal server error" };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  if (!interview.exists) return null;

  return { id: interview.id, ...interview.data() } as Interview;
}

export async function getFeedbackByInterviewId(
  params: { interviewId: string; userId?: string }
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  if (!interviewId) return null;

  let query = db.collection("feedback").where("interviewId", "==", interviewId);

  if (userId) {
    query = query.where("userId", "==", userId);
  }

  const querySnapshot = await query.limit(1).get();

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

export async function getCompanyInterviewsByRole(
  companyId: string,
  role: string
): Promise<Interview[]> {
  if (!companyId || !role) return [];

  const snapshot = await db
    .collection("interviews")
    .where("userId", "==", companyId)
    .where("role", "==", role)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}