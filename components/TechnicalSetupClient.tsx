"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Code2, Plus, Save, Loader2, CheckCircle,
  Play, Square, Trophy, Clock, Users,
  CheckCircle2, XCircle, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  saveTechnicalExam,
  startTechSession,
  endTechSession,
  type TechQuestion,
} from "@/lib/actions/technical.action";
// Option to import ExamSessionPDFButton from Aptitude, or build one specifically for Technical later
import ExamSessionPDFButton from "./ExamSessionPDFButton";

interface SessionDoc {
  id: string;
  sessionName: string;
  status: "active" | "ended";
  startedAt: string;
  endedAt?: string;
}

interface TechnicalSetupClientProps {
  collegeId: string;
  collegeName: string;
  existingExam?: any;
  activeSession?: SessionDoc | null;
  allSessions?: SessionDoc[];
  submissionsBySession?: Record<string, any[]>;
}

export default function TechnicalSetupClient({
  collegeId,
  collegeName,
  existingExam,
  activeSession: initialActiveSession,
  allSessions: initialAllSessions = [],
  submissionsBySession = {},
}: TechnicalSetupClientProps) {
  const [step, setStep] = useState<"config" | "questions" | "done">(
    existingExam ? "done" : "config"
  );
  const [numQuestions, setNumQuestions] = useState<number>(3);
  const [duration, setDuration] = useState<number>(60);
  const [questions, setQuestions] = useState<TechQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(!!existingExam);
  
  const [activeSession, setActiveSession] = useState<SessionDoc | null>(initialActiveSession ?? null);
  const [allSessions, setAllSessions] = useState<SessionDoc[]>(initialAllSessions);
  const [sessionLoading, setSessionLoading] = useState(false);

  const handleConfig = () => {
    if (numQuestions < 1 || numQuestions > 10) {
      toast.error("Questions must be between 1 and 10.");
      return;
    }
    if (duration < 5 || duration > 300) {
      toast.error("Duration must be between 5 and 300 minutes.");
      return;
    }
    const blank: TechQuestion[] = Array.from({ length: numQuestions }, () => ({
      title: "",
      description: "",
      exampleInput: "",
      exampleOutput: "",
      constraints: "",
    }));
    setQuestions(blank);
    setStep("questions");
  };

  const updateQuestion = (idx: number, field: keyof TechQuestion, value: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.title.trim() || !q.description.trim()) {
        toast.error(`Please provide a title and description for Question ${i + 1}.`);
        return;
      }
    }
    setLoading(true);
    const languagesAllowed = ["python", "javascript", "java", "cpp", "c", "html"];
    const result = await saveTechnicalExam({ 
      collegeId, collegeName, duration, questions, languagesAllowed 
    });
    setLoading(false);
    if (!result.success) { toast.error(result.message); return; }
    toast.success("Coding Exam saved! You can now start an exam session.");
    setSaved(true);
    setStep("done");
  };

  const handleStartExam = async () => {
    if (!existingExam?.id) { toast.error("Save a technical exam first."); return; }
    setSessionLoading(true);
    const result = await startTechSession({
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
    const result = await endTechSession(activeSession.id);
    setSessionLoading(false);
    if (!result.success) { toast.error(result.message); return; }
    const ended = { ...activeSession, status: "ended" as const, endedAt: new Date().toISOString() };
    setActiveSession(null);
    setAllSessions((prev) => prev.map((s) => s.id === ended.id ? ended : s));
    toast.success(`${activeSession.sessionName} ended. Results are saved.`);
  };

  // ── DONE ─────────────────────────────────────────────────
  if (step === "done") {
    const exam = existingExam;
    const qCount = saved ? questions.length : exam?.questions?.length ?? 0;
    const dur = saved ? duration : exam?.duration ?? 0;

    return (
      <div className="flex flex-col gap-8 pb-4">
        <div className="flex items-center gap-3">
          <Code2 className="text-purple-400 size-7" />
          <h1 className="text-3xl font-bold text-white">Technical Round</h1>
        </div>

        <div className="glass-card p-8 border-purple-400/20 flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="text-green-400 size-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {saved ? "Technical Exam Saved!" : "Technical Exam Ready"}
                </h2>
                <p className="text-white/40 text-sm">{qCount} Coding Problems · {dur} Minutes</p>
              </div>
            </div>
            <Button
              onClick={() => { setSaved(false); setStep("config"); }}
              variant="outline"
              size="sm"
              className="border-white/10 hover:bg-white/5 text-white/60 text-sm"
            >
              <Plus size={14} className="mr-1.5" /> New Exam
            </Button>
          </div>

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
                  {sessionLoading ? <Loader2 size={16} className="animate-spin" /> : <Square size={16} fill="currentColor" />}
                  End Exam
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4 flex-wrap bg-white/3 border border-white/10 rounded-2xl px-6 py-5">
                <div>
                  <p className="text-white/50 font-medium">No active tech exam session</p>
                  <p className="text-white/30 text-sm mt-0.5">Start a session so students can see and apply.</p>
                </div>
                <Button
                  onClick={handleStartExam}
                  disabled={sessionLoading}
                  className="bg-green-600 hover:bg-green-700 font-bold rounded-xl gap-2"
                >
                  {sessionLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                  Start Exam
                </Button>
              </div>
            )}
          </div>
        </div>

        {allSessions.length > 0 && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <Trophy className="text-yellow-400 size-5" />
              <h2 className="text-xl font-bold text-white">Tech Exam Sessions & Results</h2>
            </div>
            <div className="flex flex-col gap-3">
              {allSessions.map((session) => {
                const subs = submissionsBySession[session.id] ?? [];
                const avg = subs.length > 0
                  ? Math.round(subs.reduce((s: number, r: any) => s + (r.percentage ?? 0), 0) / subs.length)
                  : null;
                const isActive = session.status === "active";
                return (
                  <div key={session.id} className={`glass-card px-6 py-5 border flex items-center justify-between flex-wrap gap-4 ${isActive ? "border-green-500/30" : "border-white/5"}`}>
                    <div className="flex items-center gap-4">
                      <div className={`size-10 rounded-xl flex items-center justify-center ${isActive ? "bg-green-500/10" : "bg-white/5"}`}>
                        {isActive ? <Play className="text-green-400 size-5" fill="currentColor" /> : <CheckCircle2 className="text-white/30 size-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-bold">{session.sessionName}</p>
                          {isActive && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/30">Live</span>}
                        </div>
                        <p className="text-white/30 text-xs mt-0.5 flex items-center gap-2"><Users size={10} /> {subs.length} student{subs.length !== 1 ? "s" : ""} {avg !== null && <><span>·</span><span>Avg {avg}/100</span></>}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {subs.length > 0 && <ExamSessionPDFButton sessionName={session.sessionName} submissions={subs} collegeName={collegeName} />}
                      {subs.length === 0 && !isActive && <span className="text-white/30 text-sm">No submissions yet</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* In-place leaderboard code for quick look (same design mapped for Tech) */}
            {(() => {
              const targetSession = activeSession ?? allSessions.find(s => s.status === "ended");
              if (!targetSession) return null;
              const subs = submissionsBySession[targetSession.id] ?? [];
              if (subs.length === 0) return null;
              return (
                <div className="flex flex-col gap-3 mt-2">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{targetSession.sessionName} — Leaderboard</p>
                  <div className="glass-card border-white/5 overflow-hidden">
                    <div className="grid grid-cols-[40px_1fr_120px_80px_100px_120px] gap-0 px-5 py-3 border-b border-white/5 text-white/40 text-xs font-bold uppercase tracking-widest">
                      <span>#</span><span>Student</span><span>Branch</span>
                      <span>Year</span><span>Score</span><span>Time</span>
                    </div>
                    {subs.slice(0, 20).map((sub: any, idx: number) => {
                      const mins = Math.floor((sub.totalTimeUsed ?? 0) / 60);
                      const secs = (sub.totalTimeUsed ?? 0) % 60;
                      return (
                        <div key={sub.id} className={`grid grid-cols-[40px_1fr_120px_80px_100px_120px] gap-0 px-5 py-4 border-b border-white/5 last:border-b-0 hover:bg-white/3 items-center ${idx === 0 ? "bg-yellow-400/3" : ""}`}>
                          <span className={`text-sm font-bold ${idx === 0 ? "text-yellow-400" : idx === 1 ? "text-white/50" : idx === 2 ? "text-amber-600" : "text-white/30"}`}>
                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}
                          </span>
                          <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-full bg-purple-400/20 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">
                              {(sub.studentName || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium leading-none">{sub.studentName || "—"}</p>
                              <p className="text-white/30 text-xs mt-0.5 font-mono">{sub.studentId}</p>
                            </div>
                          </div>
                          <span className="text-white/50 text-xs truncate">{sub.studentBranch || "—"}</span>
                          <span className="text-white/50 text-xs">Year {sub.studentYear || "—"}</span>
                          <span className="text-white font-bold text-sm text-green-400">{sub.score ?? 0}/100</span>
                          <span className="text-white/40 text-xs flex items-center gap-1"><Clock size={11} />{mins}m {secs}s</span>
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
          <Code2 className="text-purple-400 size-7" />
          <h1 className="text-3xl font-bold text-white">Technical Round Setup</h1>
        </div>
        <div className="max-w-xl glass-card p-8 border-purple-400/20 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-white">Configure Tech Exam</h2>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/70">Number of Coding Problems</label>
            <input
              type="number" min={1} max={10} value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-purple-400/50 transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/70">Exam Duration (minutes)</label>
            <input
              type="number" min={5} max={300} value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-purple-400/50 transition-all"
            />
          </div>
          <Button onClick={handleConfig} className="h-12 text-base font-bold rounded-xl bg-purple-500 hover:bg-purple-600">
            <Plus size={18} className="mr-2" /> Start Adding Problems
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
          <Code2 className="text-purple-400 size-7" />
          <h1 className="text-3xl font-bold text-white">Technical Coding Problems</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/40 text-sm">{questions.length} Problems · {duration} min</span>
          <Button onClick={handleSave} disabled={loading} className="h-10 font-bold rounded-xl bg-purple-500 hover:bg-purple-600">
            {loading ? <><Loader2 size={16} className="animate-spin mr-2" />Saving...</> : <><Save size={16} className="mr-2" />Save Exam</>}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {questions.map((q, idx) => (
          <div key={idx} className="glass-card p-6 border-white/5 hover:border-purple-400/20 transition-all flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Problem {idx + 1}</p>
            </div>
            
            <input
              type="text" value={q.title} onChange={(e) => updateQuestion(idx, "title", e.target.value)}
              placeholder="Problem Title (e.g. valid Palindrome)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-purple-400/50"
            />

            <textarea
              rows={4} value={q.description} onChange={(e) => updateQuestion(idx, "description", e.target.value)}
              placeholder="Clear description of the problem..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-purple-400/50 resize-none"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <textarea
                rows={2} value={q.exampleInput} onChange={(e) => updateQuestion(idx, "exampleInput", e.target.value)}
                placeholder="Example Input..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder:text-white/25 focus:outline-none focus:border-purple-400/50 resize-none block"
              />
              <textarea
                rows={2} value={q.exampleOutput} onChange={(e) => updateQuestion(idx, "exampleOutput", e.target.value)}
                placeholder="Example Output..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder:text-white/25 focus:outline-none focus:border-purple-400/50 resize-none block"
              />
            </div>
            <input
              type="text" value={q.constraints} onChange={(e) => updateQuestion(idx, "constraints", e.target.value)}
              placeholder="Constraints (optional)..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-400/50"
            />
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={loading} className="h-14 text-lg font-bold rounded-2xl bg-purple-500 hover:bg-purple-600 sticky bottom-6 shadow-xl">
        {loading
          ? <><Loader2 size={18} className="animate-spin mr-2" />Saving Exam...</>
          : <><Save size={18} className="mr-2" />Save Tech Exam ({questions.length} Problems)</>
        }
      </Button>
    </div>
  );
}
