import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json();
  console.log("VAPI WEBHOOK RECEIVED:", JSON.stringify(body, null, 2));
  const { type, role, level, techstack, amount, userid, userId: userIdFromVapi } = body;
  const finalUserId = userid || userIdFromVapi;
  console.log("MAPPED USERID:", finalUserId);

  try {
    console.log("GENERATING QUESTIONS WITH AI...");
    const { text: questions } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    console.log("AI QUESTIONS RECEIVED:", questions);

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: finalUserId,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    console.log("SAVING INTERVIEW TO DB:", JSON.stringify(interview, null, 2));
    const docRef = await db.collection("interviews").add(interview);
    console.log("INTERVIEW SAVED SUCCESSFULLY WITH ID:", docRef.id);

    return Response.json({ success: true, id: docRef.id }, { status: 200 });
  } catch (error: any) {
    console.error("WEBHOOK ERROR IN GENERATE ROUTE:", error?.message || error);
    return Response.json({ success: false, error: error?.message || error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
