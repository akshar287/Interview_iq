"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, Code2, TrendingUp, BarChart3, Clock, CheckCircle,
  XCircle, CalendarDays, Brain, ChevronDown, ChevronUp, Trophy,
  Target, Star, Loader2, FileText, MessageSquare, GraduationCap, ArrowLeft
} from "lucide-react";
import {
  getStudentAptitudeHistory,
} from "@/lib/actions/aptitude.action";
import {
  getStudentTechnicalHistory,
} from "@/lib/actions/technical.action";
import { getFeedbackByUserId, getInterviewsByUserId } from "@/lib/actions/general.action";
import ClientInterviewCard from "@/components/ClientInterviewCard";

// ── Types ──────────────────────────────────────────────────────────────────
interface StudentSession {
  firestoreId: string; studentId: string; name: string;
  year: string; branch: string; collegeId: string; collegeName: string;
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

function ScoreBadge({ pct }: { pct: number }) {
  const color = pct >= 70 ? "text-green-400 bg-green-500/15 border-green-500/30"
    : pct >= 40 ? "text-yellow-400 bg-yellow-500/15 border-yellow-500/30"
    : "text-red-400 bg-red-500/15 border-red-500/30";
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      {pct}%
    </span>
  );
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
              {sub.isPractice ? "Practice Round" : "College Exam"}
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
              {sub.isPractice ? "Practice Round" : "College Exam"}
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
          {analysis.questionAnalysis?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {analysis.questionAnalysis.map((qa: any, i: number) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs">
                  <p className="text-white/40 font-bold mb-1">Q{qa.questionNumber}</p>
                  <div className="flex items-center justify-between">
                    <span className={qa.isCorrect ? "text-green-400" : "text-red-400"}>{qa.isCorrect ? "Pass" : "Fail"}</span>
                    <span className="text-white font-bold">{qa.score}/10</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function StudentDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [aptHistory, setAptHistory] = useState<AptSub[]>([]);
  const [techHistory, setTechHistory] = useState<TechSub[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [interviewAvg, setInterviewAvg] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"interviews" | "college" | "aptitude" | "technical">("interviews");

  useEffect(() => {
    const raw = localStorage.getItem("studentSession");
    if (!raw) { router.replace("/student/login"); return; }
    const session: StudentSession = JSON.parse(raw);
    setStudent(session);

    Promise.all([
      getStudentAptitudeHistory(session.firestoreId),
      getStudentTechnicalHistory(session.firestoreId),
      getInterviewsByUserId(session.firestoreId),
      getFeedbackByUserId(session.firestoreId),
    ]).then(([apt, tech, ints, feedbacks]) => {
      setAptHistory(apt as AptSub[]);
      setTechHistory(tech as TechSub[]);
      
      const completedInterviews = (ints as any[] || []).filter(
        (interview) => (feedbacks || []).some((f: any) => f.interviewId === interview.id)
      );
      setInterviews(completedInterviews);

      if (completedInterviews.length > 0) {
        const relevantFeedbacks = (feedbacks || []).filter((f: any) => 
          completedInterviews.some(i => i.id === f.interviewId)
        );
        const avg = Math.round(relevantFeedbacks.reduce((s: number, f: any) => s + (f.totalScore || 0), 0) / relevantFeedbacks.length);
        setInterviewAvg(avg);
      }
      
      setLoading(false);
    });
  }, [router]);

  // Stats
  const aptAvg = aptHistory.length > 0
    ? Math.round(aptHistory.reduce((s, r) => s + r.percentage, 0) / aptHistory.length) : null;
  const techAvg = techHistory.length > 0
    ? Math.round(techHistory.reduce((s, r) => s + r.percentage, 0) / techHistory.length) : null;
  const bestApt = aptHistory.length > 0 ? Math.max(...aptHistory.map(r => r.percentage)) : null;
  const bestTech = techHistory.length > 0 ? Math.max(...techHistory.map(r => r.percentage)) : null;
  const totalTests = aptHistory.length + techHistory.length + interviews.length;
  const overallBest = Math.max(bestApt ?? 0, bestTech ?? 0, interviewAvg ?? 0);

  const collegeExams = [
    ...aptHistory.filter(h => !h.isPractice).map(h => ({ ...h, type: "aptitude" })),
    ...techHistory.filter(h => !h.isPractice).map(h => ({ ...h, type: "technical" }))
  ].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const practiceApt = aptHistory.filter(h => h.isPractice !== false);
  const practiceTech = techHistory.filter(h => h.isPractice !== false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pattern">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary-200 size-10 animate-spin" />
          <p className="text-white/50">Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pattern pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors w-fit text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black text-white">My Performance History</h1>
            <p className="text-white/40 text-sm">{student?.name} · {student?.collegeName} · {student?.branch}</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Total Tests", val: totalTests, icon: <FileText size={16} />, color: "text-white", border: "border-white/10" },
            { label: "Interview Avg", val: interviewAvg !== null ? `${interviewAvg}%` : "—", icon: <MessageSquare size={16} />, color: "text-blue-400", border: "border-blue-400/20" },
            { label: "Aptitude Avg", val: aptAvg !== null ? `${aptAvg}%` : "—", icon: <BookOpen size={16} />, color: "text-primary-200", border: "border-primary-200/20" },
            { label: "Technical Avg", val: techAvg !== null ? `${techAvg}%` : "—", icon: <Code2 size={16} />, color: "text-purple-400", border: "border-purple-400/20" },
            { label: "Best Score", val: overallBest > 0 ? `${overallBest}%` : "—", icon: <Trophy size={16} />, color: "text-yellow-400", border: "border-yellow-400/20" },
          ].map((s, i) => (
            <div key={i} className={`glass-card px-4 py-5 text-center ${s.border}`}>
              <div className={`flex items-center justify-center gap-1 mb-2 text-[10px] font-medium ${s.color}`}>{s.icon}{s.label}</div>
              <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Round Tabs */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setActiveTab("interviews")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === "interviews" ? "bg-blue-400/15 text-blue-400 border border-blue-400/30" : "text-white/40 hover:text-white hover:bg-white/5 border border-white/10"}`}
          >
            <MessageSquare size={15} /> AI Interviews
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === "interviews" ? "bg-blue-400/20" : "bg-white/10"}`}>{interviews.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("college")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === "college" ? "bg-green-400/15 text-green-400 border border-green-400/30" : "text-white/40 hover:text-white hover:bg-white/5 border border-white/10"}`}
          >
            <GraduationCap size={15} /> College Exams
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === "college" ? "bg-green-400/20" : "bg-white/10"}`}>{collegeExams.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("aptitude")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === "aptitude" ? "bg-primary-200/15 text-primary-200 border border-primary-200/30" : "text-white/40 hover:text-white hover:bg-white/5 border border-white/10"}`}
          >
            <BookOpen size={15} /> Practice Aptitude
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === "aptitude" ? "bg-primary-200/20" : "bg-white/10"}`}>{practiceApt.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("technical")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === "technical" ? "bg-purple-400/15 text-purple-400 border border-purple-400/30" : "text-white/40 hover:text-white hover:bg-white/5 border border-white/10"}`}
          >
            <Code2 size={15} /> Practice Technical
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === "technical" ? "bg-purple-400/20" : "bg-white/10"}`}>{practiceTech.length}</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "interviews" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.length === 0 ? (
              <div className="col-span-full glass-card p-12 border-white/5 flex flex-col items-center gap-3 text-center">
                <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center">
                  <MessageSquare className="text-white/20 size-7" />
                </div>
                <p className="text-white font-semibold">No interviews yet</p>
                <p className="text-white/40 text-sm">Complete an AI interview to see your results here.</p>
              </div>
            ) : (
              interviews.map((interview) => (
                <ClientInterviewCard
                  key={interview.id}
                  userId={student?.firestoreId}
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

        {/* College Exams */}
        {activeTab === "college" && (
          <div className="flex flex-col gap-3">
            {collegeExams.length === 0 ? (
              <div className="glass-card p-12 border-white/5 flex flex-col items-center gap-3 text-center">
                <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center">
                  <GraduationCap className="text-white/20 size-7" />
                </div>
                <p className="text-white font-semibold">No college exams yet</p>
                <p className="text-white/40 text-sm">Assigned college exams will appear here.</p>
              </div>
            ) : (
              collegeExams.map((sub: any, idx) => 
                sub.type === "aptitude" 
                  ? <AptHistoryCard key={sub.id} sub={sub} idx={idx} />
                  : <TechHistoryCard key={sub.id} sub={sub} idx={idx} />
              )
            )}
          </div>
        )}

        {/* Aptitude History */}
        {activeTab === "aptitude" && (
          <div className="flex flex-col gap-3">
            {practiceApt.length === 0 ? (
              <div className="glass-card p-12 border-white/5 flex flex-col items-center gap-3 text-center">
                <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center">
                  <BookOpen className="text-white/20 size-7" />
                </div>
                <p className="text-white font-semibold">No practice aptitude history yet</p>
                <p className="text-white/40 text-sm">Complete a practice aptitude exam to see your results here.</p>
              </div>
            ) : (
              practiceApt.map((sub, idx) => <AptHistoryCard key={sub.id} sub={sub} idx={idx} />)
            )}
          </div>
        )}

        {/* Technical History */}
        {activeTab === "technical" && (
          <div className="flex flex-col gap-3">
            {practiceTech.length === 0 ? (
              <div className="glass-card p-12 border-white/5 flex flex-col items-center gap-3 text-center">
                <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Code2 className="text-white/20 size-7" />
                </div>
                <p className="text-white font-semibold">No practice technical history yet</p>
                <p className="text-white/40 text-sm">Complete a practice technical exam to see your results here.</p>
              </div>
            ) : (
              practiceTech.map((sub, idx) => <TechHistoryCard key={sub.id} sub={sub} idx={idx} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
