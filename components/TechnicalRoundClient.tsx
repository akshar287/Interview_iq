"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Code2, Brain, Play, Loader2, Clock, 
  Terminal as TerminalIcon, ShieldAlert, 
  CheckCircle, ArrowRight, BookOpen, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateTechnicalProblem, evaluateTechnicalSubmission, savePracticeTechnicalResult } from "@/lib/actions/technical.action";
import CodeEditor from "@/components/CodeEditor";
import { toast } from "sonner";
import { BarChart3, TrendingUp, Target, CalendarDays, BookOpen as BookOpenIcon, CheckCircle2 as CheckCircle2Icon } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { deductTokens } from "@/lib/actions/billing.action";
import { useRouter } from "next/navigation";

interface Problem {
  title: string;
  description: string;
  exampleInput: string;
  exampleOutput: string;
  constraints: string;
  baseCode: string;
  testCases: { input: string; expectedOutput: string }[];
  solution: string;
}

export default function TechnicalRoundClient() {
  const router = useRouter();
  const [step, setStep] = useState<"difficulty" | "generating" | "coding" | "result">("difficulty");
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Difficult' | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [showSolution, setShowSolution] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startExam = async (diff: 'Easy' | 'Medium' | 'Difficult') => {
    setDifficulty(diff);
    const user = await getCurrentUser();
    if (!user) {
      toast.error("Please sign in to start the exam.");
      router.push("/sign-in");
      return;
    }

    // Token gating
    const collection = user.type === "student" ? "students" : "users";
    const tokenResult = await deductTokens(user.id, 50, `Technical Practice Round (${diff})`, collection);
    if (!tokenResult.success) {
      toast.error("Insufficient tokens. Please upgrade your plan.");
      router.push("/pricing");
      return;
    }
    
    setStep("generating");
    
    const res = await generateTechnicalProblem(diff);
    if (res.success && res.problem) {
      setProblem(res.problem);
      setCode(res.problem.baseCode || "");
      // Set time based on difficulty
      const mins = diff === "Easy" ? 20 : diff === "Medium" ? 40 : 60;
      setTimeLeft(mins * 60);
      setStep("coding");
    } else {
      toast.error("Failed to generate problem. Please try again.");
      setStep("difficulty");
    }
  };

  const formatTime = (secs: number) =>
    `${Math.floor(secs / 60).toString().padStart(2, "0")}:${(secs % 60).toString().padStart(2, "0")}`;

  const handleSubmit = useCallback(async (isAuto = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!problem || !code) return;

    setStep("result");
    setIsRunning(true); // repurposed as evaluation loading
    
    toast.info(isAuto ? "Time up! Analyzing submission..." : "Analyzing your solution...");
    
    const res = await evaluateTechnicalSubmission({
      problem,
      code,
      language: "python", // Default for now
    });
    
    setIsRunning(false);

    if (res.success && res.evaluation) {
      setEvaluation(res.evaluation);

      // Save practice technical result
      const timeLimit = difficulty === "Easy" ? 20 * 60 : difficulty === "Medium" ? 40 * 60 : 60 * 60;
      const totalTimeUsed = timeLimit - timeLeft;

      getCurrentUser().then(user => {
        if (user && user.type === "student") {
          savePracticeTechnicalResult({
            studentFirestoreId: user.id,
            problem,
            code,
            language: "python",
            totalTimeUsed,
            evaluation: res.evaluation
          }).catch(console.error);
        }
      }).catch(console.error);
    } else {
      toast.error("Failed to analyze submission: " + (res.message || "Unknown error"));
      // Still show some default or error state
      setEvaluation({
         score: 0,
         feedback: "Evaluation failed. Please review your code manually.",
         overallSummary: "We encountered an error while analyzing your code.",
         timeComplexity: "N/A",
         spaceComplexity: "N/A",
         isCorrect: false,
         strengths: [],
         weakAreas: [],
         improvementTips: []
      });
    }
  }, [problem, code, difficulty, timeLeft]);

  useEffect(() => {
    if (step === "coding" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step, timeLeft, handleSubmit]);

  if (step === "difficulty") {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-4">
              <Zap size={12} className="fill-purple-400" />
              AI Technical Assessment
            </div>
            <h1 className="text-4xl font-black text-white mb-4">Choose Your Difficulty</h1>
            <p className="text-white/50">Select a level to generate a custom technical problem for your interview practice.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(["Easy", "Medium", "Difficult"] as const).map((level) => (
              <button
                key={level}
                onClick={() => startExam(level)}
                className="glass-card group p-8 border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all flex flex-col items-center text-center gap-4"
              >
                <div className={`size-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  level === 'Easy' ? 'bg-green-500/10 text-green-400' :
                  level === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  <Brain size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{level}</h3>
                  <p className="text-white/40 text-xs">
                    {level === 'Easy' ? '20 Minutes' : level === 'Medium' ? '40 Minutes' : '60 Minutes'}
                  </p>
                </div>
                <ArrowRight className="text-white/20 group-hover:text-purple-400 transition-colors" size={20} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === "generating") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6">
        <div className="relative">
          <div className="size-20 rounded-3xl bg-purple-500/10 flex items-center justify-center">
            <Brain className="text-purple-500 size-10 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 size-8 rounded-full bg-[#050505] flex items-center justify-center border border-white/10">
            <Loader2 className="text-purple-400 size-4 animate-spin" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Generating Technical Problem...</h2>
          <p className="text-white/50">Our AI is crafting a unique challenge based on your selection.</p>
        </div>
      </div>
    );
  }

  if (step === "coding" && problem) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col">
        {/* HEADER */}
        <div className="h-16 bg-[#09090b] border-b border-white/10 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Code2 className="text-purple-400 size-4" />
            </div>
            <span className="text-white font-bold tracking-tight">Tech Exam 1</span>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <Clock className={`size-5 ${timeLeft < 120 ? "text-red-400 animate-pulse" : "text-green-400"}`} />
              <span className={`text-2xl font-black font-mono tracking-wider ${timeLeft < 120 ? "text-red-400" : "text-green-400"}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <Button 
              onClick={() => handleSubmit(false)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-xl"
            >
              Submit Exam
            </Button>
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="flex-1 flex overflow-hidden">
          {/* PROBLEM DESCRIPTION (Left) */}
          <div className="w-[30%] border-r border-white/10 bg-[#09090b] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/3 flex items-center gap-2">
              <BookOpen size={14} className="text-purple-400" />
              <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Problem Statement</span>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase mb-4">
                Q1
              </div>
              <h1 className="text-3xl font-black text-white mb-6 leading-tight">{problem.title}</h1>
              
              <div className="text-white/70 leading-relaxed text-sm whitespace-pre-wrap mb-8">
                {problem.description}
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-white/40 uppercase tracking-[0.2em] text-[10px] font-black mb-3">Example Input</p>
                  <pre className="bg-white/5 border border-white/10 rounded-xl p-4 text-white/80 font-mono text-xs whitespace-pre-wrap">
                    {problem.exampleInput}
                  </pre>
                </div>

                <div>
                  <p className="text-white/40 uppercase tracking-[0.2em] text-[10px] font-black mb-3">Example Output</p>
                  <pre className="bg-white/5 border border-white/10 rounded-xl p-4 text-white/80 font-mono text-xs whitespace-pre-wrap">
                    {problem.exampleOutput}
                  </pre>
                </div>

                {problem.constraints && (
                  <div>
                    <p className="text-white/40 uppercase tracking-[0.2em] text-[10px] font-black mb-3">Constraints</p>
                    <div className="bg-orange-500/5 text-orange-200/70 border border-orange-500/10 rounded-xl p-4 text-xs italic">
                      {problem.constraints}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* ALERT FOOTER */}
            <div className="p-4 bg-red-500/5 border-t border-red-500/10">
               <div className="flex items-center gap-2 text-red-400">
                  <ShieldAlert size={14} />
                  <span className="text-xs font-bold uppercase tracking-tight">1 Issue Detected</span>
               </div>
            </div>
          </div>

          {/* EDITOR & TERMINAL (Right / Center) */}
          <div className="flex-1">
             <CodeEditor 
                language="python"
                code={code}
                onChange={(val) => setCode(val || "")}
                onRunMode={true}
                containerClassName="border-0 rounded-none"
             />
          </div>
        </div>
      </div>
    );
  }

  if (step === "result") {
    if (isRunning) { // Evaluation loading
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pattern bg-[#050505]">
          <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
            <div className="relative">
              <div className="size-20 rounded-3xl bg-purple-500/10 flex items-center justify-center">
                <Brain className="text-purple-500 size-10" />
              </div>
              <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-[#09090b] flex items-center justify-center border border-white/10">
                <Loader2 className="text-purple-400 size-4 animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Generating Your Analysis</h2>
            <p className="text-white/50 text-sm">Gemini AI is analyzing your code, checking complexity, and preparing personalized feedback...</p>
            <div className="flex gap-2">
              {["Quality", "Complexity", "Best Practices"].map((step, i) => (
                <span key={i} className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">{step}</span>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (!evaluation) return null;

    return (
      <div className="min-h-screen pattern pb-20 px-4 pt-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {/* Summary Header */}
          <div className={`glass-card p-8 flex flex-col sm:flex-row items-start gap-6 border ${evaluation.isCorrect ? "border-green-500/30" : "border-red-500/30"}`}>
            <div className={`size-16 rounded-2xl flex items-center justify-center shrink-0 ${evaluation.isCorrect ? "bg-green-500/10" : "bg-red-500/10"}`}>
              {evaluation.isCorrect ? <CheckCircle className="text-green-400 size-8" /> : <ShieldAlert className="text-red-400 size-8" />}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black text-white">{evaluation.isCorrect ? "Challenge Solved! 🎉" : "Assessment Results 📊"}</h1>
              <p className="text-white/50 text-sm mt-1">{evaluation.overallSummary}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
               <div className="text-xs font-bold uppercase tracking-widest text-white/30">Total Score</div>
               <div className={`text-5xl font-black ${evaluation.isCorrect ? "text-green-400" : "text-purple-400"}`}>{evaluation.score}</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Complexity", val: evaluation.timeComplexity, color: "text-blue-400", icon: <Clock size={14} />, border: "border-blue-500/20" },
              { label: "Space", val: evaluation.spaceComplexity, color: "text-purple-400", icon: <Zap size={14} />, border: "border-purple-500/20" },
              { label: "Correctness", val: evaluation.isCorrect ? "Passed" : "Failed", color: evaluation.isCorrect ? "text-green-400" : "text-red-400", icon: <CheckCircle size={14} />, border: evaluation.isCorrect ? "border-green-500/20" : "border-red-500/20" },
              { label: "Difficulty", val: difficulty, color: "text-yellow-400", icon: <Target size={14} />, border: "border-yellow-500/20" },
            ].map((s, i) => (
              <div key={i} className={`glass-card px-5 py-6 text-center shadow-lg ${s.border} bg-[#09090b]/40 backdrop-blur-xl`}>
                <div className={`flex items-center justify-center gap-2 ${s.color} mb-2 text-[10px] font-black uppercase tracking-[0.2em]`}>{s.icon}{s.label}</div>
                <p className={`text-xl font-bold ${s.color} truncate`}>{s.val}</p>
              </div>
            ))}
          </div>

          {evaluation.isCorrect === false && (
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
               <div className="size-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                  <Zap className="text-orange-400 size-5" />
               </div>
               <p className="text-orange-200/80 text-sm font-medium leading-relaxed">
                  Your solution didn't pass all tests. Don't worry, this is for practice! Toggle the <strong>Model Solution</strong> below to see the optimal approach.
               </p>
            </div>
          )}

          {/* Detail Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="glass-card p-8 border-white/5 bg-[#09090b]/60 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                   <Brain className="text-purple-400 size-5" />
                   <h2 className="text-lg font-bold text-white">Expert Feedback</h2>
                </div>
                <p className="text-white/70 leading-relaxed text-sm italic">
                   &quot;{evaluation.feedback}&quot;
                </p>
             </div>

             <div className="glass-card p-8 border-green-500/20 bg-green-500/5 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                   <CheckCircle className="text-green-400 size-5" />
                   <h2 className="text-lg font-bold text-white">Strengths</h2>
                </div>
                <ul className="space-y-3">
                   {evaluation.strengths.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                         <span className="size-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">✓</span>
                         {s}
                      </li>
                   ))}
                </ul>
             </div>

             <div className="glass-card p-8 border-red-500/20 bg-red-500/5 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                   <ShieldAlert className="text-red-400 size-5" />
                   <h2 className="text-lg font-bold text-white">Weak Areas</h2>
                </div>
                <ul className="space-y-3">
                   {evaluation.weakAreas.map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                         <span className="size-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">!</span>
                         {w}
                      </li>
                   ))}
                </ul>
             </div>

             <div className="glass-card p-8 border-blue-400/20 bg-blue-400/5 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                   <Zap className="text-blue-400 size-5" />
                   <h2 className="text-lg font-bold text-white">How to Improve</h2>
                </div>
                <ul className="space-y-3">
                   {evaluation.improvementTips.map((tip: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                         <span className="size-5 rounded-full bg-blue-400/20 text-blue-400 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">{i+1}</span>
                         {tip}
                      </li>
                   ))}
                </ul>
             </div>
          </div>

          {/* Model Solution Section */}
          <div className="glass-card overflow-hidden border-teal-500/20 bg-teal-500/5">
            <button 
              onClick={() => setShowSolution(!showSolution)}
              className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <Code2 className="text-teal-400 size-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">Model Solution</h3>
                  <p className="text-white/40 text-xs">Recommended optimal approach for this challenge</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-teal-400 text-sm font-bold">
                {showSolution ? "Hide Solution" : "View Solution"}
                <ArrowRight size={16} className={`transition-transform duration-300 ${showSolution ? "-rotate-90" : "rotate-90"}`} />
              </div>
            </button>
            
            {showSolution && (
              <div className="px-6 pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="bg-[#050505] rounded-xl border border-white/5 p-1">
                  <pre className="p-6 text-sm font-mono text-white/80 leading-relaxed overflow-x-auto custom-scrollbar">
                    {problem?.solution || "# Solution not available for this problem."}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center mt-4">
            <Button 
               onClick={() => setStep("difficulty")} 
               className="bg-white/5 text-white hover:bg-white/10 px-12 h-14 rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 border border-white/10"
            >
              <Zap size={18} className="text-yellow-400" />
              Try Another Challenge
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
