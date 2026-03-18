import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  MessageSquare,
  Zap,
  Users,
  CheckCircle2,
  XCircle,
  ArrowRight,
  UserCheck,
  Shield,
  Smartphone,
  Cpu,
  Layout,
  Globe,
  Database,
  Headphones
} from "lucide-react";

import { db } from "@/firebase/admin";
import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import RadarChart from "@/components/RadarChart";
import FeedbackHighlight from "@/components/FeedbackHighlight";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const isCompany = user?.type === "company";
  const dashboardLink = isCompany ? "/company" : "/";

  // Security check for companies: allow if viewing own mock interview or intern's interview
  if (isCompany) {
    if (interview.userId === user?.id) {
      // Company viewing their own mock interview
    } else {
      const internDoc = await db.collection("users").doc(interview.userId).get();
      if (internDoc.exists && internDoc.data()?.companyId !== user?.id) {
        redirect("/company");
      }
    }
  }

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: isCompany ? undefined : user?.id!,
  });

  if (!feedback) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <h1 className="text-4xl font-bold text-white">Feedback Pending</h1>
        <p className="text-white/60 max-w-md">We are still processing your interview analysis. Please check back in a few moments.</p>
        <Button className="btn-secondary" asChild>
          <Link href={dashboardLink}>Back to Dashboard</Link>
        </Button>
      </section>
    );
  }

  // Generic Fit Percentages
  const personalityFit = feedback.categoryScores.find(s => s.name.includes("Fit") || s.name.includes("Cultural"))?.score || 88;
  const technicalFit = feedback.categoryScores.find(s => s.name.includes("Technical"))?.score || 92;

  // Personality Archetype Mapping
  const getArchetype = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes("engineer") || r.includes("developer")) return { name: "Architect", icon: Cpu };
    if (r.includes("manager") || r.includes("lead")) return { name: "Strategist", icon: Shield };
    if (r.includes("designer") || r.includes("ui") || r.includes("ux")) return { name: "Creator", icon: Layout };
    if (r.includes("analyst") || r.includes("data")) return { name: "Explorer", icon: Database };
    if (r.includes("mobile") || r.includes("app")) return { name: "Innovator", icon: Smartphone };
    return { name: "Professional", icon: UserCheck };
  };

  const archetype = getArchetype(interview.role);
  const scores = feedback.categoryScores.map(cat => ({ name: cat.name, score: cat.score }));

  return (
    <section className="relative min-h-screen py-8 px-4 sm:px-10 overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[120px] rounded-full animate-pulse" />

      {/* Header Section */}
      <header className="relative z-10 flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-200 rounded-xl shadow-[0_0_15px_rgba(202,197,254,0.4)]">
            <MessageSquare className="text-slate-950 size-6" />
          </div>
          <span className="text-2xl font-black text-white tracking-tighter uppercase italic">Careely</span>
        </div>
        <div className="flex items-center gap-2">
          {interview.recordingUrl && (
            <a
              href={interview.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-primary-200 hover:bg-white/10 transition-colors"
            >
              <Headphones className="size-4" />
              Listen to Recording
            </a>
          )}
          <Button variant="ghost" className="text-white/60 hover:text-white flex items-center gap-2" asChild>
            <Link href={dashboardLink}>
              <ArrowRight className="rotate-180 size-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Title Group */}
        <div className="vox-glass bg-white/[0.02] p-8 mb-8 border-none ring-1 ring-white/10">
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2 uppercase italic drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
            Interview Complete!
          </h1>
          <p className="text-xl font-medium text-primary-200 uppercase tracking-[0.2em] opacity-80">
            Final Analysis & Key Takeaways
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left: Final Rating & Radar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="vox-glass p-8 flex flex-col items-center tech-glow-teal h-full">
              <div className="w-full mb-8">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-1">Final Rating</h3>
                <p className="text-sm font-bold text-primary-200/60 tracking-wider">
                  {personalityFit}% Personality Fit / {technicalFit}% Technical Fit
                </p>
              </div>
              <RadarChart scores={scores} size={300} />
            </div>
          </div>

          {/* Middle: Hero & Highlights */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="relative h-[240px] vox-glass p-0 border-none group cursor-pointer overflow-visible">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent z-10 rounded-[32px]" />
              <Image
                src="/ai-robot-feedback.png"
                alt="AI Robot Analysis"
                fill
                className="object-cover rounded-[32px] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute -top-10 -right-4 z-20 animate-slow-pulse">
                <div className="p-4 bg-primary-200/10 backdrop-blur-md rounded-2xl border border-primary-200/30">
                  <Cpu className="size-8 text-primary-200 drop-shadow-[0_0_10px_rgba(202,197,254,0.6)]" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2 px-2">Analysis Highlights</h3>
              <FeedbackHighlight
                icon={MessageSquare}
                title="Communication Clarity"
                description={feedback.categoryScores.find(s => s.name.toLowerCase().includes("comm"))?.comment || "Expert level delivery."}
              />
              <FeedbackHighlight
                icon={Zap}
                title="Technical Accuracy"
                description={feedback.categoryScores.find(s => s.name.toLowerCase().includes("tech"))?.comment || "Solid foundational knowledge."}
              />
              <FeedbackHighlight
                icon={Users}
                title="Personality Fit"
                description={feedback.categoryScores.find(s => s.name.toLowerCase().includes("fit") || s.name.toLowerCase().includes("cultural"))?.comment || "Strong team alignment."}
              />
            </div>

            <div className="vox-glass p-8 mt-2 tech-glow-purple">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Personality Archetype</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">Summary: A modern, elegant</p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-4 py-4">
                <archetype.icon className="size-16 text-primary-200 drop-shadow-[0_0_20px_rgba(202,197,254,0.5)]" />
                <span className="text-3xl font-black text-white uppercase tracking-[0.3em] italic">{archetype.name}</span>
              </div>
            </div>
          </div>

          {/* Right: Roadmap */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="vox-glass p-8 h-full flex flex-col tech-glow-purple border-white/[0.05]">
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Practice Roadmap</h3>
              <p className="text-sm font-bold text-white/40 uppercase tracking-widest mb-8">Key Improvement Areas</p>

              <div className="flex flex-col gap-4 flex-1">
                {feedback.areasForImprovement.map((area, idx) => (
                  <div key={idx} className="roadmap-item-premium group">
                    <div className="p-3 rounded-xl bg-destructive-500/10 text-destructive-500 group-hover:bg-destructive-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                      <CheckCircle2 size={20} className="text-teal-500" />
                    </div>
                    <span className="text-[13px] font-bold text-white/70 group-hover:text-white transition-colors">{area}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 mt-12">
                <Button className="btn-premium flex items-center justify-center gap-3 drop-shadow-[0_0_20px_rgba(202,197,254,0.2)]" asChild>
                  <Link href={`/interview/${id}`}>
                    Schedule Next Deep-Dive Session
                  </Link>
                </Button>
                <Button variant="outline" className="h-14 border-white/10 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs" asChild>
                  <Link href={dashboardLink}>
                    Return to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Feedback;
