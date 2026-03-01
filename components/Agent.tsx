"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import {
  createFeedback,
  getInterviewsByUserId,
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

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (transcriptMessages: SavedMessage[]) => {
      const toastId = toast.loading("Analyzing your interview and generating feedback...");
      try {
        const avgEyeContact = metrics.count > 0 ? metrics.totalEyeContact / metrics.count : 70;
        const avgConfidence = metrics.count > 0 ? metrics.totalConfidence / metrics.count : 70;

        console.log("INTERVIEW ANALYTICS:", { avgEyeContact, avgConfidence, ticks: metrics.count });

        const { success, feedbackId: id } = await createFeedback({
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
          toast.error("Failed to generate feedback. Returning to dashboard.", { id: toastId });
          router.push("/");
        }
      } catch (error) {
        toast.error("An error occurred during feedback generation.", { id: toastId });
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        const toastId = toast.loading("Finalizing your interview profile. This may take a few seconds...");

        // Polling to wait for the background webhook to finish
        let attempts = 0;
        const maxAttempts = 15; // increased to 30 seconds total
        const interval = setInterval(async () => {
          attempts++;
          const secondsLeft = (maxAttempts - attempts) * 2;
          console.log(`Checking for new profile (Attempt ${attempts}/${maxAttempts})...`);
          toast.loading(`Waiting for AI (Attempt ${attempts}/${maxAttempts})...`, { id: toastId });

          try {
            const userInterviews = await getInterviewsByUserId(userId!);
            if (userInterviews && userInterviews.length > 0) {
              const latestId = userInterviews[0].id;
              console.log("Found profile!", latestId);
              clearInterval(interval);
              toast.success("Profile created! Redirecting...", { id: toastId });
              router.push(`/interview/${latestId}`);
            } else if (attempts >= maxAttempts) {
              clearInterval(interval);
              toast.error("Timed out waiting for profile. Please check /diag for webhook logs.", { id: toastId });
              console.warn("POLLING TIMED OUT. Check if vapi_debug_logs count increases at /diag.");
              router.push("/");
            }
          } catch (error) {
            console.error("Error polling for interview:", error);
          }
        }, 2000); // Check every 2 seconds
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId, metrics]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      const vapiId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID || process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
      console.log("VAPI START (GENERATE):", { vapiId, userName, userId });

      if (!vapiId) {
        toast.error("Vapi Generation ID is missing in .env!");
        return;
      }

      await vapi.start(vapiId, {
        variableValues: {
          username: userName,
          userid: userId,
        },
        metadata: {
          userid: userId,
        }
      });
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
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
        <div className="card-border">
          <div className="card-content">
            <div className="size-[120px] rounded-full overflow-hidden">
              <CameraModule onMetricsUpdate={handleMetricsUpdate} />
            </div>
            <h3>{userName}</h3>
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
