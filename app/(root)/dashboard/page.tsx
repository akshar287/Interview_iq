"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, Code2, TrendingUp, BarChart3, Clock, CheckCircle,
  XCircle, CalendarDays, Brain, ChevronDown, ChevronUp, Trophy,
  Target, Star, Loader2, FileText, MessageSquare, ArrowLeft
} from "lucide-react";

import { getStudentAptitudeHistory } from "@/lib/actions/aptitude.action";
import { getStudentTechnicalHistory } from "@/lib/actions/technical.action";
import { getFeedbackByUserId, getInterviewsByUserId } from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import ClientInterviewCard from "@/components/ClientInterviewCard";

// ── Types ──────────────────────────────────────────────────────────────────
interface Interview {
  id: string; role: string; type: string; techstack: string[]; createdAt: string; finalized: boolean;
}

interface AptSub {
  id: string; submittedAt: string; score: number; totalQuestions: number;
  percentage: number; isPractice?: boolean; sessionId?: string; aiFeedback?: string;
}

interface TechSub {
  id: string; submittedAt: string; score: number; percentage: number;
  isPractice?: boolean; sessionId?: string; aiFeedback?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });
}

function AptHistoryCard({ sub, idx }: { sub: AptSub; idx: number }) {
  const [open, setOpen] = useState(false);
  const passed = sub.percentage >= 40;
  let analysis: any = null;
  try { 
    if (sub.aiFeedback) {
      analysis = typeof sub.aiFeedback === "string" 
        ? JSON.parse(sub.aiFeedback.replace(/```json|```/g, "").trim()) 
        : sub.aiFeedback;
    }
  } catch {}

  return (
    <div className={`glass-card p-5 border transition-all ${passed ? "border-green-500/20" : "border-red-500/20"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${passed ? "bg-green-500/10" : "bg-red-500/10"}`}>
            {passed ? <CheckCircle className="text-green-400 size-5" /> : <XCircle className="text-red-400 size-5" />}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              Practice Aptitude Round
              <span className="ml-2 text-white/30 text-xs font-normal">#{idx + 1}</span>
            </p>
            <p className="text-white/40 text-xs flex items-center gap-1 mt-0.5">
              <CalendarDays size={10} /> {fmt(sub.submittedAt)} at {fmtTime(sub.submittedAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={`text-xl font-black ${passed ? "text-green-400" : "text-red-400"}`}>{sub.percentage}%</p>
            <p className="text-white/40 text-xs">{sub.score}/{sub.totalQuestions} correct</p>
          </div>
          {analysis && (
            <button onClick={() => setOpen(!open)} className="text-white/30 hover:text-white/70 transition-colors">
              {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {open && analysis && (
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
          {analysis.overallSummary && (
            <p className="text-white/60 text-sm leading-relaxed">{analysis.overallSummary}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {analysis.strengths?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-green-400 mb-1.5 flex items-center gap-1"><CheckCircle size={11} /> Strengths</p>
                <ul className="flex flex-col gap-1">
                  {analysis.strengths.slice(0, 3).map((s: string, i: number) => (
                    <li key={i} className="text-xs text-white/50 flex items-start gap-1.5">
                      <span className="text-green-400 mt-0.5 shrink-0">›</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.weakAreas?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-red-400 mb-1.5 flex items-center gap-1"><XCircle size={11} /> Weak Areas</p>
                <ul className="flex flex-col gap-1">
                  {analysis.weakAreas.slice(0, 3).map((w: string, i: number) => (
                    <li key={i} className="text-xs text-white/50 flex items-start gap-1.5">
                      <span className="text-red-400 mt-0.5 shrink-0">›</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TechHistoryCard({ sub, idx }: { sub: TechSub; idx: number }) {
  const [open, setOpen] = useState(false);
  const passed = sub.percentage >= 40;
  let analysis: any = null;
  try { 
    if (sub.aiFeedback) {
      analysis = typeof sub.aiFeedback === "string" 
        ? JSON.parse(sub.aiFeedback.replace(/```json|```/g, "").trim()) 
        : sub.aiFeedback;
    }
  } catch {}

  return (
    <div className={`glass-card p-5 border transition-all ${passed ? "border-purple-500/20" : "border-red-500/20"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${passed ? "bg-purple-500/10" : "bg-red-500/10"}`}>
            <Code2 className={`size-5 ${passed ? "text-purple-400" : "text-red-400"}`} />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              Practice Technical Round
              <span className="ml-2 text-white/30 text-xs font-normal">#{idx + 1}</span>
            </p>
            <p className="text-white/40 text-xs flex items-center gap-1 mt-0.5">
              <CalendarDays size={10} /> {fmt(sub.submittedAt)} at {fmtTime(sub.submittedAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={`text-xl font-black ${passed ? "text-purple-400" : "text-red-400"}`}>{sub.percentage}%</p>
            <p className="text-white/40 text-xs">Technical Score</p>
          </div>
          {analysis && (
            <button onClick={() => setOpen(!open)} className="text-white/30 hover:text-white/70 transition-colors">
              {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {open && analysis && (
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
          {analysis.overallSummary && (
            <p className="text-white/60 text-sm leading-relaxed">{analysis.overallSummary}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {analysis.strengths?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-green-400 mb-1.5 flex items-center gap-1"><CheckCircle size={11} /> Strengths</p>
                <ul className="flex flex-col gap-1">
                  {analysis.strengths.slice(0, 3).map((s: string, i: number) => (
                    <li key={i} className="text-xs text-white/50 flex items-start gap-1.5">
                      <span className="text-green-400 mt-0.5 shrink-0">›</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.weakAreas?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-red-400 mb-1.5 flex items-center gap-1"><XCircle size={11} /> Weak Areas</p>
                <ul className="flex flex-col gap-1">
                  {analysis.weakAreas.slice(0, 3).map((w: string, i: number) => (
                    <li key={i} className="text-xs text-white/50 flex items-start gap-1.5">
                      <span className="text-red-400 mt-0.5 shrink-0">›</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function UserDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [aptHistory, setAptHistory] = useState<AptSub[]>([]);
  const [techHistory, setTechHistory] = useState<TechSub[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"interviews" | "aptitude" | "technical">("interviews");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const u = await getCurrentUser();
        if (!isMounted) return;

        if (!u) {
          router.replace("/");
          return;
        }
        setUser(u);

        const [apt, tech, ints, feedbacks] = await Promise.all([
          getStudentAptitudeHistory(u.id),
          getStudentTechnicalHistory(u.id),
          getInterviewsByUserId(u.id),
          getFeedbackByUserId(u.id),
        ]);

        if (!isMounted) return;

        // Only show interviews that have been taken (have feedback)
        const completedInterviews = (ints as any[] || []).filter(
          (interview) => (feedbacks || []).some((f: any) => f.interviewId === interview.id)
        ).map(interview => {
          const feedback = (feedbacks || []).find((f: any) => f.interviewId === interview.id);
          return { ...interview, totalScore: feedback?.totalScore || 0 };
        });

        setAptHistory(apt as AptSub[]);
        setTechHistory(tech as TechSub[]);
        setInterviews(completedInterviews);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Stats
  const aptAvg = aptHistory.length > 0
    ? Math.round(aptHistory.reduce((s, r) => s + r.percentage, 0) / aptHistory.length) : null;
  const techAvg = techHistory.length > 0
    ? Math.round(techHistory.reduce((s, r) => s + r.percentage, 0) / techHistory.length) : null;
  
  const totalTests = interviews.length + aptHistory.length + techHistory.length;
  const interviewAvg = interviews.length > 0 ? (interviews as any).reduce((s: number, i: any) => s + (i.totalScore || 0), 0) / interviews.length : null;
  // Wait, interviews state doesn't have score yet. I need to calculate it like I did in student dashboard.
  // Actually, I just fetched everything in loadDashboard.
  const overallBest = Math.max(interviewAvg || 0, aptAvg || 0, techAvg || 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pattern">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary-200 size-10 animate-spin" />
          <p className="text-white/50">Loading your performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pattern pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors w-fit text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black text-white">Performance Dashboard</h1>
            <p className="text-white/40 text-sm">Welcome back, {user?.name}</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Total Rounds", val: totalTests, icon: <FileText size={16} />, color: "text-white", border: "border-white/10" },
            { label: "Interview Avg", val: interviews.length > 0 ? `${Math.round(interviews.reduce((s: number, i: any) => s + (i.totalScore || 0), 0) / interviews.length)}%` : "—", icon: <MessageSquare size={16} />, color: "text-blue-400", border: "border-blue-400/20" },
            { label: "Aptitude Avg", val: aptAvg !== null ? `${aptAvg}%` : "—", icon: <BookOpen size={16} />, color: "text-primary-200", border: "border-primary-200/20" },
            { label: "Technical Avg", val: techAvg !== null ? `${techAvg}%` : "—", icon: <Code2 size={16} />, color: "text-purple-400", border: "border-purple-400/20" },
            { label: "Best Score", val: Math.max(overallBest, interviews.length > 0 ? Math.max(...interviews.map((i: any) => i.totalScore || 0)) : 0) > 0 ? `${Math.max(overallBest, interviews.length > 0 ? Math.max(...interviews.map((i: any) => i.totalScore || 0)) : 0)}%` : "—", icon: <Trophy size={16} />, color: "text-yellow-400", border: "border-yellow-400/20" },
          ].map((s, i) => (
            <div key={i} className={`glass-card px-4 py-5 text-center ${s.border}`}>
              <div className={`flex items-center justify-center gap-1 mb-2 text-[10px] font-medium ${s.color}`}>{s.icon}{s.label}</div>
              <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setActiveTab("interviews")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === "interviews" ? "bg-blue-400/15 text-blue-400 border border-blue-400/30" : "text-white/40 hover:text-white hover:bg-white/5 border border-white/10"}`}
          >
            <MessageSquare size={15} /> AI Interviews
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === "interviews" ? "bg-blue-400/20" : "bg-white/10"}`}>{interviews.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("aptitude")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === "aptitude" ? "bg-primary-200/15 text-primary-200 border border-primary-200/30" : "text-white/40 hover:text-white hover:bg-white/5 border border-white/10"}`}
          >
            <BookOpen size={15} /> Aptitude
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === "aptitude" ? "bg-primary-200/20" : "bg-white/10"}`}>{aptHistory.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("technical")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === "technical" ? "bg-purple-400/15 text-purple-400 border border-purple-400/30" : "text-white/40 hover:text-white hover:bg-white/5 border border-white/10"}`}
          >
            <Code2 size={15} /> Technical
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === "technical" ? "bg-purple-400/20" : "bg-white/10"}`}>{techHistory.length}</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "interviews" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.length === 0 ? (
              <div className="col-span-full glass-card p-12 border-white/5 flex flex-col items-center gap-3 text-center">
                <MessageSquare className="text-white/20 size-10" />
                <p className="text-white font-semibold">No interviews yet</p>
              </div>
            ) : (
              interviews.map((interview) => (
                <ClientInterviewCard
                  key={interview.id}
                  userId={user?.id}
                  interviewId={interview.id}
                  role={interview.role}
                  type={interview.type}
                  techstack={interview.techstack}
                  createdAt={interview.createdAt}
                />
              ))
            )}
          </div>
        )}

        {activeTab === "aptitude" && (
          <div className="flex flex-col gap-3">
            {aptHistory.length === 0 ? (
              <div className="glass-card p-12 border-white/5 flex flex-col items-center gap-3 text-center">
                <BookOpen className="text-white/20 size-10" />
                <p className="text-white font-semibold">No aptitude rounds yet</p>
              </div>
            ) : (
              aptHistory.map((sub, idx) => <AptHistoryCard key={sub.id} sub={sub} idx={idx} />)
            )}
          </div>
        )}

        {activeTab === "technical" && (
          <div className="flex flex-col gap-3">
            {techHistory.length === 0 ? (
              <div className="glass-card p-12 border-white/5 flex flex-col items-center gap-3 text-center">
                <Code2 className="text-white/20 size-10" />
                <p className="text-white font-semibold">No technical rounds yet</p>
              </div>
            ) : (
              techHistory.map((sub, idx) => <TechHistoryCard key={sub.id} sub={sub} idx={idx} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
