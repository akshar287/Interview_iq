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

  const message = body.message;
  if (!message) return Response.json({ success: false, error: "No message found" }, { status: 400 });

  // ONLY trigger interview generation on end-of-call-report
  if (message.type !== "end-of-call-report") {
    console.log(`Ignoring Vapi message type: ${message.type}`);
    return Response.json({ success: true, message: `Ignored message type: ${message.type}` }, { status: 200 });
  }

  console.log("PROCESSING END-OF-CALL-REPORT...");

  // Robust parsing of variables and metadata
  const variables = message.variableValues || message.call?.variableValues || message.call?.assistantOverrides?.variableValues || {};
  const metadata = message.metadata || message.call?.metadata || message.assistant?.metadata || {};

  const role = variables.role || body.role || "Software Engineer";
  const type = variables.type || body.type || "technical";
  const level = variables.level || body.level || "Senior";
  const techstackStr = variables.techstack || body.techstack || "Next.js, Tailwind CSS";
  const amount = variables.amount || body.amount || "5";

  const finalUserId = metadata.userid || variables.userid || body.userid || body.userId || "anonymous";

  console.log("MAPPED DATA FROM WEBHOOK:", { role, finalUserId, type });

  try {
    console.log("GENERATING QUESTIONS WITH AI...");
    const { text: questions } = await generateText({
      model: google("gemini-1.5-flash-latest"),
      prompt: `Prepare exactly ${amount} interview questions for a ${level} level ${role} role.
        The tech stack is: ${techstackStr}.
        Focus: ${type} questions.
        Return ONLY a JSON array of strings. Do not include any other text or markdown formatting.
        Example: ["Question 1", "Question 2"]
    `,
    });

    console.log("AI QUESTIONS RECEIVED");

    let parsedQuestions = [];
    try {
      const cleanJson = questions.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedQuestions = JSON.parse(cleanJson);
    } catch (e) {
      console.error("JSON PARSE ERROR, using fallback questions");
      parsedQuestions = [
        "Can you describe your experience with this tech stack?",
        "What is the most challenging project you've worked on recently?",
        "How do you stay up-to-date with new technologies?"
      ];
    }

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: typeof techstackStr === "string" ? techstackStr.split(",").map((s: string) => s.trim()) : techstackStr,
      questions: parsedQuestions,
      userId: finalUserId,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    console.log("SAVING INTERVIEW FOR USER:", finalUserId);
    const docRef = await db.collection("interviews").add(interview);
    console.log("INTERVIEW SAVED ID:", docRef.id);

    return Response.json({ success: true, id: docRef.id }, { status: 200 });
  } catch (error: any) {
    console.error("WEBHOOK PROCESSING ERROR:", error?.message || error);
    return Response.json({ success: false, error: error?.message || error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, message: "Webhook endpoint is active" }, { status: 200 });
}
