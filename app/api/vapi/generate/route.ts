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

  // ─── DIRECT CLIENT CALL (from Agent.tsx when generate call ends) ───────────
  // Detected when body has interviewId at top level (not inside message)
  if (body.interviewId && !body.message) {
    const { interviewId, userId, role, experience } = body;

    if (!interviewId) {
      return Response.json({ success: false, error: "Missing interviewId" }, { status: 400 });
    }

    try {
      const interviewDocRef = db.collection("interviews").doc(interviewId);
      const interviewDoc = await interviewDocRef.get();

      if (interviewDoc.exists && interviewDoc.data()?.finalized) {
        console.log("Interview already finalized. Skipping.");
        return Response.json({ success: true, message: "Already finalized" }, { status: 200 });
      }

      const level = experience || "entry";
      const roleName = role || "Software Engineer";
      const techstackStr = "JavaScript, TypeScript, React, Node.js";

      console.log("DIRECT GENERATE - generating questions for:", { interviewId, roleName, level });

      const { text: questions } = await generateText({
        model: google("gemini-1.5-flash"),
        prompt: `Prepare exactly 5 interview questions for a ${level} level ${roleName} role.
          Focus: technical and behavioral questions.
          Return ONLY a JSON array of strings. No markdown formatting.
          Example: ["Question 1", "Question 2"]
        `,
      });

      let parsedQuestions: string[] = [];
      try {
        const cleanJson = questions.replace(/```json/g, "").replace(/```/g, "").trim();
        parsedQuestions = JSON.parse(cleanJson);
      } catch (e) {
        console.error("JSON parse error, using fallback questions");
        parsedQuestions = [
          "Can you walk me through your background and experience?",
          "What is the most challenging project you've worked on recently?",
          "How do you handle tight deadlines and pressure?",
          "Describe a time you had to learn a new technology quickly.",
          "Where do you see yourself in 3 years?",
        ];
      }

      const updateData = {
        role: roleName,
        type: "Technical",
        level: level,
        techstack: ["JavaScript", "TypeScript", "React", "Node.js"],
        questions: parsedQuestions,
        userId: userId || "anonymous",
        finalized: true,
        coverImage: getRandomInterviewCover(),
        updatedAt: new Date().toISOString(),
      };

      await interviewDocRef.update(updateData);
      console.log("DIRECT GENERATE - interview finalized:", interviewId);

      return Response.json({ success: true, id: interviewId }, { status: 200 });
    } catch (error: any) {
      console.error("DIRECT GENERATE ERROR:", error?.message || error);
      return Response.json({ success: false, error: error?.message || error }, { status: 500 });
    }
  }

  // ─── VAPI WEBHOOK CALL (from Vapi cloud in production) ────────────────────
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

  if (message.type !== "end-of-call-report") {
    console.log(`Ignoring Vapi message type: ${message.type}`);
    return Response.json({ success: true, message: `Ignored message type: ${message.type}` }, { status: 200 });
  }

  console.log("PROCESSING END-OF-CALL-REPORT...");

  const variables = message.variableValues || message.call?.variableValues || message.call?.assistantOverrides?.variableValues || {};
  const metadata = message.metadata || message.call?.metadata || message.assistant?.metadata || {};

  const interviewId = metadata.interviewId || metadata.interviewid || variables.interviewId || variables.interviewid;
  const userId = metadata.userId || metadata.userid || variables.userId || variables.userid || "anonymous";

  if (!interviewId) {
    console.error("Missing interviewId in metadata/variables");
    return Response.json({ success: false, error: "Missing interviewId" }, { status: 400 });
  }

  console.log("Processing Interview:", { interviewId, userId });

  const role = variables.role || "Software Engineer";
  const type = variables.type || "technical";
  const level = variables.level || "Senior";
  const techstackStr = variables.techstack || "Next.js, Tailwind CSS";
  const amount = variables.amount || "5";

  try {
    const interviewDocRef = db.collection("interviews").doc(interviewId);
    const interviewDoc = await interviewDocRef.get();

    if (interviewDoc.exists && interviewDoc.data()?.finalized) {
      console.log("Interview already finalized. Skipping AI generation.");
      return Response.json({ success: true, message: "Already finalized" }, { status: 200 });
    }

    console.log("GENERATING QUESTIONS WITH AI...");
    const { text: questions } = await generateText({
      model: google("gemini-1.5-flash"),
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
        "How do you stay up-to-date with new technologies?",
      ];
    }

    const interviewUpdateData = {
      role: role,
      type: type,
      level: level,
      techstack: typeof techstackStr === "string" ? techstackStr.split(",").map((s: string) => s.trim()) : techstackStr,
      questions: parsedQuestions,
      userId: userId,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      updatedAt: new Date().toISOString(),
    };

    console.log("UPDATING INTERVIEW:", interviewId);
    await interviewDocRef.update(interviewUpdateData);
    console.log("INTERVIEW UPDATED SUCCESS:", interviewId);

    return Response.json({ success: true, id: interviewId }, { status: 200 });
  } catch (error: any) {
    console.error("WEBHOOK PROCESSING ERROR:", error?.message || error);
    return Response.json({ success: false, error: error?.message || error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, message: "Webhook endpoint is active" }, { status: 200 });
}