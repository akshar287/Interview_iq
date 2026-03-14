"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { createFeedback } from "@/lib/actions/general.action";
import { toast } from "sonner";
import CameraModule from "./CameraModule";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
  interviewPosition,
  interviewExperience,
}: AgentProps) => {
  const router = useRouter();

  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState("");

  const [metrics, setMetrics] = useState({
    totalEyeContact: 0,
    totalConfidence: 0,
    count: 0,
  });

  const isGenerating = useRef(false);

  const handleMetricsUpdate = useCallback(
    (newMetrics: { eyeContact: number; confidence: number }) => {
      setMetrics((prev) => ({
        totalEyeContact: prev.totalEyeContact + newMetrics.eyeContact,
        totalConfidence: prev.totalConfidence + newMetrics.confidence,
        count: prev.count + 1,
      }));
    },
    []
  );

  /* ---------------- VAPI EVENTS ---------------- */

  useEffect(() => {
    const onCallStart = () => {
      console.log("CALL STARTED");
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      console.log("CALL ENDED");
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setMessages((prev) => [
          ...prev,
          {
            role: message.role,
            content: message.transcript,
          },
        ]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = (error: any) => {
      console.error("VAPI ERROR:", error);
      toast.error(error?.message || "Voice assistant error");
      setCallStatus(CallStatus.INACTIVE);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);

  /* ---------------- GENERATE FEEDBACK ---------------- */

  useEffect(() => {
    const generateFeedback = async () => {
      if (isGenerating.current) return;

      isGenerating.current = true;

      const toastId = toast.loading("Generating feedback...");

      try {
        const avgEye =
          metrics.count > 0 ? metrics.totalEyeContact / metrics.count : 70;

        const avgConfidence =
          metrics.count > 0 ? metrics.totalConfidence / metrics.count : 70;

        const { success, feedbackId: id } = await createFeedback({
          interviewId: interviewId!,
          userId: userId!,
          transcript: messages,
          feedbackId,
          analysis: {
            avgEyeContact: avgEye,
            avgConfidence,
          },
        });

        if (success && id) {
          toast.success("Feedback ready!", { id: toastId });
          router.push(`/interview/${interviewId}/feedback`);
        }
      } catch {
        toast.error("Feedback generation failed", { id: toastId });
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED && type !== "generate") {
      generateFeedback();
    }
  }, [callStatus]);

  /* ---------------- START CALL ---------------- */

  const handleCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);

      const BACKGROUND_ASSISTANT =
        process.env.NEXT_PUBLIC_VAPI_BACKGROUND_ASSISTANT_ID;

      const INTERVIEW_ASSISTANT =
        process.env.NEXT_PUBLIC_VAPI_INTERVIEW_ASSISTANT_ID;

      const metadata = {
        userId,
        interviewId,
      };

      if (type === "generate") {
        console.log("STARTING BACKGROUND ASSISTANT");

        await vapi.start(BACKGROUND_ASSISTANT!, {
          variableValues: {
            username: userName,
            role: interviewPosition,
            experience: interviewExperience,
          },
          metadata,
        });
      } else {
        console.log("STARTING INTERVIEW ASSISTANT");

        const formattedQuestions = questions
          ? questions.map((q, i) => `${i + 1}. ${q}`).join("\n")
          : "";

        await vapi.start(INTERVIEW_ASSISTANT!, {
          variableValues: {
            questions: formattedQuestions,
            username: userName,
          },
          metadata,
        });
      }
    } catch (error: any) {
      console.error("START ERROR:", error);
      toast.error("Failed to start call");
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    vapi.stop();
    setCallStatus(CallStatus.FINISHED);
  };

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div
            className={cn(
              "avatar-icon flex items-center justify-center rounded-full size-[120px] bg-white shadow-lg ring-1 ring-white/10 text-primary-200 transition-opacity",
              isSpeaking && "animate-pulse"
            )}
          >
            <MessageCircle className="size-12" strokeWidth={1.5} aria-hidden />
          </div>
          <h3>AI Interviewer</h3>
        </div>

        <div className="card-border h-[400px] overflow-hidden">
          <div className="card-content !p-0 relative">
            {callStatus === CallStatus.ACTIVE && (
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-destructive-100 px-3 py-1.5 text-xs font-bold text-white shadow-md">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-white" />
                </span>
                LIVE ANALYSIS
              </div>
            )}
            <CameraModule onMetricsUpdate={handleMetricsUpdate} />
            <div className="absolute bottom-5 w-full text-center">
              <h3 className="text-white font-bold">{userName}</h3>
            </div>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p className="animate-fadeIn">{lastMessage}</p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="btn-call" onClick={handleCall}>
            {callStatus === "CONNECTING" ? "Connecting..." : "Call"}
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;