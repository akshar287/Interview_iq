"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import {
  createFeedback,
} from "@/lib/actions/general.action";
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
  const [lastMessage, setLastMessage] = useState<string>("");

  // Metrics for facial analysis
  const [metrics, setMetrics] = useState({
    totalEyeContact: 0,
    totalConfidence: 0,
    count: 0,
  });

  const handleMetricsUpdate = useCallback((newMetrics: { eyeContact: number; confidence: number }) => {
    setMetrics(prev => ({
      totalEyeContact: prev.totalEyeContact + newMetrics.eyeContact,
      totalConfidence: prev.totalConfidence + newMetrics.confidence,
      count: prev.count + 1,
    }));
  }, []);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
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

  const isGenerating = useRef(false);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (transcriptMessages: SavedMessage[]) => {
      if (isGenerating.current) return;
      isGenerating.current = true;

      const toastId = toast.loading("Analyzing your interview and generating feedback...");
      try {
        const avgEyeContact = metrics.count > 0 ? metrics.totalEyeContact / metrics.count : 70;
        const avgConfidence = metrics.count > 0 ? metrics.totalConfidence / metrics.count : 70;

        console.log("INTERVIEW ANALYTICS:", { avgEyeContact, avgConfidence, ticks: metrics.count });
        console.log("TRANSCRIPT MESSAGES COUNT:", transcriptMessages.length);

        const { success, feedbackId: id, error } = await createFeedback({
          interviewId: interviewId!,
          userId: userId!,
          transcript: transcriptMessages,
          feedbackId,
          analysis: {
            avgEyeContact,
            avgConfidence
          }
        });

        if (success && id) {
          toast.success("Feedback generated successfully!", { id: toastId });
          router.push(`/interview/${interviewId}/feedback`);
        } else {
          toast.error(error || "Failed to generate feedback. Returning to dashboard.", { id: toastId });
          isGenerating.current = false; // Allow retry if it failed logically (e.g. empty transcript)
          router.push("/");
        }
      } catch (error: any) {
        toast.error(error?.message || "An error occurred during feedback generation.", { id: toastId });
        isGenerating.current = false;
        router.push("/");
      }
    };

    const handleGenerateInterview = async () => {
      const toastId = toast.loading("Generating your interview questions with AI...");
      try {
        // Directly call our own API to generate questions — no Vapi webhook needed.
        // This works both on localhost and in production.
        const res = await fetch("/api/vapi/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interviewId: interviewId!,
            userId: userId!,
            role: interviewPosition || "Software Engineer",
            experience: interviewExperience || "entry",
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          toast.success("Interview ready! Redirecting...", { id: toastId });
          router.push(`/interview/${interviewId}`);
        } else {
          toast.error(data.error || "Failed to generate interview questions.", { id: toastId });
          router.push("/");
        }
      } catch (error: any) {
        toast.error("An error occurred while setting up the interview.", { id: toastId });
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        handleGenerateInterview();
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId, metrics, interviewPosition, interviewExperience]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    // Common metadata for both types
    const callMetadata = {
      userId: userId,
      interviewId: interviewId,
    };

    if (type === "generate") {
      // Use process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID as the primary ID for the Assistant
      const vapiAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
      console.log("VAPI START (ASSISTANT):", { vapiAssistantId, userName, userId, interviewId });

      if (!vapiAssistantId) {
        toast.error("Vapi Assistant ID is missing in .env!");
        setCallStatus(CallStatus.INACTIVE);
        return;
      }

      await vapi.start(vapiAssistantId, {
        variableValues: {
          username: userName,
          userid: userId,
          role: interviewPosition || "",
          level: interviewExperience || "",
        },
        metadata: callMetadata
      });
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      console.log("VAPI START (MOCK):", { interviewer, interviewId, userId });
      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
        metadata: callMetadata
      });
    }
  };

  const handleDisconnect = () => {
    console.log("End button clicked, setting callStatus to FINISHED");
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border h-[400px] overflow-hidden">
          <div className="card-content !p-0 relative overflow-hidden">
            <CameraModule onMetricsUpdate={handleMetricsUpdate} />
            <div className="absolute bottom-5 left-0 w-full text-center z-20">
              <h3 className="!mt-0 drop-shadow-lg text-white font-bold">{userName}</h3>
            </div>
          </div>
        </div>
      </div>


      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
