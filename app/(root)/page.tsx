import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

import { db } from "@/firebase/admin";
import InterviewCard from "@/components/InterviewCard";
import NewInterviewButton from "@/components/NewInterviewButton";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getFeedbackByInterviewId,
  getInterviewById,
  getInterviewsByUserId,
  getLatestInterviews,
  getFeedbackByUserId,
  getLatestUserInterview,
  getCompanyInterviewsByRole,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");

  const [createdInterviews, allInterview, userFeedback] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
    getFeedbackByUserId(user?.id!),
  ]);

  // Identify interviews the user practiced but didn't create
  const practicedInterviewIds = [
    ...new Set(userFeedback?.map((f) => f.interviewId)),
  ];
  const missingInterviewIds = practicedInterviewIds.filter(
    (id) => !createdInterviews?.some((i) => i.id === id)
  );

  const missingInterviews = await Promise.all(
    missingInterviewIds.map((id) => getInterviewById(id))
  );

  // Combine and sort all user-relevant interviews
  const userInterviews = [
    ...(createdInterviews || []),
    ...(missingInterviews.filter((i) => i !== null) as Interview[]),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Auto-generate assigned interview for interns if missing
  if (user.isIntern && userInterviews.length === 0) {
    const newInterview = {
      userId: user.id,
      role: user.role || "Software Engineer",
      position: user.role || "Software Engineer",
      experience: user.experience || "Entry",
      techstack: [],
      type: "Technical",
      finalized: false,
      createdAt: new Date().toISOString(),
    };
    const docRef = await db.collection("interviews").add(newInterview);
    userInterviews.push({ id: docRef.id, ...newInterview } as Interview);
  }

  const internAssignedInterview = user.isIntern
    ? userInterviews.find(i => !i.finalized)
    : null;

  const userPastInterviews = user.isIntern
    ? userInterviews.filter(i => i.finalized)
    : userInterviews;

  const hasPastInterviews = userPastInterviews.length > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;

  return (
    <>
      <section className="glass-card flex flex-col md:flex-row items-center justify-between px-12 py-12 mb-12">
        <div className="flex flex-col gap-6 max-w-lg text-left">
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            AI Enabled Personal <br />
            <span className="text-primary-200">Interview Analyser</span>
          </h1>
          <p className="text-lg text-white/50">
            Practice real-world interview scenarios and receive instant,
            data-driven feedback to accelerate your career growth.
          </p>

          {!user.isIntern && (
            <NewInterviewButton userId={user?.id!} userName={user?.name!} />
          )}
        </div>

        <div className="relative mt-8 md:mt-0">
          <div className="absolute inset-0 bg-primary-200/20 blur-[80px] rounded-full animate-pulse" />
          <Image
            src="/robot.png"
            alt="robo-dude"
            width={350}
            height={350}
            className="relative z-10 drop-shadow-2xl"
          />
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>{user.isIntern ? "Your History" : "Your Interviews"}</h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userPastInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>{user?.isIntern ? "Your Assigned Interview" : "Take Interviews"}</h2>

        <div className="interviews-section">
          {user?.isIntern ? (
            internAssignedInterview ? (
              <InterviewCard
                key={internAssignedInterview.id}
                userId={user?.id}
                interviewId={internAssignedInterview.id}
                role={internAssignedInterview.role}
                type={internAssignedInterview.type}
                techstack={internAssignedInterview.techstack}
                createdAt={internAssignedInterview.createdAt}
              />
            ) : hasPastInterviews ? (
              <div className="flex flex-col items-center justify-center py-10 glass-card w-full border-teal-500/30">
                <p className="text-xl font-bold text-teal-400 mb-2">Interview Completed!</p>
                <p className="text-white/60">Your company has received your feedback. Great job!</p>
              </div>
            ) : (
              <p>No interview assigned for your role yet.</p>
            )
          ) : hasUpcomingInterviews ? (
            allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>There are no interviews available</p>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
