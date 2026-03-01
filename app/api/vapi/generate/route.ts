import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch (e) {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Log raw body to Firestore for debugging
  try {
    await db.collection("vapi_debug_logs").add({
      receivedAt: new Date().toISOString(),
      payload: body,
      vapiMessageType: body.message?.type || "direct_post",
    });
  } catch (logError) {
    console.error("FAILED TO LOG VAPI PAYLOAD:", logError);
  }

  console.log("VAPI WEBHOOK RECEIVED");

  // Vapi sends data in message.call.variableValues or message.call.metadata
  const call = body.message?.call;
  const variables = call?.variableValues || {};
  const metadata = call?.metadata || {};

  const role = variables.role || body.role || "Software Engineer";
  const type = variables.type || body.type || "technical";
  const level = variables.level || body.level || "Senior";
  const techstackStr = variables.techstack || body.techstack || "Next.js, Tailwind CSS";
  const amount = variables.amount || body.amount || "5";

  const finalUserId = metadata.userid || variables.userid || body.userid || body.userId;

  console.log("MAPPED DATA:", { role, finalUserId });

  try {
    console.log("GENERATING QUESTIONS WITH AI...");
    const { text: questions } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstackStr}.
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

    let parsedQuestions = [];
    try {
      // Clean AI response
      const cleanJson = questions.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedQuestions = JSON.parse(cleanJson);
    } catch (e) {
      console.error("JSON PARSE ERROR:", questions);
      parsedQuestions = ["Could you tell me about your background?", "What are your core strengths?", "How do you handle difficult technical challenges?"];
    }

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: typeof techstackStr === "string" ? techstackStr.split(",").map((s: string) => s.trim()) : techstackStr,
      questions: parsedQuestions,
      userId: finalUserId || "anonymous",
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
