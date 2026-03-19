"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  BookOpen, Plus, Save, Loader2, CheckCircle,
  Play, Square, Trophy, Clock, Users,
  CheckCircle2, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  saveAptitudeExam,
  startExamSession,
  endExamSession,
  type Question,
} from "@/lib/actions/aptitude.action";
import ExamSessionPDFButton from "./ExamSessionPDFButton";

const OPTIONS = ["A", "B", "C", "D"] as const;

interface SessionDoc {
  id: string;
  sessionName: string;
  status: "active" | "ended";
  startedAt: string;
  endedAt?: string;
}

interface AptitudeSetupClientProps {
  collegeId: string;
  collegeName: string;
  existingExam?: any;
  activeSession?: SessionDoc | null;
  allSessions?: SessionDoc[];
  submissionsBySession?: Record<string, any[]>;
}

export default function AptitudeSetupClient({
  collegeId,
  collegeName,
  existingExam,
  activeSession: initialActiveSession,
  allSessions: initialAllSessions = [],
  submissionsBySession = {},
}: AptitudeSetupClientProps) {
  const [step, setStep] = useState<"config" | "questions" | "done">(
    existingExam ? "done" : "config"
  );
  const [numQuestions, setNumQuestions] = useState<number>(50);
  const [duration, setDuration] = useState<number>(30);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(!!existingExam);
  const [activeSession, setActiveSession] = useState<SessionDoc | null>(
    initialActiveSession ?? null
  );
  const [allSessions, setAllSessions] = useState<SessionDoc[]>(initialAllSessions);
  const [sessionLoading, setSessionLoading] = useState(false);

  const handleConfig = () => {
    if (numQuestions < 1 || numQuestions > 100) {
      toast.error("Questions must be between 1 and 100.");
      return;
    }
    if (duration < 1 || duration > 300) {
      toast.error("Duration must be between 1 and 300 minutes.");
      return;
    }
    const blank: Question[] = Array.from({ length: numQuestions }, () => ({
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A" as const,
    }));
    setQuestions(blank);
    setStep("questions");
  };

  const updateQuestion = (idx: number, field: keyof Question, value: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim() || !q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) {
        toast.error(`Please fill in all fields for Question ${i + 1}.`);
        return;
      }
    }
    setLoading(true);
    const result = await saveAptitudeExam({ collegeId, collegeName, duration, questions });
    setLoading(false);
    if (!result.success) { toast.error(result.message); return; }
    toast.success("Exam paper saved! You can now start an exam session.");
    setSaved(true);
    setStep("done");
  };

  const handleStartExam = async () => {
    if (!existingExam?.id) { toast.error("Save an exam paper first."); return; }
    setSessionLoading(true);
    const result = await startExamSession({
      collegeId,
      collegeName,
      examId: existingExam.id,
    });
    setSessionLoading(false);
    if (!result.success) { toast.error(result.message); return; }
    const newSession: SessionDoc = {
      id: result.sessionId!,
      sessionName: result.sessionName!,
      status: "active",
      startedAt: new Date().toISOString(),
    };
    setActiveSession(newSession);
    setAllSessions((prev) => [newSession, ...prev]);
    toast.success(`${result.sessionName} started! Students can now apply.`);
  };

  const handleEndExam = async () => {
    if (!activeSession) return;
    setSessionLoading(true);
    const result = await endExamSession(activeSession.id);
    setSessionLoading(false);
    if (!result.success) { toast.error(result.message); return; }
    const ended = { ...activeSession, status: "ended" as const, endedAt: new Date().toISOString() };
    setActiveSession(null);
    setAllSessions((prev) => prev.map((s) => s.id === ended.id ? ended : s));
    toast.success(`${activeSession.sessionName} ended. Results are now saved.`);
  };

  // ── DONE ─────────────────────────────────────────────────
  if (step === "done") {
    const exam = existingExam;
    const qCount = saved ? questions.length : exam?.questions?.length ?? 0;
    const dur = saved ? duration : exam?.duration ?? 0;

    return (
      <div className="flex flex-col gap-8 pb-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <BookOpen className="text-blue-400 size-7" />
          <h1 className="text-3xl font-bold text-white">Aptitude Round</h1>
        </div>

        {/* Exam Paper Info + Session Controls */}
        <div className="glass-card p-8 border-blue-400/20 flex flex-col gap-6">
          {/* Paper Summary */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="text-green-400 size-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {saved ? "Exam Paper Saved!" : "Exam Paper Ready"}
                </h2>
                <p className="text-white/40 text-sm">{qCount} Questions · {dur} Minutes</p>
              </div>
            </div>
            <Button
              onClick={() => { setSaved(false); setStep("config"); }}
              variant="outline"
              size="sm"
              className="border-white/10 hover:bg-white/5 text-white/60 text-sm"
            >
              <Plus size={14} className="mr-1.5" /> New Paper
            </Button>
          </div>

          {/* Session Status */}
          <div className="border-t border-white/5 pt-6">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Exam Session Control</p>

            {activeSession ? (
              <div className="flex items-center justify-between gap-4 flex-wrap bg-green-500/5 border border-green-500/20 rounded-2xl px-6 py-5">
                <div className="flex items-center gap-3">
                  <span className="size-3 rounded-full bg-green-400 animate-pulse inline-block" />
                  <div>
                    <p className="text-white font-bold text-lg">{activeSession.sessionName} — Active</p>
                    <p className="text-white/40 text-xs flex items-center gap-1 mt-0.5">
                      <Clock size={11} />
                      Started {new Date(activeSession.startedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleEndExam}
                  disabled={sessionLoading}
                  className="bg-red-500 hover:bg-red-600 font-bold rounded-xl gap-2"
                >
                  {sessionLoading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Square size={16} fill="currentColor" />
                  }
                  End Exam
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4 flex-wrap bg-white/3 border border-white/10 rounded-2xl px-6 py-5">
                <div>
                  <p className="text-white/50 font-medium">No active exam session</p>
                  <p className="text-white/30 text-sm mt-0.5">
                    Start a session so students can see and apply for the exam.
                  </p>
                </div>
                <Button
                  onClick={handleStartExam}
                  disabled={sessionLoading}
                  className="bg-green-600 hover:bg-green-700 font-bold rounded-xl gap-2"
                >
                  {sessionLoading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Play size={16} fill="currentColor" />
                  }
                  Start Exam
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sessions History + Results */}
        {allSessions.length > 0 && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <Trophy className="text-yellow-400 size-5" />
              <h2 className="text-xl font-bold text-white">Exam Sessions & Results</h2>
            </div>

            <div className="flex flex-col gap-3">
              {allSessions.map((session) => {
                const subs = submissionsBySession[session.id] ?? [];
                const avg = subs.length > 0
                  ? Math.round(subs.reduce((s: number, r: any) => s + (r.percentage ?? 0), 0) / subs.length)
                  : null;
                const isActive = session.status === "active";

                return (
                  <div
                    key={session.id}
                    className={`glass-card px-6 py-5 border flex items-center justify-between flex-wrap gap-4 ${isActive ? "border-green-500/30" : "border-white/5"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`size-10 rounded-xl flex items-center justify-center ${isActive ? "bg-green-500/10" : "bg-white/5"}`}>
                        {isActive
                          ? <Play className="text-green-400 size-5" fill="currentColor" />
                          : <CheckCircle2 className="text-white/30 size-5" />
                        }
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-bold">{session.sessionName}</p>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/30">
                              Live
                            </span>
                          )}
                        </div>
                        <p className="text-white/30 text-xs mt-0.5 flex items-center gap-2">
                          <Users size={10} /> {subs.length} student{subs.length !== 1 ? "s" : ""}
                          {avg !== null && <><span>·</span><span>Avg {avg}%</span></>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {subs.length > 0 && (
                        <ExamSessionPDFButton
                          sessionName={session.sessionName}
                          submissions={subs}
                          collegeName={collegeName}
                        />
                      )}
                      {subs.length === 0 && !isActive && (
                        <span className="text-white/30 text-sm">No submissions yet</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inline leaderboard for active or most recent session */}
            {(() => {
              const targetSession = activeSession ?? allSessions.find(s => s.status === "ended");
              if (!targetSession) return null;
              const subs = submissionsBySession[targetSession.id] ?? [];
              if (subs.length === 0) return null;
              return (
                <div className="flex flex-col gap-3 mt-2">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                    {targetSession.sessionName} — Leaderboard
                  </p>
                  <div className="glass-card border-white/5 overflow-hidden">
                    <div className="grid grid-cols-[40px_1fr_120px_80px_80px_100px_120px] gap-0 px-5 py-3 border-b border-white/5 text-white/40 text-xs font-bold uppercase tracking-widest">
                      <span>#</span><span>Student</span><span>Branch</span>
                      <span>Year</span><span>Score</span><span>%</span><span>Time</span>
                    </div>
                    {subs.slice(0, 20).map((sub: any, idx: number) => {
                      const passed = sub.percentage >= 40;
                      const mins = Math.floor((sub.totalTimeUsed ?? 0) / 60);
                      const secs = (sub.totalTimeUsed ?? 0) % 60;
                      return (
                        <div
                          key={sub.id}
                          className={`grid grid-cols-[40px_1fr_120px_80px_80px_100px_120px] gap-0 px-5 py-4 border-b border-white/5 last:border-b-0 hover:bg-white/3 items-center ${idx === 0 ? "bg-yellow-400/3" : ""}`}
                        >
                          <span className={`text-sm font-bold ${idx === 0 ? "text-yellow-400" : idx === 1 ? "text-white/50" : idx === 2 ? "text-amber-600" : "text-white/30"}`}>
                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}
                          </span>
                          <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-full bg-primary-200/20 flex items-center justify-center text-primary-200 font-bold text-sm shrink-0">
                              {(sub.studentName || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium leading-none">{sub.studentName || "—"}</p>
                              <p className="text-white/30 text-xs mt-0.5 font-mono">{sub.studentId}</p>
                            </div>
                          </div>
                          <span className="text-white/50 text-xs truncate">{sub.studentBranch || "—"}</span>
                          <span className="text-white/50 text-xs">Year {sub.studentYear || "—"}</span>
                          <span className="text-white font-bold text-sm">{sub.score ?? 0}/{sub.totalQuestions ?? "?"}</span>
                          <span className={`flex items-center gap-1 text-sm font-bold ${passed ? "text-green-400" : "text-red-400"}`}>
                            {passed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                            {sub.percentage ?? 0}%
                          </span>
                          <span className="text-white/40 text-xs flex items-center gap-1">
                            <Clock size={11} />{mins}m {secs}s
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    );
  }

  // ── CONFIG ────────────────────────────────────────────────
  if (step === "config") {
    return (
      <div className="flex flex-col gap-8 pb-20">
        <div className="flex items-center gap-3">
          <BookOpen className="text-blue-400 size-7" />
          <h1 className="text-3xl font-bold text-white">Aptitude Round Setup</h1>
        </div>
        <div className="max-w-xl glass-card p-8 border-blue-400/20 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-white">Configure Exam Paper</h2>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/70">Number of Questions</label>
            <div className="w-full bg-white/5 border border-blue-500/30 rounded-xl px-4 py-3 text-white text-lg font-bold flex items-center justify-between">
              <span>Standard Exam Size</span>
              <span className="text-blue-400">50 Questions</span>
            </div>
            <p className="text-white/30 text-xs">How many questions should appear in the exam?</p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/70">Exam Duration (minutes)</label>
            <input
              type="number" min={1} max={300} value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-blue-400/50 transition-all"
            />
            <p className="text-white/30 text-xs">Timer starts as soon as the student enters the exam.</p>
          </div>
          <Button onClick={handleConfig} className="h-12 text-base font-bold rounded-xl bg-blue-500 hover:bg-blue-600">
            <Plus size={18} className="mr-2" /> Generate Question Paper
          </Button>
        </div>
      </div>
    );
  }

  // ── QUESTIONS ─────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="text-blue-400 size-7" />
          <h1 className="text-3xl font-bold text-white">Aptitude Round</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/40 text-sm">{questions.length} Questions · {duration} min</span>
          <Button onClick={handleSave} disabled={loading} className="h-10 font-bold rounded-xl bg-blue-500 hover:bg-blue-600">
            {loading ? <><Loader2 size={16} className="animate-spin mr-2" />Saving...</> : <><Save size={16} className="mr-2" />Save Paper</>}
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        {questions.map((q, idx) => (
          <div key={idx} className="glass-card p-6 border-white/5 hover:border-blue-400/20 transition-all">
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">Question {idx + 1}</p>
            <textarea
              rows={2} value={q.question}
              onChange={(e) => updateQuestion(idx, "question", e.target.value)}
              placeholder={`Enter question ${idx + 1} here...`}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-blue-400/50 transition-all resize-none mb-4"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {(["A", "B", "C", "D"] as const).map((opt) => (
                <div key={opt} className="flex items-center gap-2">
                  <span className="size-7 rounded-lg bg-blue-400/10 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">{opt}</span>
                  <input
                    type="text" value={q[`option${opt}` as keyof Question] as string}
                    onChange={(e) => updateQuestion(idx, `option${opt}` as keyof Question, e.target.value)}
                    placeholder={`Option ${opt}`}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-blue-400/40 transition-all"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-sm">Correct Answer:</span>
              {OPTIONS.map((opt) => (
                <button key={opt} type="button"
                  onClick={() => updateQuestion(idx, "correctAnswer", opt)}
                  className={`size-8 rounded-lg text-sm font-bold transition-all ${q.correctAnswer === opt ? "bg-green-500 text-white" : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Button onClick={handleSave} disabled={loading} className="h-14 text-lg font-bold rounded-2xl bg-blue-500 hover:bg-blue-600 sticky bottom-6">
        {loading
          ? <><Loader2 size={18} className="animate-spin mr-2" />Saving Exam Paper...</>
          : <><Save size={18} className="mr-2" />Save Exam Paper ({questions.length} Questions · {duration} min)</>
        }
      </Button>
    </div>
  );
}
