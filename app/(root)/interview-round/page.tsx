import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Users, Sparkles } from "lucide-react";
import { db } from "@/firebase/admin";
import { getCurrentUser, getStudentFromSession } from "@/lib/actions/auth.action";
import {
  getInterviewById,
  getInterviewsByUserId,
  getLatestInterviews,
  getFeedbackByUserId,
} from "@/lib/actions/general.action";
import HowToUseSection from "@/components/HowToUseSection";
import InterviewCard from "@/components/InterviewCard";
import NewInterviewButton from "@/components/NewInterviewButton";

const InterviewBanner = ({ userId, userName, isIntern }: { userId: string, userName: string, isIntern?: boolean }) => (
  <div className="bg-[#1a1c23] rounded-3xl overflow-hidden relative mb-12 border border-white/5 shadow-2xl">
    <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 w-full max-w-6xl mx-auto px-6 py-8 md:py-12 lg:py-14 relative z-10">
      <div className="flex flex-col gap-6 text-center md:text-left max-w-xl z-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-200/10 border border-primary-200/20 text-primary-200 text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0">
          AI Interview
        </div>
        <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
          AI Enabled Personal <br />
          <span className="text-primary-200">Interview Analyser</span>
        </h1>
        <p className="text-white/60 text-base md:text-lg">
          Practice real-world interview scenarios and receive instant,
          data-driven feedback to accelerate your career growth.
        </p>
        <div className="mt-4">
          {!isIntern && (
            <NewInterviewButton userId={userId} userName={userName} />
          )}
        </div>
          </div>
          <div className="flex relative w-[240px] h-[200px] md:w-[280px] md:h-[220px] lg:w-[320px] lg:h-[260px] items-center justify-center">
            <div className="relative size-full flex items-center justify-center">
              {/* Decorative background pulse */}
              <div className="absolute inset-0 bg-primary-200/20 blur-[80px] rounded-full animate-pulse" />
              
              {/* Styled Icon Container */}
              <div className="relative size-32 md:size-40 lg:size-48 bg-gradient-to-br from-[#1a1c23] to-[#09090b] rounded-[32px] md:rounded-[40px] border border-primary-200/20 shadow-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
                <MessageSquare className="text-primary-200 size-16 md:size-20 lg:size-24 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
                
                {/* Floating elements */}
                <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 p-2 md:p-3 bg-[#1a1c23] border border-primary-200/20 rounded-xl md:rounded-2xl shadow-xl animate-bounce">
                  <Users className="text-primary-200 size-5 md:size-6" />
                </div>
                <div className="absolute -bottom-1 -left-3 md:-bottom-2 md:-left-4 p-1 md:p-2 bg-[#1a1c23] border border-primary-200/20 rounded-lg md:rounded-xl shadow-xl animate-pulse">
                  <Sparkles className="text-primary-200 size-4 md:size-5" />
                </div>
              </div>
            </div>
          </div>
        </div>

    <div className="mt-20 pt-20 border-t border-white/5 mx-auto max-w-6xl">
      <HowToUseSection />
    </div>
  </div>
);

export default async function InterviewRoundPage() {
  const user = await getCurrentUser();
  const student = !user ? await getStudentFromSession() : null;

  if (!user && !student) {
    redirect("/sign-in");
  }

  // If it's a student, right now they just see empty lists for interviews, or we can fetch them.
  // Actually, students use the same collections, so they might not have full standard interviews unless they created them.
  if (student) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <InterviewBanner userId={student.firestoreId} userName={student.name} />

        
        <section className="flex flex-col gap-6 mt-8">
          <h2>Your Interviews</h2>
          <div className="interviews-section">
            <p>You haven't taken any AI interviews yet</p>
          </div>
        </section>

        <section className="flex flex-col gap-6 mt-8">
          <h2>Take Interviews</h2>
          <div className="interviews-section">
            <p>There are no interviews available</p>
          </div>
        </section>
      </div>
    );
  }

  // Ensure 'user' is typed correctly by checking it exists
  if (!user) return null;

  // Normal User Flow
  const [createdInterviews, allInterview, userFeedback] = await Promise.all([
    getInterviewsByUserId(user.id),
    getLatestInterviews({ userId: user.id }),
    getFeedbackByUserId(user.id),
  ]);

  const practicedInterviewIds = [
    ...new Set(userFeedback?.map((f: any) => f.interviewId)),
  ];
  const missingInterviewIds = (practicedInterviewIds as string[]).filter(
    (id) => !createdInterviews?.some((i: any) => i.id === id)
  );

  const missingInterviews = await Promise.all(
    missingInterviewIds.map((id) => getInterviewById(id))
  );

  const userInterviews = [
    ...(createdInterviews || []),
    ...(missingInterviews.filter((i: any) => i !== null) as any[]),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
    userInterviews.push({ id: docRef.id, ...newInterview } as any);
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
    <div className="max-w-6xl mx-auto px-6 py-10">
      <InterviewBanner userId={user.id} userName={user.name!} isIntern={user.isIntern} />


      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-bold">{user.isIntern ? "Your History" : "Your Interviews"}</h2>
        <div className="interviews-section">
          {hasPastInterviews ? (
            userPastInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p className="text-white/40">You haven't taken any interviews yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-12">
        <h2 className="text-xl font-bold">{user.isIntern ? "Your Assigned Interview" : "Take Interviews"}</h2>
        <div className="interviews-section">
          {user.isIntern ? (
            internAssignedInterview ? (
              <InterviewCard
                key={internAssignedInterview.id}
                userId={user.id}
                interviewId={internAssignedInterview.id}
                role={internAssignedInterview.role}
                type={internAssignedInterview.type}
                techstack={internAssignedInterview.techstack}
                createdAt={internAssignedInterview.createdAt}
              />
            ) : hasPastInterviews ? (
              <div className="flex flex-col items-center justify-center py-10 glass-card w-full border-teal-500/30">
                <Link
                  href="/student/dashboard"
                  className="flex flex-col items-center justify-center gap-2 w-full text-primary-200 font-bold hover:bg-primary-200/10 transition-all border-primary-200/30"
                >
                  <p className="text-xl font-bold text-teal-400 mb-2">Interview Completed!</p>
                  <p className="text-white/60">Your company has received your feedback. Great job!</p>
                </Link>
              </div>
            ) : (
              <p className="text-white/40">No interview assigned for your role yet.</p>
            )
          ) : hasUpcomingInterviews ? (
            allInterview?.map((interview: any) => (
              <InterviewCard
                key={interview.id}
                userId={user.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p className="text-white/40">There are no interviews available</p>
          )}
        </div>
      </section>
    </div>
  );
}
