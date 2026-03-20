"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import InstallButton from "@/components/InstallButton";
import { 
  MessageSquare, Code2, ClipboardList, GraduationCap, LogOut, 
  Download, Loader2, Clock, FileText, Timer, Play, Brain, 
  CheckCircle, AlertTriangle, Star, BarChart3, XCircle, 
  Target, Lightbulb, TrendingUp, CalendarDays, ShieldAlert 
} from "lucide-react";
import UserPerformanceBanner from "@/components/UserPerformanceBanner";
import StudentPerformanceBanner from "@/components/StudentPerformanceBanner";
import ExamSecurity from "@/components/ExamSecurity";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Layout, ClipboardList, Clock } from "lucide-react";
import {
  getAptitudeExamByCollege,
  submitAptitudeExam,
  getActiveSession,
  applyForExam,
  getStudentApplication,
} from "@/lib/actions/aptitude.action";

interface StudentSession {
  firestoreId: string; studentId: string; name: string;
  year: string; branch: string; collegeId: string; collegeName: string;
}
interface Question {
  question: string; optionA: string; optionB: string;
  optionC: string; optionD: string; correctAnswer: "A" | "B" | "C" | "D";
}
interface Exam { id: string; duration: number; questions: Question[]; }
interface QuestionAnalysis {
  questionNumber: number; isCorrect: boolean; timeTaken: number;
  yourAnswer: string; correctAnswer: string; explanation: string; tip: string;
}
interface AnalysisData {
  overallSummary: string;
  strengths: string[];
  weakAreas: string[];
  questionAnalysis: QuestionAnalysis[];
  timeManagement: string;
  improvementTips: string[];
  studyPlan: { week: string; focus: string; tasks: string[] }[];
}

const OPTIONS = ["A", "B", "C", "D"] as const;

// SecurityWarning removed in favor of unified ExamSecurity component

function parseAnalysis(raw: string): AnalysisData | null {
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch { return null; }
}

function DownloadPDF({
  student, result, analysis, autoSubmitted, totalTimeUsed, answeredCount,
}: {
  student: StudentSession | null;
  result: { score: number; percentage: number; total: number };
  analysis: AnalysisData | null;
  autoSubmitted: boolean;
  totalTimeUsed: number;
  answeredCount: number;
}) {
  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const passed = result.percentage >= 40;

  const handleDownload = () => {
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>Aptitude Exam Analysis - ${student?.name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Inter',Arial,sans-serif;background:#fff;color:#1a1a2e;padding:40px;font-size:13px;line-height:1.6;}
  .header{background:linear-gradient(135deg,#7c3aed,#4f46e5);color:white;padding:28px 32px;border-radius:16px;margin-bottom:24px;}
  .header h1{font-size:22px;font-weight:800;margin-bottom:4px;}.header p{opacity:0.8;font-size:13px;}
  .stats-row{display:flex;gap:16px;margin-bottom:24px;}
  .stat-box{flex:1;border:2px solid #e5e7eb;border-radius:12px;padding:16px;text-align:center;}
  .stat-box .val{font-size:28px;font-weight:800;}.stat-box .lbl{font-size:11px;color:#6b7280;margin-top:4px;font-weight:500;}
  .green{color:#10b981;border-color:#10b981;}.red{color:#ef4444;border-color:#ef4444;}
  .purple{color:#7c3aed;border-color:#7c3aed;}.blue{color:#3b82f6;border-color:#3b82f6;}
  .section{margin-bottom:24px;}.section-title{font-size:15px;font-weight:700;margin-bottom:12px;border-bottom:2px solid #f3f4f6;padding-bottom:8px;color:#111827;}
  .pill-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;}
  .pill{padding:6px 14px;border-radius:999px;font-size:12px;font-weight:600;}
  .pill-green{background:#d1fae5;color:#065f46;}.pill-red{background:#fee2e2;color:#991b1b;}
  .q-card{border:1.5px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:12px;page-break-inside:avoid;}
  .q-card.correct{border-color:#10b981;background:#f0fdf4;}.q-card.wrong{border-color:#ef4444;background:#fef2f2;}
  .q-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
  .q-num{font-weight:700;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;}
  .badge{padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;}
  .badge-green{background:#10b981;color:white;}.badge-red{background:#ef4444;color:white;}
  .ans-row{display:flex;gap:16px;font-size:12px;margin-bottom:8px;}
  .ans-item{padding:4px 12px;border-radius:6px;}.your-ans{background:#fef3c7;}.correct-ans{background:#d1fae5;}
  .explanation{background:#f9fafb;border-left:3px solid #7c3aed;padding:10px 14px;border-radius:0 8px 8px 0;font-size:12px;color:#374151;}
  .tip-box{background:#fef3c7;border-left:3px solid #f59e0b;padding:8px 14px;border-radius:0 8px 8px 0;font-size:12px;margin-top:8px;}
  .footer{margin-top:32px;text-align:center;color:#9ca3af;font-size:11px;border-top:1px solid #e5e7eb;padding-top:16px;}
</style></head><body>
<div class="header">
  <h1>📊 Aptitude Exam Analysis Report</h1>
  <p>${student?.name} &nbsp;|&nbsp; ${student?.collegeName} &nbsp;|&nbsp; ${student?.branch} · Year ${student?.year}</p>
  <p style="margin-top:4px;font-size:11px;opacity:0.7">Student ID: ${student?.studentId} &nbsp;|&nbsp; Generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
</div>
${autoSubmitted ? '<div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:10px;padding:12px 16px;margin-bottom:20px;font-size:12px;color:#92400e;font-weight:600;">⏰ Exam was auto-submitted due to time expiry</div>' : ""}
<div class="stats-row">
  <div class="stat-box ${passed ? "green" : "red"}"><div class="val">${result.score}/${result.total}</div><div class="lbl">Score</div></div>
  <div class="stat-box ${passed ? "green" : "red"}"><div class="val">${result.percentage}%</div><div class="lbl">Percentage</div></div>
  <div class="stat-box blue"><div class="val">${formatTime(totalTimeUsed)}</div><div class="lbl">Time Used</div></div>
  <div class="stat-box purple"><div class="val">${answeredCount}/${result.total}</div><div class="lbl">Attempted</div></div>
</div>
${analysis ? `
<div class="section"><div class="section-title">📝 Overall Summary</div><p style="color:#374151;font-size:13px;">${analysis.overallSummary}</p></div>
<div class="section"><div class="section-title">💪 Strengths</div><div class="pill-row">${analysis.strengths.map(s => `<span class="pill pill-green">✓ ${s}</span>`).join("")}</div></div>
<div class="section"><div class="section-title">⚠️ Weak Areas</div><div class="pill-row">${analysis.weakAreas.map(w => `<span class="pill pill-red">✗ ${w}</span>`).join("")}</div></div>
<div class="section"><div class="section-title">🔍 Question-by-Question Analysis</div>
${analysis.questionAnalysis.map(qa => `<div class="q-card ${qa.isCorrect ? "correct" : "wrong"}">
<div class="q-header"><span class="q-num">Question ${qa.questionNumber}</span><div style="display:flex;gap:8px;align-items:center;"><span style="font-size:11px;color:#6b7280;">⏱ ${qa.timeTaken}s</span><span class="badge ${qa.isCorrect ? "badge-green" : "badge-red"}">${qa.isCorrect ? "✓ Correct" : "✗ Wrong"}</span></div></div>
<div class="ans-row"><span class="ans-item your-ans">Your Answer: <strong>${qa.yourAnswer}</strong></span><span class="ans-item correct-ans">Correct: <strong>${qa.correctAnswer}</strong></span></div>
<div class="explanation"><strong>Explanation:</strong> ${qa.explanation}</div>
${qa.tip ? `<div class="tip-box"><strong>⚡ Faster Method:</strong> ${qa.tip}</div>` : ""}
</div>`).join("")}
</div>` : ""}
<div class="footer">Analysis generated by Gemini AI &nbsp;|&nbsp; Careely Aptitude Portal</div>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) { win.onload = () => { win.print(); URL.revokeObjectURL(url); }; }
  };

  return (
    <Button onClick={handleDownload} variant="outline" className="border-primary-200/30 text-primary-200 hover:bg-primary-200/10 gap-2 font-semibold rounded-xl">
      <Download size={16} /> Download PDF
    </Button>
  );
}

// ============================================================
// Main Page
// ============================================================
export default function StudentExamPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);

  // Exam state
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [answerTimes, setAnswerTimes] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [examStartTime, setExamStartTime] = useState<number>(0);
  const [status, setStatus] = useState<"loading" | "no-session" | "apply" | "exam" | "submitting" | "result">("loading");
  const [result, setResult] = useState<{ score: number; percentage: number; total: number; aiFeedback: string } | null>(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zenMode, setZenMode] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalDurationRef = useRef<number>(0);
  const timeLeftRef = useRef<number>(0);
  const statusRef = useRef<string>("loading");
  const violationCountRef = useRef(0);
  const doSubmitRef = useRef<((isAuto: boolean) => Promise<void>) | null>(null);

  // ── Load student + check session + application ──
  useEffect(() => {
    const raw = localStorage.getItem("studentSession");
    if (!raw) { router.replace("/student/login"); return; }
    const session: StudentSession = JSON.parse(raw);
    setStudent(session);

    (async () => {
      const [fetchedExam, sessionData] = await Promise.all([
        getAptitudeExamByCollege(session.collegeId),
        getActiveSession(session.collegeId),
      ]);

      setExam(fetchedExam ?? null);
      setActiveSession(sessionData);

      if (!sessionData) {
        statusRef.current = "no-session";
        setStatus("no-session");
        return;
      }

      // Check if student has already applied
      const existingApp = await getStudentApplication(session.studentId, sessionData.id);
      setApplication(existingApp);

      if (existingApp) {
        // Already applied — go directly to exam
        if (fetchedExam) {
          const totalSecs = fetchedExam.duration * 60;
          setTimeLeft(totalSecs);
          timeLeftRef.current = totalSecs;
          totalDurationRef.current = totalSecs;
          setExamStartTime(Date.now());
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
          statusRef.current = "exam";
          setStatus("exam");
        } else {
          statusRef.current = "no-session";
          setStatus("no-session");
        }
      } else {
        // Show apply screen
        statusRef.current = "apply";
        setStatus("apply");
      }
    })();
  }, [router]);

  useEffect(() => { statusRef.current = status; }, [status]);

  // ── Apply for exam ──
  const handleApply = async () => {
    // Immediate fullscreen request to capture user gesture context
    try {
      if (typeof document !== "undefined" && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {}

    if (!student || !activeSession || !exam) return;
    setApplyLoading(true);
    const result = await applyForExam({
      studentId: student.studentId,
      studentFirestoreId: student.firestoreId,
      sessionId: activeSession.id,
      collegeId: student.collegeId,
    });
    setApplyLoading(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Applied! Starting your exam...");
    const totalSecs = exam.duration * 60;
    setTimeLeft(totalSecs);
    timeLeftRef.current = totalSecs;
    totalDurationRef.current = totalSecs;
    setExamStartTime(Date.now());
    statusRef.current = "exam";
    setStatus("exam");
  };

  // ── Security ──
  // Security handled by ExamSecurity component

  const handleAnswerSelect = (questionIdx: number, opt: string) => {
    const elapsed = Math.round((Date.now() - examStartTime) / 1000);
    setAnswers((prev) => ({ ...prev, [questionIdx]: opt }));
    setAnswerTimes((prev) => {
      if (prev[questionIdx] !== undefined) return prev;
      return { ...prev, [questionIdx]: elapsed };
    });
  };

  const doSubmit = useCallback(async (isAuto: boolean) => {
    if (!exam || !student || !activeSession) return;
    if (statusRef.current === "submitting" || statusRef.current === "result") return;
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus("submitting");
    setAutoSubmitted(isAuto);

    const totalTimeUsed = totalDurationRef.current - timeLeftRef.current;
    const res = await submitAptitudeExam({
      examId: exam.id,
      sessionId: activeSession.id,
      studentId: student.studentId,
      collegeId: student.collegeId,
      studentFirestoreId: student.firestoreId,
      studentName: student.name,
      studentYear: student.year,
      studentBranch: student.branch,
      answers,
      answerTimes,
      totalTimeUsed,
      autoSubmitted: isAuto,
      questions: exam.questions,
    });

    if (res.success) {
      setResult({ score: res.score!, percentage: res.percentage!, total: exam.questions.length, aiFeedback: res.aiFeedback || "" });
      setStatus("result");
      localStorage.removeItem("studentSession");
    } else {
      toast.error("Submission failed. Please try again.");
      setStatus("exam");
    }
  }, [exam, student, activeSession, answers, answerTimes]);

  useEffect(() => { doSubmitRef.current = doSubmit; }, [doSubmit]);

  useEffect(() => {
    if (status !== "exam" || timeLeft <= 0 || !exam) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        timeLeftRef.current = prev - 1;
        if (prev <= 1) { clearInterval(timerRef.current!); doSubmit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status, exam, doSubmit]);

  useEffect(() => {
    if ((status === "result" || status === "submitting") && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [status]);

  const formatTime = (secs: number) =>
    `${Math.floor(secs / 60).toString().padStart(2, "0")}:${(secs % 60).toString().padStart(2, "0")}`;

  const timerColor = timeLeft > 300 ? "text-green-400" : timeLeft > 60 ? "text-yellow-400" : "text-red-400 animate-pulse";

  // ── LOADING ──
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center pattern">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary-200 size-10 animate-spin" />
          <p className="text-white/50">Loading your portal...</p>
        </div>
      </div>
    );
  }

  // ── NO ACTIVE SESSION ──
  if (status === "no-session") {
    return (
      <div className="min-h-screen flex items-center justify-center pattern px-4">
        <div className="card-border max-w-md w-full">
          <div className="card flex flex-col items-center gap-4 py-12 px-10 text-center">
            <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <GraduationCap className="text-white/20 size-8" />
            </div>
            <h2 className="text-xl font-bold text-white">No Exam Active</h2>
            <p className="text-white/50">
              Your college hasn&apos;t started an exam session yet. Check back later!
            </p>
            <div className="flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-white/5 text-white/30 text-sm">
              <Clock size={14} />
              Your college will notify you when the exam starts.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── APPLY SCREEN ──
  if (status === "apply" && activeSession && exam) {
    return (
      <div className="min-h-screen flex items-center justify-center pattern px-4">
        <div className="max-w-lg w-full flex flex-col gap-6">
          {/* Session Banner */}
          <div className="glass-card p-8 border-primary-200/30 flex flex-col items-center gap-5 text-center">
            <div className="relative">
              <div className="size-20 rounded-3xl bg-primary-200/10 flex items-center justify-center">
                <ClipboardList className="text-primary-200 size-10" />
              </div>
              <span className="absolute -top-1 -right-1 size-5 rounded-full bg-green-400 animate-pulse border-2 border-[#09090b]" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/30 mb-3 inline-block">
                🟢 Exam Started
              </span>
              <h1 className="text-2xl font-black text-white mt-2">
                {activeSession.sessionName}
              </h1>
              <p className="text-white/50 text-sm mt-1">
                {student?.collegeName}
              </p>
            </div>

            {/* Exam info */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="glass-card px-5 py-4 text-center border-white/5">
                <p className="text-2xl font-black text-blue-400">{exam.questions.length}</p>
                <p className="text-white/40 text-xs mt-1 flex items-center justify-center gap-1">
                  <FileText size={10} /> Questions
                </p>
              </div>
              <div className="glass-card px-5 py-4 text-center border-white/5">
                <p className="text-2xl font-black text-purple-400">{exam.duration}</p>
                <p className="text-white/40 text-xs mt-1 flex items-center justify-center gap-1">
                  <Timer size={10} /> Minutes
                </p>
              </div>
            </div>

            <p className="text-white/40 text-xs max-w-xs">
              Once you click Apply, the exam will begin immediately. Tab switches will auto-submit your exam.
            </p>

            <Button
              onClick={handleApply}
              disabled={applyLoading}
              className="w-full h-13 text-base font-bold rounded-xl bg-primary-200 hover:bg-primary-300 text-black gap-2"
            >
              {applyLoading
                ? <><Loader2 size={18} className="animate-spin" />Applying...</>
                : <><Play size={18} fill="currentColor" />Apply & Start Exam</>
              }
            </Button>

            <p className="text-white/30 text-xs">
              Student: <strong className="text-white/50">{student?.name}</strong> · {student?.studentId}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── SUBMITTING ──
  if (status === "submitting") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center pattern bg-[#050505]">
        <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
          <div className="relative">
            <div className="size-20 rounded-3xl bg-primary-200/10 flex items-center justify-center">
              <Brain className="text-primary-200 size-10" />
            </div>
            <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-[#09090b] flex items-center justify-center">
              <Loader2 className="text-primary-200 size-4 animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">Generating Your Analysis</h2>
          <p className="text-white/50">Gemini AI is analysing your answers and preparing personalised feedback...</p>
          <div className="flex gap-2">
            {["Scoring", "Analysing", "AI Feedback"].map((step, i) => (
              <span key={i} className="px-3 py-1 text-xs rounded-full bg-primary-200/10 text-primary-200 border border-primary-200/20">{step}...</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT ──
  if (status === "result" && result) {
    const passed = result.percentage >= 40;
    const totalTimeUsed = totalDurationRef.current - timeLeftRef.current;
    const avgTimePerQ = result.total > 0 ? Math.round(totalTimeUsed / result.total) : 0;
    const answered = Object.keys(answers).length;
    const analysis = parseAnalysis(result.aiFeedback);

    return (
      <div className="min-h-screen pattern pb-20 px-4 pt-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <div className={`glass-card p-8 flex flex-col sm:flex-row items-start gap-6 border ${passed ? "border-green-500/30" : "border-red-500/30"}`}>
            <div className={`size-16 rounded-2xl flex items-center justify-center shrink-0 ${passed ? "bg-green-500/10" : "bg-red-500/10"}`}>
              {passed ? <CheckCircle className="text-green-400 size-8" /> : <AlertTriangle className="text-red-400 size-8" />}
            </div>
            <div className="flex-1">
              {autoSubmitted && <p className="text-yellow-400 text-sm mb-1 font-medium">⏰ Auto-submitted — time expired</p>}
              <h1 className="text-2xl font-black text-white">{passed ? "Well Done! 🎉" : "Keep Practising 💪"}</h1>
              <p className="text-white/50 text-sm mt-1">{student?.name} · {student?.collegeName} · {student?.branch} · Year {student?.year}</p>
            </div>
            <DownloadPDF student={student} result={result} analysis={analysis} autoSubmitted={autoSubmitted} totalTimeUsed={totalTimeUsed} answeredCount={answered} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Score", val: `${result.score}/${result.total}`, color: passed ? "text-green-400" : "text-red-400", icon: <Star size={14} />, border: passed ? "border-green-500/20" : "border-red-500/20" },
              { label: "Percentage", val: `${result.percentage}%`, color: passed ? "text-green-400" : "text-red-400", icon: <BarChart3 size={14} />, border: passed ? "border-green-500/20" : "border-red-500/20" },
              { label: "Time Used", val: formatTime(totalTimeUsed), color: "text-blue-400", icon: <Timer size={14} />, border: "border-blue-400/20" },
              { label: "Avg / Question", val: `${avgTimePerQ}s`, color: "text-purple-400", icon: <Clock size={14} />, border: "border-purple-400/20" },
            ].map((s, i) => (
              <div key={i} className={`glass-card px-5 py-5 text-center ${s.border}`}>
                <div className={`flex items-center justify-center gap-1 ${s.color} mb-2 text-xs font-medium`}>{s.icon}{s.label}</div>
                <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>

          {analysis ? (
            <>
              <div className="glass-card p-6 border-white/5">
                <div className="flex items-center gap-2 mb-4"><Brain className="text-primary-200 size-5" /><h2 className="text-lg font-bold text-white">Overall Summary</h2></div>
                <p className="text-white/70 leading-relaxed">{analysis.overallSummary}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-card p-6 border-green-500/20">
                  <div className="flex items-center gap-2 mb-4"><CheckCircle className="text-green-400 size-5" /><h2 className="text-lg font-bold text-white">Strengths</h2></div>
                  <ul className="flex flex-col gap-2">{analysis.strengths.map((s, i) => (<li key={i} className="flex items-start gap-2 text-sm text-white/70"><span className="size-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">✓</span>{s}</li>))}</ul>
                </div>
                <div className="glass-card p-6 border-red-500/20">
                  <div className="flex items-center gap-2 mb-4"><XCircle className="text-red-400 size-5" /><h2 className="text-lg font-bold text-white">Areas to Improve</h2></div>
                  <ul className="flex flex-col gap-2">{analysis.weakAreas.map((w, i) => (<li key={i} className="flex items-start gap-2 text-sm text-white/70"><span className="size-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">!</span>{w}</li>))}</ul>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2"><Target className="text-blue-400 size-5" /><h2 className="text-lg font-bold text-white">Question Breakdown</h2></div>
                {analysis.questionAnalysis.map((qa, i) => (
                  <div key={i} className={`glass-card p-5 border ${qa.isCorrect ? "border-green-500/25" : "border-red-500/25"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Q{qa.questionNumber}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${qa.isCorrect ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>{qa.isCorrect ? "✓ Correct" : "✗ Wrong"}</span>
                      </div>
                      <span className="flex items-center gap-1 text-white/40 text-xs"><Clock size={11} /> {qa.timeTaken}s</span>
                    </div>
                    <div className="flex gap-3 mb-3">
                      <span className="px-3 py-1 rounded-lg bg-white/5 text-white/60 text-xs">Your answer: <strong className="text-white">{qa.yourAnswer}</strong></span>
                      <span className="px-3 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs">Correct: <strong>{qa.correctAnswer}</strong></span>
                    </div>
                    <div className="bg-white/3 border border-white/5 rounded-xl p-4 mb-2">
                      <p className="text-white/60 text-sm leading-relaxed">{qa.explanation}</p>
                    </div>
                    {qa.tip && (
                      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 flex items-start gap-2">
                        <Lightbulb size={14} className="text-yellow-400 mt-0.5 shrink-0" />
                        <p className="text-yellow-300/80 text-xs leading-relaxed"><strong className="text-yellow-400">Faster Method: </strong>{qa.tip}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="glass-card p-6 border-blue-400/20">
                <div className="flex items-center gap-2 mb-4"><Timer className="text-blue-400 size-5" /><h2 className="text-lg font-bold text-white">Time Management</h2></div>
                <p className="text-white/70 leading-relaxed text-sm">{analysis.timeManagement}</p>
              </div>
              <div className="glass-card p-6 border-purple-400/20">
                <div className="flex items-center gap-2 mb-4"><TrendingUp className="text-purple-400 size-5" /><h2 className="text-lg font-bold text-white">Improvement Tips</h2></div>
                <div className="flex flex-col gap-3">
                  {analysis.improvementTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="size-6 rounded-full bg-purple-400/20 text-purple-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">{i + 1}</span>
                      <p className="text-white/70 text-sm leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card p-6 border-primary-200/20">
                <div className="flex items-center gap-2 mb-4"><CalendarDays className="text-primary-200 size-5" /><h2 className="text-lg font-bold text-white">Study Plan</h2></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {analysis.studyPlan.map((week, i) => (
                    <div key={i} className="bg-white/3 border border-white/5 rounded-xl p-4">
                      <p className="text-primary-200 font-bold text-sm mb-1">{week.week}</p>
                      <p className="text-white/50 text-xs mb-3 flex items-center gap-1"><BookOpen size={11} />{week.focus}</p>
                      <ul className="flex flex-col gap-1.5">
                        {week.tasks.map((task, j) => (
                          <li key={j} className="flex items-start gap-1.5 text-xs text-white/60">
                            <span className="text-primary-200 shrink-0 mt-0.5">›</span>{task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-8 border-primary-200/20">
              <div className="flex items-center gap-3 mb-6"><Brain className="text-primary-200 size-5" /><h2 className="text-lg font-bold text-white">AI Analysis</h2></div>
              <pre className="text-white/70 text-sm whitespace-pre-wrap leading-relaxed">{result.aiFeedback}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── EXAM ──
  if (status !== "exam" || !exam) return null;

  const answered = Object.keys(answers).length;
  const total = exam.questions.length;

  return (
    <div className="fixed inset-0 z-50 pattern pb-32 select-none overflow-y-auto bg-[#050505]" onCopy={(e) => e.preventDefault()} onCut={(e) => e.preventDefault()}>
      <ExamSecurity 
        isActive={status === "exam"} 
        onAutoSubmit={() => doSubmit(true)} 
        title="Official Aptitude Exam"
      />
      {violationCountRef.current > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[99] px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold flex items-center gap-2">
          <ShieldAlert size={12} />1 violation recorded — next tab switch will auto-submit
        </div>
      )}
      {/* FLOATING ZEN CONTROLS (Mobile Only) */}
      <div className="md:hidden fixed top-4 right-4 z-[110] flex gap-2">
         <button 
            onClick={() => setZenMode(!zenMode)}
            className="size-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/70 shadow-2xl"
          >
            {zenMode ? <Layout size={20} /> : <Target size={20} className="text-primary-200" />}
          </button>
      </div>

      {/* COMPACT MOBILE TIMER (Visible in Zen Mode) */}
      {zenMode && (
        <div className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-[110] glass-card px-4 py-2 border-primary-200/30 flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom-4">
          <Clock className="size-4 text-primary-200" />
          <span className={`text-lg font-black font-mono tracking-widest ${timerColor}`}>{formatTime(timeLeft)}</span>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <span className="text-xs font-bold text-white/40">{activeIndex + 1}/{total}</span>
        </div>
      )}

      {/* Top Bar - More compact on mobile */}
      <div className={cn(
        "sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-xl border-b border-white/10 px-4 md:px-6 py-2 md:py-4 flex flex-row items-center justify-between gap-4 h-16 md:h-20 transition-all duration-300",
        zenMode && "opacity-0 -translate-y-full pointer-events-none"
      )}>
        <div className="flex flex-col items-start min-w-0">
          <p className="text-white font-bold text-sm md:text-lg truncate w-full">{student?.name}</p>
          <p className="text-white/40 text-[9px] md:text-xs truncate w-full">{student?.branch} · Year {student?.year}</p>
        </div>

        <div className="flex flex-col items-center shrink-0">
          <p className={`text-xl md:text-3xl font-black font-mono leading-none ${timerColor}`}>{formatTime(timeLeft)}</p>
          <p className="text-[#666] text-[8px] md:text-xs mt-0.5 uppercase tracking-widest font-bold">Remaining</p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <p className="text-white/50 text-[10px] md:text-sm font-bold">{answered}/{total}</p>
          <div className="w-16 md:w-32 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary-200 rounded-full transition-all" style={{ width: `${(answered / total) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-4 md:pt-8 flex flex-col gap-6 pb-40">
        <div className="flex flex-col max-md:hidden">
          <h1 className="text-2xl font-bold text-white">Aptitude Examination</h1>
          <p className="text-white/40 text-sm">
            {activeSession?.sessionName} · {student?.collegeName} · {total} Questions · {exam.duration} min
          </p>
        </div>

        {exam.questions.map((q, idx) => (
          <div 
            key={idx} 
            className={cn(
              "glass-card p-6 md:p-8 border transition-all duration-300 relative overflow-hidden",
              answers[idx] ? "border-primary-200/30" : "border-white/5",
              "max-md:p-5",
              activeIndex !== idx && "max-md:hidden",
              zenMode ? "max-md:min-h-[85vh] max-md:justify-center" : "max-md:mb-4"
            )}
          >
            {/* Question Index Badge */}
            <div className="absolute top-0 right-0 px-4 py-2 bg-white/5 border-l border-b border-white/5 text-[10px] font-black text-white/20 uppercase tracking-widest">
              Q{idx + 1}
            </div>

            <p className="text-white/50 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-4 md:mb-6">Aptitude Question</p>
            <p className="text-base md:text-xl text-white font-semibold mb-6 md:mb-10 leading-relaxed">{q.question}</p>
            
            <div className="flex flex-col gap-3 md:gap-4">
              {OPTIONS.map((opt) => {
                const optText = q[`option${opt}` as keyof Question] as string;
                const isSelected = answers[idx] === opt;
                return (
                  <button 
                    key={opt} 
                    onClick={() => handleAnswerSelect(idx, opt)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-4 md:py-5 rounded-xl md:rounded-2xl border text-left transition-all group",
                      isSelected 
                        ? "border-primary-200 bg-primary-200/10 shadow-[0_0_20px_rgba(var(--primary-200-rgb),0.1)]" 
                        : "border-white/5 bg-white/[0.02] text-white/50 hover:bg-white/[0.05] hover:border-white/20"
                    )}
                  >
                    <span className={cn(
                      "size-8 md:size-10 rounded-lg md:rounded-xl flex items-center justify-center text-xs md:text-sm font-black shrink-0 transition-all",
                      isSelected ? "bg-primary-200 text-black scale-110" : "bg-white/5 text-white/30 group-hover:bg-white/10"
                    )}>
                      {opt}
                    </span>
                    <span className={cn(
                      "text-sm md:text-lg font-medium tracking-tight",
                      isSelected ? "text-white" : "text-white/60"
                    )}>
                      {optText}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* MOBILE NAVIGATION CONTROLS */}
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 flex items-center gap-3">
          <Button 
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
            className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10" 
          >
            Previous
          </Button>

          {activeIndex < total - 1 ? (
            <Button 
              onClick={() => setActiveIndex(prev => Math.min(total - 1, prev + 1))}
              className="flex-[2] h-14 rounded-2xl bg-primary-200 hover:bg-primary-300 text-black font-black shadow-2xl"
            >
              Next Question
            </Button>
          ) : (
            <Button 
              onClick={() => doSubmit(false)} 
              className="flex-[2] h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black shadow-2xl"
            >
              Submit Exam
            </Button>
          )}
        </div>

        <Button 
          onClick={() => doSubmit(false)} 
          className="max-md:hidden w-full h-16 text-xl font-black rounded-2xl mt-4 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
        >
          Submit Exam ({answered}/{total} answered)
        </Button>
      </div>
    </div>
  );
}
