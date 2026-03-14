"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Code2, Clock, CheckCircle, AlertTriangle, Loader2, Play, Target, ShieldAlert, Brain, ChevronRight, FileCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getTechnicalExamByCollege,
  getActiveTechSession,
  applyForTechExam,
  getTechStudentApplication,
  submitTechnicalExam,
  type TechQuestion
} from "@/lib/actions/technical.action";
import CodeEditor from "@/components/CodeEditor";

interface StudentSession {
  firestoreId: string; studentId: string; name: string;
  year: string; branch: string; collegeId: string; collegeName: string;
}
interface TechExam { id: string; duration: number; languagesAllowed: string[]; questions: TechQuestion[]; }

export default function StudentTechnicalPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [exam, setExam] = useState<TechExam | null>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);

  const [codes, setCodes] = useState<Record<number, { language: string; code: string }>>({});
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [status, setStatus] = useState<"loading" | "no-session" | "apply" | "exam" | "submitting" | "result">("loading");
  const [result, setResult] = useState<any>(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalDurationRef = useRef<number>(0);
  const timeLeftRef = useRef<number>(0);
  const statusRef = useRef<string>("loading");

  useEffect(() => {
    const raw = localStorage.getItem("studentSession");
    if (!raw) { router.replace("/student/login"); return; }
    const session: StudentSession = JSON.parse(raw);
    setStudent(session);

    (async () => {
      const [fetchedExam, sessionData] = await Promise.all([
        getTechnicalExamByCollege(session.collegeId),
        getActiveTechSession(session.collegeId),
      ]);

      setExam(fetchedExam ?? null);
      setActiveSession(sessionData);

      if (!sessionData) {
        statusRef.current = "no-session";
        setStatus("no-session");
        return;
      }

      const existingApp = await getTechStudentApplication(session.studentId, sessionData.id);
      setApplication(existingApp);

      if (existingApp && fetchedExam) {
        const totalSecs = fetchedExam.duration * 60;
        setTimeLeft(totalSecs);
        timeLeftRef.current = totalSecs;
        totalDurationRef.current = totalSecs;
        
        // initialize codes obj
        const initCodes: any = {};
        fetchedExam.questions.forEach((_: any, i: number) => {
          initCodes[i] = { language: fetchedExam.languagesAllowed[0] || "javascript", code: "" };
        });
        setCodes(initCodes);

        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        statusRef.current = "exam";
        setStatus("exam");
      } else {
        statusRef.current = "apply";
        setStatus("apply");
      }
    })();
  }, [router]);

  useEffect(() => { statusRef.current = status; }, [status]);

  const handleApply = async () => {
    if (!student || !activeSession || !exam) return;
    setApplyLoading(true);
    const res = await applyForTechExam({
      studentId: student.studentId,
      studentFirestoreId: student.firestoreId,
      sessionId: activeSession.id,
      collegeId: student.collegeId,
    });
    setApplyLoading(false);

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    toast.success("Applied! Starting exact coding environment...");
    const totalSecs = exam.duration * 60;
    setTimeLeft(totalSecs);
    timeLeftRef.current = totalSecs;
    totalDurationRef.current = totalSecs;
    
    const initCodes: any = {};
    exam.questions.forEach((_, i) => {
      initCodes[i] = { language: exam.languagesAllowed[0] || "javascript", code: "" };
    });
    setCodes(initCodes);

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    statusRef.current = "exam";
    setStatus("exam");
  };

  const doSubmit = useCallback(async (isAuto: boolean) => {
    if (!exam || !student || !activeSession) return;
    if (statusRef.current === "submitting" || statusRef.current === "result") return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    setStatus("submitting");
    setAutoSubmitted(isAuto);

    const totalTimeUsed = totalDurationRef.current - timeLeftRef.current;
    
    const res = await submitTechnicalExam({
      examId: exam.id,
      sessionId: activeSession.id,
      studentId: student.studentId,
      collegeId: student.collegeId,
      studentFirestoreId: student.firestoreId,
      studentName: student.name,
      studentYear: student.year,
      studentBranch: student.branch,
      totalTimeUsed,
      autoSubmitted: isAuto,
      codes,
      questions: exam.questions,
    });

    if (res.success) {
      setResult({ score: res.score, percentage: res.percentage, aiFeedback: res.aiFeedback });
      setStatus("result");
    } else {
      toast.error("Submission failed. Try again.");
      setStatus("exam");
    }
  }, [exam, student, activeSession, codes]);

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

  const updateCode = (val: string | undefined) => {
    setCodes(prev => ({
      ...prev,
      [activeQuestionIdx]: { ...prev[activeQuestionIdx], code: val || "" }
    }));
  };

  const updateLanguage = (lang: string) => {
    setCodes(prev => ({
      ...prev,
      [activeQuestionIdx]: { ...prev[activeQuestionIdx], language: lang }
    }));
  };

  const formatTime = (secs: number) =>
    `${Math.floor(secs / 60).toString().padStart(2, "0")}:${(secs % 60).toString().padStart(2, "0")}`;

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center pattern">
        <Loader2 className="text-purple-400 size-10 animate-spin" />
      </div>
    );
  }

  if (status === "no-session") {
    return (
      <div className="min-h-screen flex items-center justify-center pattern px-4">
        <div className="card-border max-w-md w-full">
          <div className="card flex flex-col items-center gap-4 py-12 px-10 text-center">
            <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <Code2 className="text-white/20 size-8" />
            </div>
            <h2 className="text-xl font-bold text-white">No Technical Exam Active</h2>
            <p className="text-white/50">Your college has not started a technical exam session.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "apply" && activeSession && exam) {
    return (
      <div className="min-h-screen flex items-center justify-center pattern px-4">
        <div className="max-w-lg w-full flex flex-col gap-6">
          <div className="glass-card p-8 border-purple-400/30 flex flex-col items-center gap-5 text-center">
            <div className="relative">
              <div className="size-20 rounded-3xl bg-purple-400/10 flex items-center justify-center">
                <Code2 className="text-purple-400 size-10" />
              </div>
              <span className="absolute -top-1 -right-1 size-5 rounded-full bg-green-400 animate-pulse border-2 border-[#09090b]" />
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/30 inline-block">
              🟢 Live Exam Session
            </span>
            <h1 className="text-2xl font-black text-white mt-1">{activeSession.sessionName}</h1>
            <p className="text-white/50 text-sm">{student?.collegeName}</p>

            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="glass-card px-5 py-4 border-white/5">
                <p className="text-2xl font-black text-purple-400">{exam.questions.length}</p>
                <p className="text-white/40 text-xs mt-1">Problems</p>
              </div>
              <div className="glass-card px-5 py-4 border-white/5">
                <p className="text-2xl font-black text-blue-400">{exam.duration}</p>
                <p className="text-white/40 text-xs mt-1">Minutes</p>
              </div>
            </div>

            <Button onClick={handleApply} disabled={applyLoading} className="w-full h-13 text-base font-bold rounded-xl bg-purple-500 hover:bg-purple-600">
              {applyLoading ? <><Loader2 size={18} className="animate-spin mr-2"/>Applying...</> : <><Play size={18} fill="currentColor" className="mr-2" /> Start Coding Exam</>}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "submitting") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center pattern bg-[#050505]">
        <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
          <div className="size-20 rounded-3xl bg-purple-400/10 flex items-center justify-center">
            <Brain className="text-purple-400 size-10 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white">Evaluating Code...</h2>
          <p className="text-white/50">Gemini AI is analyzing your code, checking edge cases, and calculating complexity.</p>
        </div>
      </div>
    );
  }

  if (status === "result" && result) {
    let parsedFeedback;
    try { parsedFeedback = JSON.parse(result.aiFeedback); } catch {}
    
    return (
      <div className="min-h-screen pattern pb-20 px-4 pt-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <div className="glass-card p-8 flex flex-col sm:flex-row items-center gap-6 border border-purple-500/30">
            <div className={`size-16 rounded-2xl flex items-center justify-center shrink-0 bg-purple-500/20`}>
              <Code2 className="text-purple-400 size-8" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-black text-white">Technical Score: {result.score}/100</h1>
              <p className="text-white/50 text-sm mt-1">{student?.name} · {student?.collegeName}</p>
            </div>
          </div>

          {parsedFeedback ? (
            <>
              <div className="glass-card p-6 border-white/5">
                <h2 className="text-lg font-bold text-white mb-2">Overall Feedback</h2>
                <p className="text-white/70 text-sm">{parsedFeedback.overallSummary}</p>
              </div>

              <div className="flex flex-col gap-4">
                {parsedFeedback.questionAnalysis?.map((qa: any, i: number) => (
                  <div key={i} className="glass-card p-5 border border-white/10">
                    <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Q{qa.questionNumber}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${qa.isCorrect ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                          {qa.isCorrect ? "Pass" : "Requires Improvement"}
                        </span>
                      </div>
                      <span className="text-white font-bold">{qa.score}/10</span>
                    </div>
                    <p className="text-white/80 text-sm mb-3">{qa.feedback}</p>
                    <div className="flex gap-4 mb-2">
                      <span className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded">Time: <strong className="text-blue-400">{qa.timeComplexity}</strong></span>
                      <span className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded">Space: <strong className="text-purple-400">{qa.spaceComplexity}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="glass-card p-6"><pre className="text-white/70 text-sm">{result.aiFeedback}</pre></div>
          )}
        </div>
      </div>
    );
  }

  if (status !== "exam" || !exam) return null;

  const currentQ = exam.questions[activeQuestionIdx];
  const langOpts = exam.languagesAllowed.length > 0 ? exam.languagesAllowed : ["python", "javascript", "java", "cpp", "c", "html"];
  const currentLang = codes[activeQuestionIdx]?.language || langOpts[0];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050505]">
      {/* HEADER */}
      <div className="h-14 bg-[#09090b] border-b border-white/10 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Code2 className="text-purple-400 size-5" />
          <span className="text-white font-bold text-sm">{activeSession?.sessionName}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className={`font-mono text-lg font-bold ${timeLeft > 120 ? "text-green-400" : "text-red-400 animate-pulse"}`}>
            {formatTime(timeLeft)}
          </span>
          <Button onClick={() => doSubmit(false)} className="h-8 bg-red-500 hover:bg-red-600 text-xs font-bold">
            Submit Exam
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANE: QUESTIONS OVERVIEW & CURRENT Q DESCRIPTION */}
        <div className="w-1/3 border-r border-white/10 bg-[#09090b] flex flex-col min-w-[300px]">
          {/* Question Nav */}
          <div className="flex overflow-x-auto p-2 gap-2 border-b border-white/10 shrink-0 custom-scrollbar">
            {exam.questions.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setActiveQuestionIdx(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${activeQuestionIdx === i ? "bg-purple-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
              >
                Q{i + 1}
              </button>
            ))}
          </div>

          {/* Question Details */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-sm">
            <h2 className="text-white font-bold text-xl mb-4">{currentQ.title}</h2>
            <div className="text-white/70 leading-relaxed whitespace-pre-wrap mb-6">{currentQ.description}</div>
            
            <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold mb-2">Example Input</p>
            <pre className="bg-white/5 border border-white/10 rounded-lg p-3 text-white/80 font-mono text-xs whitespace-pre-wrap mb-4">
              {currentQ.exampleInput || "None"}
            </pre>

            <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold mb-2">Example Output</p>
            <pre className="bg-white/5 border border-white/10 rounded-lg p-3 text-white/80 font-mono text-xs whitespace-pre-wrap mb-6">
              {currentQ.exampleOutput || "None"}
            </pre>

            {currentQ.constraints && (
              <>
                <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold mb-2">Constraints</p>
                <div className="bg-purple-500/5 text-purple-200/80 border border-purple-500/10 rounded-lg p-3 text-xs leading-relaxed">
                  {currentQ.constraints}
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT PANE: EDITOR & TERMINAL */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-12 bg-white/5 border-b border-white/10 flex items-center px-4 justify-between shrink-0">
            <div className="flex items-center gap-2">
              <FileCode className="text-white/40 size-4" />
              <span className="text-white/60 text-xs font-medium">Coding Interface</span>
            </div>
            <select 
              value={currentLang}
              onChange={(e) => updateLanguage(e.target.value)}
              className="bg-[#09090b] border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-purple-400"
            >
              {langOpts.map(l => (
                <option key={l} value={l}>{l.toUpperCase()}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 w-full min-h-0">
            <CodeEditor 
              language={currentLang}
              code={codes[activeQuestionIdx]?.code ?? ""}
              onChange={updateCode}
              onRunMode={true}
              containerClassName="border-0 rounded-none h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
