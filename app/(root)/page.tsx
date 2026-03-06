import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase/admin";
import InterviewCard from "@/components/InterviewCard";
import NewInterviewButton from "@/components/NewInterviewButton";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  BarChart3,
  ShieldCheck,
  Zap,
  Users
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewById,
  getInterviewsByUserId,
  getLatestInterviews,
  getFeedbackByUserId,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex flex-col space-y-20 pb-20">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full" />
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-8 px-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary-200 text-xs font-medium animate-in fade-in slide-in-from-top-4 duration-1000">
              <Zap className="size-3 fill-primary-200" />
              <span>The Next Generation of AI Hiring</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Master Your Next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-blue-400">Interview with AI</span>
            </h1>

            <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 delay-200 duration-1000">
              Talent IQ uses advanced AI to simulate realistic interview scenarios,
              providing instant feedback and actionable insights to help you land your dream job.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 delay-300 duration-1000">
              <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-2xl group transition-all hover:scale-105" asChild>
                <Link href="/sign-in">
                  Get Started
                  <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold rounded-2xl border-white/10 hover:bg-white/5" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Info / Features Section */}
        <section id="features" className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 border-white/5 hover:border-primary-200/30 transition-colors group">
            <div className="size-12 rounded-2xl bg-primary-200/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Cpu className="text-primary-200 size-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Mock Interviews</h3>
            <p className="text-white/50 leading-relaxed">
              Experience zero-pressure practice rounds with our sophisticated AI interviewers tailored to your role.
            </p>
          </div>

          <div className="glass-card p-8 border-white/5 hover:border-blue-400/30 transition-colors group">
            <div className="size-12 rounded-2xl bg-blue-400/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="text-blue-400 size-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Real-time Feedback</h3>
            <p className="text-white/50 leading-relaxed">
              Receive deep analysis on your responses, body language, and technical accuracy the moment you finish.
            </p>
          </div>

          <div className="glass-card p-8 border-white/5 hover:border-purple-400/30 transition-colors group">
            <div className="size-12 rounded-2xl bg-purple-400/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="text-purple-400 size-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Company Portal</h3>
            <p className="text-white/50 leading-relaxed">
              Streamline your hiring process. Assign interviews to interns and track their performance effortlessly.
            </p>
          </div>
        </section>

        {/* Social Proof / Trust */}
        <section className="max-w-4xl mx-auto text-center px-6 py-10 space-y-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/30">Trusted by modern companies</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-30 grayscale contrast-125">
            <span className="text-2xl font-black italic">TECHNO</span>
            <span className="text-2xl font-black italic">CLOUDLY</span>
            <span className="text-2xl font-black italic">AI.CORE</span>
            <span className="text-2xl font-black italic">NEXUS</span>
          </div>
        </section>
      </div>
    );
  }

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
    ...(missingInterviews.filter((i) => i !== null) as any[]),
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
