import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { db } from "@/firebase/admin";
import InterviewCard from "@/components/InterviewCard";
import NewInterviewButton from "@/components/NewInterviewButton";
import {
  Cpu,
  BarChart3,
  Zap,
  Users,
  GraduationCap,
  TrendingUp,
  BookOpen,
  Code2,
  ChevronRight,
  Shield,
} from "lucide-react";
import HomeCarousel from "@/components/HomeCarousel";
import { getCurrentUser, getStudentFromSession } from "@/lib/actions/auth.action";
import {
  getInterviewById,
  getInterviewsByUserId,
  getLatestInterviews,
  getFeedbackByUserId,
  getUserPerformanceSummary,
} from "@/lib/actions/general.action";
import { getStudentAptitudeHistory } from "@/lib/actions/aptitude.action";
import { getStudentTechnicalHistory } from "@/lib/actions/technical.action";

async function Home() {
  const user = await getCurrentUser();
  const student = !user ? await getStudentFromSession() : null;

  // Student logged in via Student ID — show welcome banner + performance summary + links to student portal
  if (!user && student) {
    // Fetch student history summary
    const [aptSnap, techSnap] = await Promise.all([
      db.collection("aptitudeSubmissions").where("studentFirestoreId", "==", student.firestoreId).get(),
      db.collection("technicalSubmissions").where("studentFirestoreId", "==", student.firestoreId).get(),
    ]);
    const aptResults = aptSnap.docs.map(d => d.data());
    const techResults = techSnap.docs.map(d => d.data());
    const aptAvg = aptResults.length > 0 ? Math.round(aptResults.reduce((s, r) => s + (r.percentage || 0), 0) / aptResults.length) : null;
    const techAvg = techResults.length > 0 ? Math.round(techResults.reduce((s, r) => s + (r.percentage || 0), 0) / techResults.length) : null;

    return (
      <>
        {/* Full user-module hero */}
        <section className="glass-card flex flex-col md:flex-row items-center justify-between px-12 py-12 mb-12 relative overflow-hidden">
          {/* Background Highlight */}
          <div className="absolute top-0 right-0 w-[40%] h-full bg-primary-200/5 blur-[100px] -z-10" />
          
          <div className="flex flex-col gap-6 max-w-2xl text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-200/10 border border-primary-200/20 text-primary-200 text-[10px] font-black uppercase tracking-widest w-fit">
               <Zap size={10} className="fill-primary-200" /> Complete Placement Suite
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white leading-[1.1] tracking-tight">
              AI Powered <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-blue-400">Placement Preparation</span>
            </h1>
            <p className="text-xl text-white/50 font-medium leading-relaxed">
              Master every round of your recruitment process. From comprehensive aptitude tests and technical coding challenges 
              to high-pressure AI mock interviews with behavioral analysis.
            </p>
            {/* Students can also create practice interviews */}
            <div className="flex items-center gap-4 mt-2">
                <NewInterviewButton userId={student.firestoreId} userName={student.name} />
                <Link 
                    href="/student/dashboard" 
                    className="h-12 px-6 rounded-2xl border border-white/10 hover:bg-white/5 text-white/70 hover:text-white transition-all flex items-center justify-center font-bold"
                >
                    View History
                </Link>
            </div>
          </div>
          <div className="relative mt-12 md:mt-0 flex-shrink-0">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent z-20" />
            <div className="absolute inset-0 bg-primary-200/20 blur-[80px] rounded-full animate-pulse" />
            <Image src="/robot.png" alt="robo-dude" width={380} height={380} className="relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform -scale-x-100" />
          </div>
        </section>

        <HomeCarousel />



        {/* Your Interviews */}
        <section className="flex flex-col gap-6 mt-8">
          <h2>Your Interviews</h2>
          <div className="interviews-section">
            <p>You haven&apos;t taken any AI interviews yet</p>
          </div>
        </section>

        {/* Take Interviews */}
        <section className="flex flex-col gap-6 mt-8">
          <h2>Take Interviews</h2>
          <div className="interviews-section">
            <p>There are no interviews available</p>
          </div>
        </section>
      </>
    );
  }


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

            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.95] animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Secure Your Future <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-blue-400">With Careerly</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/50 max-w-3xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 delay-200 duration-1000">
              The only all-in-one AI placement suite designed for the next generation. 
              Master Aptitude, Technical, and Interview rounds with professional precision.
            </p>
          </div>

          <HomeCarousel />
        </section>

        {/* Enhanced Features Section */}
        <section id="features" className="max-w-6xl mx-auto px-6 space-y-20 pt-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white">Advanced AI Capabilities</h2>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">
              Everything you need to master your professional journey, powered by state-of-the-art AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-10 border-white/5 hover:border-blue-400/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 blur-3xl -z-10 group-hover:bg-blue-400/10 transition-colors" />
              <div className="size-14 rounded-2xl bg-blue-400/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-blue-400/5">
                <BookOpen className="text-blue-400 size-7" />
              </div>
              <h3 className="text-2xl font-black mb-4 group-hover:text-blue-400 transition-colors">AI Aptitude Test</h3>
              <p className="text-white/50 leading-relaxed font-medium">
                Master logic and reasoning with AI-generated aptitude rounds. Get instant scoring and detailed explanations for every mathematical and logical challenge.
              </p>
              <div className="mt-8 flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                Start Practice <ChevronRight size={14} />
              </div>
            </div>

            <div className="glass-card p-10 border-white/5 hover:border-purple-400/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/5 blur-3xl -z-10 group-hover:bg-purple-400/10 transition-colors" />
              <div className="size-14 rounded-2xl bg-purple-400/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-purple-400/5">
                <Code2 className="text-purple-400 size-7" />
              </div>
              <h3 className="text-2xl font-black mb-4 group-hover:text-purple-400 transition-colors">AI Technical Round</h3>
              <p className="text-white/50 leading-relaxed font-medium">
                Solve real-world coding problems in our intelligent editor. Our AI analyzes your code efficiency, logic, and complexity in real-time.
              </p>
              <div className="mt-8 flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                Code Now <ChevronRight size={14} />
              </div>
            </div>

            <div className="glass-card p-10 border-white/5 hover:border-primary-200/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200/5 blur-3xl -z-10 group-hover:bg-primary-200/10 transition-colors" />
              <div className="size-14 rounded-2xl bg-primary-200/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-primary-200/5">
                <Cpu className="text-primary-200 size-7" />
              </div>
              <h3 className="text-2xl font-black mb-4 group-hover:text-primary-200 transition-colors">AI Mock Interview</h3>
              <p className="text-white/50 leading-relaxed font-medium">
                Experience realistic behavioral and architectural interviews. Get deep analysis on your communication, confidence, and body language.
              </p>
              <div className="mt-8 flex items-center gap-2 text-primary-200 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                Try Interview <ChevronRight size={14} />
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="max-w-6xl mx-auto px-6 py-32 space-y-16">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-200/10 border border-primary-200/20 text-primary-200 text-xs font-bold uppercase tracking-widest">
                   The Workflow
                </div>
                <h2 className="text-5xl font-black text-white leading-tight">Simple process, <br /><span className="text-primary-200">extraordinary results.</span></h2>
                <div className="space-y-8">
                   {[
                     { step: "01", title: "Select Your Module", desc: "Choose between Aptitude, Technical coding, or AI Interview based on your preparation goal." },
                     { step: "02", title: "Intelligent Session", desc: "Our AI constructs a unique set of questions tailored to your experience and target role." },
                     { step: "03", title: "Comprehensive Review", desc: "Receive immediate AI feedback with exact corrections, scores, and growth suggestions." }
                   ].map((item, i) => (
                     <div key={i} className="flex gap-6 group">
                        <span className="text-3xl font-black text-white/10 group-hover:text-primary-200/20 transition-colors tabular-nums">{item.step}</span>
                        <div className="space-y-2">
                           <h4 className="text-xl font-bold text-white">{item.title}</h4>
                           <p className="text-white/50 leading-relaxed">{item.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
              <div className="relative">
                 <div className="absolute inset-0 bg-primary-200/20 blur-[120px] rounded-full animate-pulse" />
                 <div className="glass-card p-4 aspect-square flex items-center justify-center relative z-10 overflow-hidden border-white/10 shadow-3xl">
                    <Image src="/robot.png" alt="Workflow" width={400} height={400} className="drop-shadow-2xl" />
                    <div className="absolute bottom-8 left-8 right-8 glass-card p-6 border-primary-200/20 bg-primary-200/5 animate-bounce-slow">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-full bg-primary-200 flex items-center justify-center"><Zap size={20} className="text-black" /></div>
                            <div>
                                <p className="text-white font-bold text-sm">AI Feedback Ready</p>
                                <p className="text-white/40 text-[10px]">98.4% Accuracy achieved in behavioral analysis</p>
                            </div>
                        </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Statistics / Trust Indicators */}
        <section className="border-y border-white/5 bg-white/[0.01]">
            <div className="max-w-6xl mx-auto px-6 py-20 flex flex-wrap justify-between gap-12 text-center md:text-left">
                {[
                    { label: "Successful Interviews", value: "50,000+" },
                    { label: "Partner Institutions", value: "120+" },
                    { label: "Student Placed", value: "85%" },
                    { label: "AI Accuracy", value: "99.2%" }
                ].map((stat, i) => (
                    <div key={i} className="space-y-2">
                        <p className="text-4xl font-black text-white leading-none">{stat.value}</p>
                        <p className="text-xs uppercase font-bold tracking-[0.2em] text-white/30">{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto px-6 py-32 space-y-12">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-white">Common Questions</h2>
                <p className="text-white/50">Everything you need to know about the Careerly platform.</p>
            </div>
            
            <div className="space-y-4">
                {[
                    { q: "Is the AI feedback truly accurate?", a: "Yes, our models are trained on millions of successful technical and behavioral interviews to provide industrial-grade accuracy." },
                    { q: "Can colleges use this for bulk hiring?", a: "Absolutely. Our College Portal allows for massive student onboarding and bulk placement drive simulations with comparative analytics." },
                    { q: "What technical stacks are supported?", a: "We support over 20+ programming languages and frameworks for the Technical Round, from React and Node.js to Python and Java." }
                ].map((faq, i) => (
                    <div key={i} className="glass-card p-6 border-white/5 hover:border-white/10 transition-all cursor-default group">
                        <h4 className="text-lg font-bold text-white mb-3 group-hover:text-primary-200 transition-colors">{faq.q}</h4>
                        <p className="text-white/40 leading-relaxed text-sm">{faq.a}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* Social Proof / Trust */}
        <section className="max-w-4xl mx-auto text-center px-6 py-10 space-y-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/30">Trusted by modern companies</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-30 grayscale contrast-125">
            <span className="text-2xl font-black italic">TECHNO</span>
            <span className="text-2xl font-black italic">CLOUDY</span>
            <span className="text-2xl font-black italic">AI.CORE</span>
            <span className="text-2xl font-black italic">NEXUS</span>
          </div>
        </section>
      </div>
    );
  }

  const [[createdInterviews, allInterview, userFeedback], perf] = await Promise.all([
    Promise.all([
      getInterviewsByUserId(user?.id!),
      getLatestInterviews({ userId: user?.id! }),
      getFeedbackByUserId(user?.id!),
    ]),
    getUserPerformanceSummary(user?.id!),
  ]);

  // Fetch detailed history for Aptitude and Technical rounds for the user
  const [aptSubmissions, techSubmissions] = await Promise.all([
    getStudentAptitudeHistory(user?.id!),
    getStudentTechnicalHistory(user?.id!),
  ]);

  // Identify interviews the user practiced but didn't create
  const practicedInterviewIds = [
    ...new Set(userFeedback?.map((f: any) => f.interviewId)),
  ];
  const missingInterviewIds = (practicedInterviewIds as string[]).filter(
    (id) => !createdInterviews?.some((i: any) => i.id === id)
  );

  const missingInterviews = await Promise.all(
    missingInterviewIds.map((id) => getInterviewById(id))
  );

  // Combine and sort all user-relevant interviews
  const userInterviews = [
    ...(createdInterviews || []),
    ...(missingInterviews.filter((i: any) => i !== null) as any[]),
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
                <Link
                  href="/student/dashboard"
                  className="flex flex-col items-center justify-center gap-2 w-full text-primary-200 font-bold hover:bg-primary-200/10 transition-all border-primary-200/30"
                >
                  <p className="text-xl font-bold text-teal-400 mb-2">Interview Completed!</p>
                  <p className="text-white/60">Your company has received your feedback. Great job!</p>
                </Link>
              </div>
            ) : (
              <p>No interview assigned for your role yet.</p>
            )
          ) : hasUpcomingInterviews ? (
            allInterview?.map((interview: any) => (
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

      {/* Recent Practice Rounds for Regular Users */}
      {!user.isIntern && (aptSubmissions.length > 0 || techSubmissions.length > 0) && (
        <section className="flex flex-col gap-6 mt-12 pb-12 border-t border-white/5 pt-12">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2">
                <TrendingUp className="text-primary-200" size={20} />
                Recent Practice Rounds
            </h2>
            <Link href="/dashboard" className="text-sm font-bold text-primary-200 hover:underline">View Dashboard</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aptSubmissions.slice(0, 1).map((sub: any) => (
              <div key={sub.id} className="glass-card p-5 border border-primary-200/20 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-primary-200/10 flex items-center justify-center">
                      <BookOpen className="text-primary-200 size-5" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Latest Aptitude</p>
                      <p className="text-white/40 text-[10px]">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-primary-200 text-lg font-black">{sub.percentage}%</p>
                    <p className="text-white/30 text-[10px]">{sub.score} Correct</p>
                  </div>
                </div>
              </div>
            ))}
            {techSubmissions.slice(0, 1).map((sub: any) => (
              <div key={sub.id} className="glass-card p-5 border border-purple-400/20 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-purple-400/10 flex items-center justify-center">
                      <Code2 className="text-purple-400 size-5" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Latest Technical</p>
                      <p className="text-white/40 text-[10px]">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-400 text-lg font-black">{sub.percentage}%</p>
                    <p className="text-white/30 text-[10px]">Technical Round</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default Home;
