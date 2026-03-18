"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import ClientDisplayTechIcons from "./ClientDisplayTechIcons";

import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

export default function ClientInterviewCard({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: {
  interviewId: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt: string;
}) {
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Use a stable image url to avoid hydration mismatch
  const [cover, setCover] = useState("");

  useEffect(() => {
    setCover(getRandomInterviewCover());
    if (userId && interviewId) {
      getFeedbackByInterviewId({ interviewId, userId })
        .then(res => setFeedback(res))
        .catch(err => console.error("Error fetching feedback:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [userId, interviewId]);

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColor =
    {
      Behavioral: "bg-light-400",
      Mixed: "bg-light-600",
      Technical: "bg-light-800",
    }[normalizedType] || "bg-light-600";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div className="glass-card w-[360px] max-sm:w-full min-h-96 hover:border-primary-200/30 transition-all group relative overflow-hidden">
      <div className="flex flex-col h-full justify-between z-10">
        <div>
          {/* Type Badge */}
          <div
            className={cn(
              "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg z-20",
              badgeColor
            )}
          >
            <p className="badge-text ">{normalizedType}</p>
          </div>

          {/* Cover Image */}
          <div className="mt-4">
            {cover && (
              <Image
                src={cover}
                alt="cover-image"
                width={90}
                height={90}
                className="rounded-full object-cover size-[90px]"
              />
            )}
          </div>

          {/* Interview Role */}
          <h3 className="mt-5 capitalize">{role} Interview</h3>

          {/* Date & Score */}
          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2">
              <Image
                src="/calendar.svg"
                width={22}
                height={22}
                alt="calendar"
              />
              <p>{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" width={22} height={22} alt="star" />
              <p>{loading ? "..." : (feedback?.totalScore || "---")}/100</p>
            </div>
          </div>

          {/* Feedback or Placeholder Text */}
          <p className="line-clamp-2 mt-5 min-h-[48px] text-white/60 text-sm">
            {loading ? "Loading analysis..." : (feedback?.finalAssessment ||
              "You haven't taken this interview yet. Take it now to improve your skills.")}
          </p>
        </div>

        <div className="flex flex-row justify-between items-center mt-6">
          <ClientDisplayTechIcons techStack={techstack} />

          <Button className="btn-primary" asChild>
            <Link
              href={
                feedback
                  ? `/interview/${interviewId}/feedback`
                  : `/interview/${interviewId}`
              }
            >
              {feedback ? "Check Feedback" : "View Interview"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
