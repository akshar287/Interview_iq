import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

/* ------------------------------
   CHECK API KEY
--------------------------------*/

const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error("❌ GOOGLE_GENERATIVE_AI_API_KEY is missing in .env");
}

/* ------------------------------
   SAFE JSON PARSER
--------------------------------*/

function safeParseQuestions(text: string): string[] {
  try {
    const clean = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/\n/g, "")
      .trim();

    const parsed = JSON.parse(clean);

    if (Array.isArray(parsed)) return parsed;

    throw new Error("Invalid format");
  } catch (err) {
    console.log("⚠️ Using fallback questions");

    return [
      "Tell me about yourself.",
      "What is the most challenging project you worked on?",
      "How do you debug complex issues?",
      "How do you learn new technologies?",
      "Where do you see yourself in 3 years?",
    ];
  }
}

/* ------------------------------
   GENERATE QUESTIONS
--------------------------------*/

async function generateQuestions(role: string, level: string) {
  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),

      prompt: `
Create exactly 5 interview questions.

Role: ${role}
Experience Level: ${level}

Return ONLY a JSON array.

Example:
["Question1","Question2","Question3"]
`,
    });

    return safeParseQuestions(text);
  } catch (err) {
    console.error("❌ AI generation failed:", err);

    return safeParseQuestions("");
  }
}

/* ------------------------------
   POST API
--------------------------------*/

export async function POST(request: Request) {
  let body: any;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  /* ------------------------------
     DIRECT CLIENT CALL
  --------------------------------*/

  if (body.interviewId && !body.message) {
    const { interviewId, userId, role, experience } = body;

    if (!interviewId) {
      return Response.json(
        { success: false, error: "Missing interviewId" },
        { status: 400 }
      );
    }

    try {
      const interviewRef = db.collection("interviews").doc(interviewId);
      const interviewDoc = await interviewRef.get();

      if (interviewDoc.exists && interviewDoc.data()?.finalized) {
        console.log("⚠️ Interview already finalized");

        return Response.json({
          success: true,
          message: "Already finalized",
        });
      }

      const roleName = role || "Software Engineer";
      const level = experience || "Entry";

      console.log("⚡ Generating questions:", roleName, level);

      const questions = await generateQuestions(roleName, level);

      const data = {
        role: roleName,
        type: "Technical",
        level: level,
        techstack: ["JavaScript", "TypeScript", "React", "Node.js"],
        questions,
        userId: userId || "anonymous",
        finalized: true,
        coverImage: getRandomInterviewCover(),
        updatedAt: new Date().toISOString(),
      };

      await interviewRef.set(data, { merge: true });

      console.log("✅ Interview saved:", interviewId);

      return Response.json({
        success: true,
        id: interviewId,
      });
    } catch (error: any) {
      console.error("❌ DIRECT GENERATE ERROR:", error);

      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  }

  /* ------------------------------
     VAPI WEBHOOK
  --------------------------------*/

  try {
    await db.collection("vapi_debug_logs").add({
      receivedAt: new Date().toISOString(),
      payload: body,
    });
  } catch { }

  const message = body.message;

  if (!message) {
    return Response.json({ success: false, error: "No message found" });
  }

  if (message.type !== "end-of-call-report") {
    console.log("Ignoring message:", message.type);

    return Response.json({ success: true });
  }

  const variables =
    message.variableValues ||
    message.call?.variableValues ||
    {};

  const metadata =
    message.metadata ||
    message.call?.metadata ||
    {};

  const interviewId =
    metadata.interviewId ||
    variables.interviewId;

  const userId =
    metadata.userId ||
    variables.userId ||
    "anonymous";

  if (!interviewId) {
    return Response.json(
      { success: false, error: "Missing interviewId" },
      { status: 400 }
    );
  }

  try {
    const interviewRef = db.collection("interviews").doc(interviewId);
    const doc = await interviewRef.get();

    if (doc.exists && doc.data()?.finalized) {
      console.log("⚠️ Interview already finalized");

      return Response.json({ success: true });
    }

    const role = variables.role || "Software Engineer";
    const level = variables.level || "Senior";

    const techstackStr =
      variables.techstack || "Next.js, React";

    const questions = await generateQuestions(role, level);

    const data = {
      role,
      type: "technical",
      level,
      techstack: techstackStr
        .split(",")
        .map((t: string) => t.trim()),
      questions,
      userId,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      updatedAt: new Date().toISOString(),
    };

    await interviewRef.set(data, { merge: true });

    console.log("✅ Interview updated via Vapi:", interviewId);

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("❌ WEBHOOK ERROR:", err);

    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

/* ------------------------------
   GET API
--------------------------------*/

export async function GET() {
  return Response.json({
    success: true,
    message: "Webhook active",
  });
}