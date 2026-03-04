import { createFeedback } from "@/lib/actions/general.action"; // adjust path if needed
import { db } from "@/firebase/admin";

export async function POST(request: Request) {
  let body: any;

  try {
    body = await request.json();
  } catch (e) {
    console.error("Invalid JSON received from Vapi");
    return Response.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  console.log("VAPI WEBHOOK RECEIVED");

  const message = body.message;

  if (!message) {
    console.error("No message object found");
    return Response.json(
      { success: false, error: "No message found" },
      { status: 400 }
    );
  }

  // ✅ Only process final report
  if (message.type !== "end-of-call-report") {
    console.log("Ignoring message type:", message.type);
    return Response.json({ success: true });
  }

  console.log("Processing END-OF-CALL-REPORT");

  try {
    // ===============================
    // 1️⃣ Extract Transcript
    // ===============================
    const transcript =
      message.transcript ||
      message.call?.transcript ||
      [];

    // ===============================
    // 2️⃣ Extract Metadata
    // ===============================
    const metadata =
      message.metadata ||
      message.call?.metadata ||
      {};

    const interviewId = metadata.interviewId;
    const userId = metadata.userId;

    if (!interviewId || !userId) {
      console.error("Missing interviewId or userId in metadata");
      return Response.json(
        { success: false, error: "Missing metadata" },
        { status: 400 }
      );
    }

    console.log("Interview ID:", interviewId);
    console.log("User ID:", userId);

    // ===============================
    // 3️⃣ Prevent Duplicate Feedback
    // ===============================
    const existingFeedback = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (!existingFeedback.empty) {
      console.log("Feedback already exists. Skipping generation.");
      return Response.json({ success: true, message: "Already processed" });
    }

    // ===============================
    // 4️⃣ Generate Feedback
    // ===============================


    const result = await createFeedback({
      interviewId,
      userId,
      transcript,
      // ✅ real data
    });

    if (!result.success) {
      console.error("Feedback generation failed");
      return Response.json(
        { success: false, error: "Feedback generation failed" },
        { status: 500 }
      );
    }

    console.log("Feedback successfully generated:", result.feedbackId);

    return Response.json({
      success: true,
      feedbackId: result.feedbackId,
    });
  } catch (error: any) {
    console.error("CRITICAL WEBHOOK ERROR:", error?.message || error);
    return Response.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({
    success: true,
    message: "Vapi webhook endpoint is active",
  });
}