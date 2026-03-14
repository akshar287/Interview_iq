import { NextResponse } from "next/server";
import { saveInterviewRecording } from "@/lib/actions/general.action";

/**
 * POST /api/save-recording
 * Manually save a recording URL to Firebase (interviews + intern user doc).
 * Body: { interviewId: string, url: string, userId?: string }
 * Use this to backfill or test when the VAPI webhook doesn't provide the URL.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { interviewId, url, userId } = body;
    if (!interviewId || !url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid interviewId or url" },
        { status: 400 }
      );
    }
    const result = await saveInterviewRecording(
      interviewId,
      url.trim(),
      userId || undefined
    );
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, message: "Recording url saved to Firebase" });
  } catch (e: unknown) {
    console.error("Save recording API error:", e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
