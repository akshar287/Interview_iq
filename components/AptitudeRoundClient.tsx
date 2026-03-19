"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  ClipboardList, Brain, Clock, Loader2, 
  CheckCircle, ShieldAlert, ArrowRight, 
  Zap, BookOpen, Target, Layout, ListChecks,
  TrendingUp, HelpCircle, XCircle, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateAptitudeExam, evaluateUserAptitude, savePracticeAptitudeResult, type Question } from "@/lib/actions/aptitude.action";
import { toast } from "sonner";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { deductTokens } from "@/lib/actions/billing.action";
import HowToUseSection from "./HowToUseSection";
import { useRouter } from "next/navigation";

type AptitudeStep = "setup" | "generating" | "exam" | "results";

export default function AptitudeRoundClient() {
  const router = useRouter();
  const [step, setStep] = useState<AptitudeStep>("setup");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Numerics", "Logical Reasoning", "Verbal"]);
  const [numQuestions, setNumQuestions] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [answerTimes, setAnswerTimes] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [totalTimeUsed, setTotalTimeUsed] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startExam = async () => {
    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category.");
      return;
    }
    
    // Reset session state
    setAnswers({});
    setAnswerTimes({});
    setActiveQuestionIdx(0);
    setTotalTimeUsed(0);
    setEvaluation(null);
    
    const user = await getCurrentUser();
    if (!user) {
      toast.error("Please sign in to start the exam.");
      router.push("/sign-in");
      return;
    }

    // Token gating
    const collection = user.type === "student" ? "students" : "users";
    const tokenResult = await deductTokens(user.id, 50, "Aptitude Practice Round", collection);
    if (!tokenResult.success) {
      toast.error("Insufficient tokens. Please upgrade your plan.");
      router.push("/pricing");
      return;
    }
    
    setStep("generating");
    const res = await generateAptitudeExam({ category: selectedCategories, numQuestions });
    
    if (res.success && res.questions) {
      setQuestions(res.questions);
      setTimeLeft(numQuestions * 60); // 1 minute per question
      setStep("exam");
      startTimeRef.current = Date.now();
    } else {
      // Refund tokens if generation fails? Optional but fair
      toast.error("Failed to generate exam: " + res.message);
      setStep("setup");
    }
  };

  const currentQuestionTimeRef = useRef<number>(Date.now());
  
  useEffect(() => {
    if (step === "exam" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            submitExam(true);
            return 0;
          }
          return prev - 1;
        });
        setTotalTimeUsed((prev) => prev + 1);
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step, timeLeft]);

  const handleAnswerChange = (idx: number, opt: string) => {
    const now = Date.now();
    const timeTaken = Math.round((now - currentQuestionTimeRef.current) / 1000);
    
    setAnswers(prev => ({ ...prev, [idx]: opt }));
    setAnswerTimes(prev => ({ ...prev, [idx]: (prev[idx] || 0) + timeTaken }));
    
    currentQuestionTimeRef.current = now;
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) 
        ? prev.filter(c => c !== cat) 
        : [...prev, cat]
    );
  };

  const submitExam = useCallback(async (isAuto = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStep("results");
    setIsEvaluating(true);
    
    toast.info(isAuto ? "Time's up! Evaluating your performance..." : "Submitting exam...");
    
    const res = await evaluateUserAptitude({
      questions,
      answers,
      answerTimes,
      totalTimeUsed
    });
    
    setIsEvaluating(false);
    if (res.success) {
      setEvaluation(res.evaluation);
      // We'll also store the score and percentage from the response
      setEvaluation((prev: any) => ({
        ...prev,
        score: res.score,
        percentage: res.percentage
      }));

      // Find current user safely and save result
      getCurrentUser().then(user => {
        if (user) {
          savePracticeAptitudeResult({
            studentFirestoreId: user.id,
            questions,
            answers,
            answerTimes,
            totalTimeUsed,
            score: res.score || 0,
            percentage: res.percentage || 0,
            aiFeedback: JSON.stringify(res.evaluation)
          }).catch(console.error);
        }
      }).catch(console.error);
    } else {
      toast.error("Evaluation failed. Please try again.");
    }
  }, [questions, answers, answerTimes, totalTimeUsed]);

  if (step === "setup") {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 w-full">
        <div className="max-w-6xl mx-auto w-full">
          <div className="bg-[#1a1c23] rounded-3xl overflow-hidden relative mb-12 border border-blue-500/10 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 w-full max-w-6xl mx-auto px-6">
              <div className="flex flex-col gap-6 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0">
                  <Brain size={12} className="fill-blue-400" />
                  AI Aptitude Module
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                  AI Enabled General <br />
                  <span className="text-blue-400">Aptitude Test</span>
                </h1>
                <p className="text-white/60 text-base md:text-lg">
                  Test your quantitative, logical, and verbal reasoning skills with our dynamic, AI-generated aptitude assessments.
                </p>
              </div>
              <div className="flex relative w-[240px] h-[200px] md:w-[280px] md:h-[220px] lg:w-[320px] lg:h-[260px] items-center justify-center">
                <div className="relative size-full flex items-center justify-center">
                  {/* Decorative background pulse */}
                  <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full animate-pulse" />
                  
                  {/* Styled Icon Container */}
                  <div className="relative size-32 md:size-40 lg:size-48 bg-gradient-to-br from-[#1a1c23] to-[#09090b] rounded-[32px] md:rounded-[40px] border border-blue-500/20 shadow-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
                    <Brain className="text-blue-400 size-16 md:size-20 lg:size-24 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                    
                    {/* Floating elements */}
                    <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 p-2 md:p-3 bg-[#1a1c23] border border-blue-500/20 rounded-xl md:rounded-2xl shadow-xl animate-bounce">
                      <Target className="text-blue-400 size-5 md:size-6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <div className="glass-card p-10 border-white/5 bg-[#09090b]/40 backdrop-blur-xl">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <label className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Practice Categories</label>
                     <button 
                        onClick={() => setSelectedCategories(["Numerics", "Verbal", "Logical Reasoning"])}
                        className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
                     >
                        Select All
                     </button>
                   </div>
                   <div className="grid grid-cols-1 gap-3">
                      {["Numerics", "Verbal", "Logical Reasoning"].map(cat => (
                         <button
                            key={cat}
                            onClick={() => toggleCategory(cat)}
                            className={`px-5 py-4 rounded-xl text-sm font-bold border transition-all flex items-center justify-between group ${
                               selectedCategories.includes(cat) 
                               ? "bg-blue-500/10 border-blue-500/50 text-white shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                               : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                            }`}
                         >
                            <span>{cat}</span>
                            <div className={`size-5 rounded-md border flex items-center justify-center transition-all ${
                               selectedCategories.includes(cat)
                               ? "bg-blue-500 border-blue-400"
                               : "bg-white/5 border-white/20 group-hover:border-white/40"
                            }`}>
                               {selectedCategories.includes(cat) && <CheckCircle className="text-white size-3" />}
                            </div>
                         </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Questions</label>
                   <div className="grid grid-cols-3 gap-2">
                      {[10, 20, 30].map(num => (
                         <button
                            key={num}
                            onClick={() => setNumQuestions(num)}
                            className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all ${
                               numQuestions === num 
                               ? "bg-blue-500 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
                               : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                            }`}
                         >
                            {num}
                         </button>
                      ))}
                   </div>
                </div>
             </div>

             <Button 
                onClick={startExam}
                className="w-full h-16 bg-blue-500 hover:bg-blue-600 text-white font-black text-lg rounded-2xl shadow-[0_10px_30px_rgba(59,130,246,0.4)] flex items-center gap-3 transition-transform active:scale-95"
             >
                <Zap className="fill-white" />
                Generate Aptitude Exam
             </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "generating") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6">
        <div className="relative">
          <div className="size-20 rounded-3xl bg-blue-500/10 flex items-center justify-center">
            <ClipboardList className="text-blue-500 size-10 animate-bounce" />
          </div>
          <div className="absolute -bottom-2 -right-2 size-8 rounded-full bg-[#050505] flex items-center justify-center border border-white/10">
            <Loader2 className="text-blue-400 size-4 animate-spin" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Architecting Your Exam...</h2>
          <p className="text-white/50">Gemini is curating unique {selectedCategories.join(", ")} questions for your practice.</p>
        </div>
      </div>
    );
  }

  if (step === "exam" && questions.length > 0) {
    const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

    return (
      <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col pt-10">
        <div className="max-w-5xl mx-auto w-full px-6 flex flex-col h-full pb-10">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-10">
             <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <ClipboardList className="text-blue-400 size-5" />
                </div>
                 <div>
                    <h3 className="text-white font-black leading-none uppercase tracking-widest text-xs">Practice Exam</h3>
                    <p className="text-white/40 text-[10px] mt-1 uppercase tracking-wider">{selectedCategories.join(" + ")} · {numQuestions} Questions</p>
                 </div>
             </div>

             <div className="glass-card px-6 py-2 border-blue-500/20 flex items-center gap-4">
                <Clock className={`size-5 ${timeLeft < 60 ? "text-red-400 animate-pulse" : "text-blue-400"}`} />
                <span className={`text-2xl font-black font-mono tracking-widest ${timeLeft < 60 ? "text-red-400" : "text-white"}`}>
                   {formatTime(timeLeft)}
                </span>
             </div>

             <Button 
                 onClick={() => submitExam()}
                 className="bg-red-500 hover:bg-red-600 text-white font-black px-8 h-12 rounded-xl shadow-[0_10px_20px_rgba(239,44,44,0.2)] transition-all active:scale-95"
              >
                 Submit Final Exam
              </Button>
          </div>

          <div className="flex-1 flex gap-8 overflow-hidden">
             {/* Sticky Progress Sidebar */}
             <div className="w-64 glass-card p-6 border-white/5 bg-[#09090b]/40 flex flex-col">
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Quick Navigation</p>
                <div className="grid grid-cols-4 gap-2 mb-8">
                   {questions.map((_, i) => (
                      <button
                         key={i}
                         onClick={() => {
                            const element = document.getElementById(`question-${i}`);
                            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            setActiveQuestionIdx(i);
                         }}
                         className={`size-10 rounded-lg text-xs font-bold transition-all border ${
                            activeQuestionIdx === i ? "bg-blue-500 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]" :
                            answers[i] ? "bg-green-500/20 border-green-500/30 text-green-400" :
                            "bg-white/5 border-white/10 text-white/30 hover:bg-white/10"
                         }`}
                      >
                         {i + 1}
                      </button>
                   ))}
                </div>
                
                <div className="mt-auto pt-6 border-t border-white/5">
                   <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
                      <span>Completion</span>
                      <span className="text-blue-400">{Math.round((Object.keys(answers).length / numQuestions) * 100)}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                         className="h-full bg-blue-500 transition-all duration-500" 
                         style={{ width: `${(Object.keys(answers).length / numQuestions) * 100}%` }}
                      />
                   </div>
                </div>
             </div>

             {/* Continuous Scrolling Question Area */}
             <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-8 pb-32">
                {questions.map((q, idx) => (
                   <div 
                      key={idx} 
                      id={`question-${idx}`}
                      className={`glass-card p-12 border-white/5 bg-[#09090b]/60 flex flex-col relative transition-all duration-500 ${
                         activeQuestionIdx === idx ? "ring-2 ring-blue-500/50" : ""
                      }`}
                      onMouseEnter={() => setActiveQuestionIdx(idx)}
                   >
                       <div className="absolute top-0 left-0 w-1 h-20 bg-blue-500" />
                       
                       <div className="flex-1">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 text-white/40 text-[10px] font-black uppercase mb-8">
                             Question {idx + 1} of {numQuestions}
                          </div>
                          <h2 className="text-2xl font-bold text-white leading-relaxed mb-12">
                             {q.question}
                          </h2>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {(["A", "B", "C", "D"] as const).map((opt) => (
                                <button
                                   key={opt}
                                   onClick={() => handleAnswerChange(idx, opt)}
                                   className={`p-6 rounded-2xl text-left border transition-all flex items-center gap-4 group ${
                                      answers[idx] === opt 
                                      ? "bg-blue-500 border-blue-400 text-white shadow-[0_10px_20px_rgba(59,130,246,0.2)]" 
                                      : "bg-white/3 border-white/5 text-white/60 hover:bg-white/5 hover:border-white/10"
                                   }`}
                                >
                                   <span className={`size-8 rounded-lg flex items-center justify-center font-black text-sm transition-colors ${
                                      answers[idx] === opt ? "bg-white/20 text-white" : "bg-white/5 text-white/30 group-hover:bg-white/10"
                                   }`}>
                                      {opt}
                                   </span>
                                   <span className="font-medium text-lg">
                                      {(q as any)[`option${opt}`]}
                                   </span>
                                </button>
                             ))}
                          </div>
                       </div>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "results") {
    if (isEvaluating) {
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center pattern bg-[#050505]">
            <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
              <div className="relative">
                <div className="size-20 rounded-3xl bg-blue-500/10 flex items-center justify-center">
                  <Brain className="text-blue-500 size-10" />
                </div>
                <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-[#09090b] flex items-center justify-center border border-white/10">
                  <Loader2 className="text-blue-400 size-4 animate-spin" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">AI Diagnostic in Progress</h2>
              <p className="text-white/50 text-sm">Identifying cognitive strengths, weak logical areas, and building your study roadmap...</p>
            </div>
          </div>
        );
    }

    if (!evaluation) return null;

    return (
      <div className="min-h-screen pattern pb-20 px-4 pt-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
           {/* Result Summary */}
           <div className="glass-card p-10 flex flex-col items-center text-center gap-6 border-blue-500/20">
              <div className="size-20 rounded-full bg-blue-500/10 flex items-center justify-center">
                 <Target className="text-blue-400 size-10" />
              </div>
              <div>
                 <h1 className="text-4xl font-black text-white mb-2">Diagnostic Result</h1>
                 <p className="text-white/50 max-w-lg">{evaluation.overallSummary}</p>
              </div>
              <div className="flex items-baseline gap-2">
                 <span className="text-7xl font-black text-blue-400">{evaluation.percentage}%</span>
                 <span className="text-white/20 font-bold uppercase tracking-widest text-sm">Correct</span>
              </div>
           </div>

           {/* Stats Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-6 border-white/5 text-center">
                 <Layout size={18} className="text-purple-400 mx-auto mb-3" />
                 <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">Time Used</p>
                 <p className="text-xl font-bold text-white">{Math.floor(totalTimeUsed/60)}m {totalTimeUsed%60}s</p>
              </div>
              <div className="glass-card p-6 border-white/5 text-center">
                 <Brain size={18} className="text-blue-400 mx-auto mb-3" />
                 <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">Weak Focus</p>
                 <p className="text-xl font-bold text-white">{evaluation.weakAreas[0] || "None"}</p>
              </div>
              <div className="glass-card p-6 border-white/5 text-center">
                 <CheckCircle size={18} className="text-green-400 mx-auto mb-3" />
                 <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">Total Score</p>
                 <p className="text-xl font-bold text-white">{evaluation.score}/{numQuestions}</p>
              </div>
           </div>

            {/* Time Management & Strengths Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="glass-card p-8 border-blue-500/10 bg-blue-500/5">
                  <div className="flex items-center gap-3 mb-4">
                     <Clock className="text-blue-400 size-5" />
                     <h3 className="text-lg font-bold text-white">Time Management</h3>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">
                     {evaluation.timeManagement}
                  </p>
               </div>

               <div className="glass-card p-8 border-green-500/10 bg-green-500/5">
                  <div className="flex items-center gap-3 mb-4">
                     <TrendingUp className="text-green-400 size-5" />
                     <h3 className="text-lg font-bold text-white">Cognitive Strengths</h3>
                  </div>
                  <ul className="space-y-2">
                     {evaluation.strengths.map((s: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                           <div className="size-1.5 rounded-full bg-green-500/40" />
                           {s}
                        </li>
                     ))}
                  </ul>
               </div>
            </div>

           {/* Detailed Insights */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-8 border-white/5 bg-[#09090b]/60">
                 <div className="flex items-center gap-3 mb-6">
                    <ShieldAlert className="text-red-400 size-5" />
                    <h3 className="text-lg font-bold text-white">Areas for Improvement</h3>
                 </div>
                 <ul className="space-y-4">
                    {evaluation.weakAreas.map((w: string, i: number) => (
                       <li key={i} className="flex gap-4 p-4 rounded-xl bg-red-400/5 border border-red-400/10 text-sm text-white/70">
                          <span className="font-mono text-red-400 font-bold">0{i+1}</span>
                          {w}
                       </li>
                    ))}
                 </ul>
              </div>

              <div className="glass-card p-8 border-white/5 bg-[#09090b]/60">
                 <div className="flex items-center gap-3 mb-6">
                    <ListChecks className="text-green-400 size-5" />
                    <h3 className="text-lg font-bold text-white">Actionable Tips</h3>
                 </div>
                 <ul className="space-y-4">
                    {evaluation.improvementTips.map((tip: string, i: number) => (
                       <li key={i} className="flex gap-4 p-4 rounded-xl bg-green-400/5 border border-green-400/10 text-sm text-white/70">
                          <CheckCircle className="text-green-400 size-4 shrink-0 mt-0.5" />
                          {tip}
                       </li>
                    ))}
                 </ul>
              </div>
           </div>

            {/* Detailed Question Review */}
            <div className="glass-card p-8 border-white/5 bg-[#09090b]/40">
               <div className="flex items-center gap-3 mb-8">
                  <HelpCircle className="text-blue-400 size-6" />
                  <h3 className="text-xl font-black text-white uppercase tracking-wider">Detailed Analysis</h3>
               </div>
               
               <div className="space-y-6">
                  {evaluation.questionAnalysis?.map((qa: any, i: number) => (
                     <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                           <div className="flex items-center gap-4">
                              <div className={`size-10 rounded-xl flex items-center justify-center font-bold ${
                                 qa.isCorrect ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                              }`}>
                                 {qa.questionNumber}
                              </div>
                              <div>
                                 <p className="text-white font-bold">Question {qa.questionNumber}</p>
                                 <p className="text-white/30 text-xs">Time spent: {qa.timeTaken}s</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                 qa.isCorrect ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                              }`}>
                                 {qa.isCorrect ? "Correct" : "Incorrect"}
                              </span>
                              {!qa.isCorrect && (
                                 <span className="px-3 py-1 rounded-full bg-white/5 text-white/40 border border-white/10 text-[10px] font-black uppercase tracking-widest">
                                   Correct: {qa.correctAnswer}
                                 </span>
                              )}
                           </div>
                        </div>

                        <div className="mt-4 p-5 rounded-xl bg-white/3 border border-white/5">
                           <p className="text-sm text-white/70 leading-relaxed mb-4">
                              <span className="text-blue-400 font-bold mr-2 uppercase text-[10px] tracking-widest">Analysis:</span>
                              {qa.explanation}
                           </p>
                           {qa.tip && (
                              <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/10 flex gap-3">
                                 <Zap className="text-yellow-500 size-4 shrink-0 mt-0.5" />
                                 <p className="text-xs text-yellow-500/80 italic">
                                    <span className="font-bold mr-1">Speed Tip:</span> 
                                    {qa.tip}
                                 </p>
                              </div>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

           {/* AI Study Plan */}
           <div className="glass-card p-8 border-blue-500/20 bg-blue-500/5">
              <div className="flex items-center gap-3 mb-8">
                 <BookOpen className="text-blue-400 size-6" />
                 <h3 className="text-xl font-black text-white uppercase tracking-wider">Targeted Study Roadmap</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {evaluation.studyPlan.map((step: any, i: number) => (
                    <div key={i} className="glass-card p-6 border-white/10 bg-[#050505]/40 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-4 font-black text-white/5 text-4xl group-hover:text-blue-400/10 transition-colors">
                          {i+1}
                       </div>
                       <div className="relative">
                          <div className="text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">{step.week}</div>
                          <h4 className="text-lg font-bold text-white mb-4">{step.focus}</h4>
                          <ul className="space-y-2">
                             {step.tasks.map((t: string, j: number) => (
                                <li key={j} className="flex items-start gap-2 text-xs text-white/50">
                                   <div className="size-1.5 rounded-full bg-blue-500/40 mt-1.5" />
                                   {t}
                                </li>
                             ))}
                          </ul>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="flex justify-center mt-6">
              <Button 
                 onClick={() => setStep("setup")}
                 className="bg-white/5 text-white hover:bg-white/10 px-12 h-14 rounded-2xl font-bold border border-white/10"
              >
                 Try Another Category
              </Button>
           </div>
        </div>
      </div>
    );
  }

  return null;
}
