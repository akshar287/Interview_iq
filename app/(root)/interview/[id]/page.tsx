import Image from "next/image";
import { redirect } from "next/navigation";

import Agent from "@/components/Agent";
import { getRandomInterviewCover } from "@/lib/utils";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser, getStudentFromSession } from "@/lib/actions/auth.action";
import DisplayTechIcons from "@/components/DisplayTechIcons";

interface InterviewDetailsProps {
  params: Promise<{ id: string }>;
}

const InterviewDetails = async ({ params }: InterviewDetailsProps) => {
  const { id } = await params;

  const [user, student] = await Promise.all([
    getCurrentUser(),
    getStudentFromSession()
  ]);

  if (!user && !student) redirect("/sign-in");

  const userName = user?.name || student?.name || "";
  const userId = user?.id || student?.firestoreId;

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: userId!,
  });

  return (
    <>
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4 items-center max-sm:flex-col">
          <div className="flex flex-row gap-4 items-center">
            <Image
              src={getRandomInterviewCover()}
              alt="cover-image"
              width={40}
              height={40}
              className="rounded-full object-cover size-[40px]"
            />
            <h3 className="capitalize">{interview.role} Interview</h3>
          </div>

          <DisplayTechIcons techStack={interview.techstack} />
        </div>

        <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit">
          {interview.type}
        </p>
      </div>

      <Agent
        userName={userName}
        userId={userId}
        interviewId={id}
        type="interview"
        questions={interview.questions}
        feedbackId={feedback?.id}
      />
    </>
  );
};

export default InterviewDetails;
