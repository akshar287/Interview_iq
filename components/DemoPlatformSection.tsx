"use client";
import { useEffect, useRef, useState } from "react";
import {
  Play, Pause, SkipForward, SkipBack,
  Brain, Code2, BookOpen, Coins,
  CheckCircle, Clock, Zap, Mic,
  Award, TrendingUp, Shield, Terminal,
  MessageSquare, Star, Upload, ChevronDown,
  User, Briefcase, Camera, AlertCircle, Lightbulb
} from "lucide-react";

// ── tick speed & scene durations (all 60ms per tick = slower) ────────────────
const TICK_MS = 60;

const SCENES = [
  { id: "interview", label: "AI Interview",  icon: Brain,    color: "#a78bfa", bg: "rgba(167,139,250,0.12)", duration: 28000 },
  { id: "aptitude",  label: "Aptitude Round",icon: BookOpen,  color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  duration: 24000 },
  { id: "technical", label: "Technical Round",icon: Code2,    color: "#34d399", bg: "rgba(52,211,153,0.12)",  duration: 24000 },
];

// ── helpers ──────────────────────────────────────────────────────────────────
const fade = (on: boolean) => ({
  opacity: on ? 1 : 0,
  transform: on ? "translateY(0)" : "translateY(10px)",
  transition: "all 0.55s ease",
});

// ══════════════════════════════════════════════════════════════════════════════
// INTERVIEW SCENE  (6 sub-steps)
// sub 1: Hero              0-70
// sub 2: Setup Form        70-155
// sub 3: 30s Quick Call    155-245
// sub 4: Dashboard         245-325
// sub 5: Full Interview    325-400
// sub 6: Rich Feedback     400-466
// ══════════════════════════════════════════════════════════════════════════════
function InterviewScene({ tick }: { tick: number }) {
  const sub = tick < 70 ? 1 : tick < 155 ? 2 : tick < 245 ? 3 : tick < 325 ? 4 : tick < 400 ? 5 : 6;
  const t = sub===1?tick : sub===2?tick-70 : sub===3?tick-155 : sub===4?tick-245 : sub===5?tick-325 : tick-400;

  // ── SUB 1: Hero ───────────────────────────────────────────────────────────
  if (sub === 1) return (
    <div className="flex flex-col gap-5 w-full max-w-lg mx-auto" style={fade(t > 5)}>
      <div className="flex items-center gap-4 p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex-1 space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)" }}>AI Interview</span>
          <h3 className="text-white font-black text-xl leading-tight">AI Enabled Personal<br /><span style={{ color: "#a78bfa" }}>Interview Analyser</span></h3>
          <p className="text-white/40 text-xs leading-relaxed">Practice real-world interview scenarios and receive instant, data-driven feedback to accelerate your career growth.</p>
          <button className="mt-1 px-5 py-2.5 rounded-xl font-black text-sm flex items-center gap-2" style={{ background: t > 35 ? "#a78bfa" : "transparent", color: t > 35 ? "black" : "#a78bfa", border: "1px solid #a78bfa", transition: "all 0.6s ease", cursor: "default" }}>
            <Brain size={14} />Create New Interview Profile
          </button>
        </div>
        <div className="shrink-0 size-20 rounded-2xl flex items-center justify-center" style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
          <MessageSquare size={36} style={{ color: "#a78bfa" }} />
        </div>
      </div>
      <p className="text-center text-white/20 text-xs animate-pulse">Step 1 — Click "Create New Interview Profile" to begin…</p>
    </div>
  );

  // ── SUB 2: Setup Form ────────────────────────────────────────────────────
  if (sub === 2) {
    const nameTyped = t > 8 ? "Akshar".slice(0, Math.min(Math.floor((t - 8) / 3), 6)) : "";
    const posSelected = t > 30;
    const expSelected = t > 50;
    const fileUploaded = t > 65;
    return (
      <div className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden" style={{ background: "rgba(18,20,30,0.97)", border: "1px solid rgba(255,255,255,0.1)", ...fade(t > 2) }}>
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-white font-black text-lg">Start Your Interview</h3>
            <p className="text-white/40 text-xs mt-0.5">Provide your details to begin your AI-powered interview</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-white text-xs font-bold">Full Name <span style={{ color: "#f87171" }}>*</span></label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <User size={13} style={{ color: "#a78bfa" }} />
              <span className="text-white text-sm font-medium">{nameTyped}{t > 8 && t < 31 && <span className="animate-pulse">|</span>}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-white text-xs font-bold">Position Applying For <span style={{ color: "#f87171" }}>*</span></label>
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: posSelected ? "rgba(167,139,250,0.08)" : "rgba(255,255,255,0.05)", border: `1px solid ${posSelected ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.1)"}`, transition: "all 0.4s ease" }}>
              <div className="flex items-center gap-2"><Briefcase size={13} style={{ color: "#a78bfa" }} /><span className="text-sm" style={{ color: posSelected ? "white" : "rgba(255,255,255,0.3)" }}>{posSelected ? "Frontend Developer" : "Select a position"}</span></div>
              <ChevronDown size={13} className="text-white/30" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-white text-xs font-bold">Years of Experience <span style={{ color: "#f87171" }}>*</span></label>
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: expSelected ? "rgba(167,139,250,0.08)" : "rgba(255,255,255,0.05)", border: `1px solid ${expSelected ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.1)"}`, transition: "all 0.4s ease" }}>
              <div className="flex items-center gap-2"><Clock size={13} style={{ color: "#a78bfa" }} /><span className="text-sm" style={{ color: expSelected ? "white" : "rgba(255,255,255,0.3)" }}>{expSelected ? "Junior (0-2 years)" : "Select experience level"}</span></div>
              <ChevronDown size={13} className="text-white/30" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-white text-xs font-bold">Resume <span className="text-white/30">(Optional)</span></label>
            <div className="flex flex-col items-center p-3 rounded-xl gap-1" style={{ background: fileUploaded ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.02)", border: `1px dashed ${fileUploaded ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.1)"}`, transition: "all 0.5s ease" }}>
              {fileUploaded ? <><CheckCircle size={14} style={{ color: "#34d399" }} /><span className="text-xs font-bold" style={{ color: "#34d399" }}>resume.pdf uploaded</span></> : <><Upload size={14} className="text-white/20" /><span className="text-white/30 text-xs font-bold">Click to upload or drag and drop</span></>}
            </div>
          </div>
          <button className="w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2" style={{ background: t > 70 ? "white" : "rgba(255,255,255,0.08)", color: t > 70 ? "black" : "rgba(255,255,255,0.4)", transition: "all 0.5s ease", cursor: "default" }}>
            <Mic size={15} />Start Interview
          </button>
        </div>
      </div>
    );
  }

  // ── SUB 3: 30-Second Quick Assessment CALL ──────────────────────────────
  if (sub === 3) {
    const talking = t % 22 < 12;
    const countdown = Math.max(30 - Math.floor(t * 30 / 90), 0);
    const analyzing = t > 72;
    const done = t > 83;
    const question = t < 25
      ? "Hi Akshar! Tell me — how comfortable are you with React hooks?"
      : t < 55
      ? "Great! Have you worked with REST APIs or backend integration?"
      : "Last one — how do you approach debugging a production issue?";
    return (
      <div className="w-full max-w-lg mx-auto space-y-3" style={fade(t > 2)}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-black text-sm">30-Second Knowledge Check</p>
            <p className="text-white/40 text-[10px]">AI assesses your knowledge to build your profile</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative size-9 flex items-center justify-center">
              <svg className="absolute inset-0" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="#a78bfa" strokeWidth="3"
                  strokeDasharray={`${2*Math.PI*15}`}
                  strokeDashoffset={`${2*Math.PI*15*(1-countdown/30)}`}
                  strokeLinecap="round" transform="rotate(-90 18 18)"
                  style={{ transition: "stroke-dashoffset 1s linear" }} />
              </svg>
              <span className="text-white font-black text-xs">{done ? "✓" : countdown}</span>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full font-bold animate-pulse" style={{ background: done ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)", color: done ? "#34d399" : "#f87171", border: `1px solid ${done ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"}` }}>
              {done ? "✓ Done" : "● LIVE"}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="aspect-video rounded-xl flex flex-col items-center justify-center gap-2 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#1a1040,#0d0d2b)", border: "1px solid rgba(167,139,250,0.2)" }}>
            <div className="size-12 rounded-full flex items-center justify-center" style={{ background: talking && !done ? "rgba(167,139,250,0.3)" : "rgba(167,139,250,0.1)", border: `2px solid ${talking && !done ? "#a78bfa" : "rgba(167,139,250,0.2)"}`, boxShadow: talking && !done ? "0 0 18px rgba(167,139,250,0.4)" : "none", transition: "all 0.3s ease" }}>
              <MessageSquare size={20} style={{ color: "#a78bfa" }} />
            </div>
            <p className="text-white/60 text-[10px] font-bold">AI Interviewer</p>
            {talking && !done && (
              <div className="absolute bottom-2 left-0 right-0 flex items-end justify-center gap-0.5 h-3">
                {[3,5,7,4,6,5,4].map((h,i) => (
                  <div key={i} className="w-1 rounded-full" style={{ height:`${h}px`, background:"#a78bfa", animation:`bar ${0.4+i*0.07}s ease-in-out infinite alternate` }} />
                ))}
              </div>
            )}
          </div>
          <div className="aspect-video rounded-xl relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0f1a2e,#0a1520)", border: "1px solid rgba(96,165,250,0.25)" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-14 rounded-full flex items-center justify-center" style={{ background:"rgba(96,165,250,0.1)", border:"2px solid rgba(96,165,250,0.2)" }}>
                <User size={24} className="text-white/40" />
              </div>
            </div>
            <div className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ background:"rgba(239,68,68,0.85)" }}>
              <span className="size-1 rounded-full bg-white animate-pulse" />
              <span className="text-white text-[8px] font-black">LIVE ANALYSIS</span>
            </div>
            <div className="absolute bottom-1.5 left-0 right-0 text-center">
              <span className="text-white text-[10px] font-bold">Akshar</span>
            </div>
          </div>
        </div>
        <div className="rounded-xl p-3" style={{ background: done ? "rgba(52,211,153,0.06)" : "rgba(167,139,250,0.06)", border: `1px solid ${done ? "rgba(52,211,153,0.2)" : "rgba(167,139,250,0.15)"}`, transition: "all 0.5s ease" }}>
          {done
            ? <div className="flex items-center gap-2"><CheckCircle size={14} style={{ color:"#34d399" }} /><span className="text-xs font-bold" style={{ color:"#34d399" }}>Assessment complete! Generating your interview profile…</span></div>
            : analyzing
            ? <><p className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"#fbbf24" }}>⚡ Analysing responses…</p><p className="text-white/50 text-xs mt-0.5">Building your personalised interview profile</p></>
            : <><p className="text-[10px] text-white/40 mb-1 font-bold uppercase tracking-wider">AI is asking…</p><p className="text-white text-xs leading-relaxed">{question}</p></>}
        </div>
        <style jsx>{`@keyframes bar{from{transform:scaleY(0.3)}to{transform:scaleY(1)}}`}</style>
      </div>
    );
  }

  // ── SUB 4: Dashboard — AI-Generated Profile Card ───────────────────
  if (sub === 4) {
    const skills = [
      { label: "React / Hooks", level: 65, show: t > 18 },
      { label: "REST APIs",     level: 78, show: t > 30 },
      { label: "Debugging",     level: 55, show: t > 42 },
    ];
    return (
      <div className="w-full max-w-lg mx-auto space-y-3" style={fade(t > 3)}>
        <div className="flex items-center justify-between">
          <p className="text-white font-black text-base">Your Interviews</p>
          <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ background: "rgba(52,211,153,0.1)", color: "#34d399" }}>✓ Profile Generated</span>
        </div>
        {/* Generated profile card (highlighted) */}
        <div className="rounded-xl p-4" style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.1), rgba(96,165,250,0.05))", border: "1.5px solid rgba(167,139,250,0.35)", opacity: t > 8 ? 1 : 0, transition: "opacity 0.5s ease" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="size-11 rounded-xl flex items-center justify-center font-black text-white text-base" style={{ background: "#22c55e" }}>F</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-white font-black text-sm">Frontend Developer Interview</p>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-black" style={{ background: "rgba(167,139,250,0.2)", color: "#a78bfa" }}>AI Generated</span>
              </div>
              <p className="text-white/30 text-[10px]">📅 Mar 21, 2026 · Based on your 30s assessment</p>
            </div>
          </div>
          {/* Skill assessment from quick call */}
          <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider mb-2">AI-Assessed Knowledge Levels</p>
          <div className="space-y-2">
            {skills.map((s, i) => (
              <div key={i} style={{ opacity: s.show ? 1 : 0, transition: "opacity 0.5s ease" }}>
                <div className="flex justify-between mb-0.5">
                  <span className="text-white/50 text-[10px]">{s.label}</span>
                  <span className="text-[10px] font-black" style={{ color: "#a78bfa" }}>{s.show ? s.level : 0}%</span>
                </div>
                <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: s.show ? `${s.level}%` : "0%", background: "linear-gradient(to right, #a78bfa, #60a5fa)", transition: "width 1s ease" }} />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2" style={{ background: t > 60 ? "linear-gradient(135deg, #a78bfa, #60a5fa)" : "rgba(167,139,250,0.1)", color: t > 60 ? "white" : "rgba(167,139,250,0.5)", transition: "all 0.5s ease", cursor: "default" }}>
            <Mic size={13} />{t > 72 ? "Starting Full Interview…" : "Start Full Interview"}
          </button>
        </div>
        {/* Other cards dimmed */}
        {["Backend Developer Interview", "Software Engineer Interview"].map((title, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl opacity-30" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-white text-xs font-bold">{title}</p>
            <span className="text-white/30 text-[10px]">View Interview</span>
          </div>
        ))}
      </div>
    );
  }

  // ── SUB 5: Full Interview Call ───────────────────────────────────────
  if (sub === 5) {
    const talking = t % 20 < 10;
    return (
      <div className="w-full max-w-lg mx-auto space-y-3" style={fade(t > 3)}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-black text-sm">Full AI Interview — Frontend Developer</p>
            <p className="text-[10px]"><span style={{ color: "#a78bfa" }}>Role: Frontend Developer</span> · <span style={{ color: "#a78bfa" }}>Level: Junior</span></p>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full font-bold animate-pulse" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>● LIVE</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* AI Panel */}
          <div className="aspect-video rounded-xl flex flex-col items-center justify-center gap-2 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1a1040, #0d0d2b)", border: "1px solid rgba(167,139,250,0.2)" }}>
            <div className="size-14 rounded-full flex items-center justify-center" style={{ background: talking ? "rgba(167,139,250,0.3)" : "rgba(167,139,250,0.1)", border: `2px solid ${talking ? "#a78bfa" : "rgba(167,139,250,0.2)"}`, boxShadow: talking ? "0 0 20px rgba(167,139,250,0.4)" : "none", transition: "all 0.3s ease" }}>
              <MessageSquare size={22} style={{ color: "#a78bfa" }} />
            </div>
            <p className="text-white/60 text-xs font-bold">AI Interviewer</p>
            {talking && t > 10 && (
              <div className="absolute bottom-3 left-0 right-0 px-3">
                <div className="flex items-end justify-center gap-0.5 h-4">
                  {[3,5,7,5,4,6,4,5,3].map((h, i) => (
                    <div key={i} className="w-1 rounded-full" style={{ height: `${h}px`, background: "#a78bfa", animation: `bar ${0.4 + i * 0.07}s ease-in-out infinite alternate` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* User Webcam */}
          <div className="aspect-video rounded-xl flex flex-col items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f1a2e, #0a1520)", border: "1px solid rgba(96,165,250,0.25)" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-16 rounded-full flex items-center justify-center" style={{ background: "rgba(96,165,250,0.1)", border: "2px solid rgba(96,165,250,0.2)" }}>
                <User size={28} className="text-white/40" />
              </div>
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.85)" }}>
              <span className="size-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white text-[9px] font-black">LIVE ANALYSIS</span>
            </div>
            <div className="absolute bottom-2 left-0 right-0 text-center">
              <span className="text-white text-xs font-bold">Akshar</span>
            </div>
            <Camera size={12} className="absolute top-2 left-2 text-white/30" />
          </div>
        </div>
        {/* Conversation bubble */}
        <div className="rounded-xl p-3" style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)" }}>
          <p className="text-[10px] text-white/40 mb-1 font-bold uppercase tracking-wider">AI Interviewer is asking…</p>
          <p className="text-white text-xs leading-relaxed">
            {t < 20 ? "Tell me about yourself and your experience with React?" : t < 50 ? "Can you explain how you handle state management in large applications?" : "Walk me through a challenging project you've worked on recently."}
          </p>
        </div>
        <div className="flex justify-center">
          <button className="px-8 py-2 rounded-full font-black text-sm" style={{ background: "#22c55e", color: "white", cursor: "default" }}>
            <Mic size={13} className="inline mr-1.5" />Call Active
          </button>
        </div>
        <style jsx>{`@keyframes bar { from{transform:scaleY(0.3)} to{transform:scaleY(1)} }`}</style>
      </div>
    );
  }

  // ── SUB 5: Rich Feedback with Face & Detailed Analysis ──────────────────
  const faceMetrics = [
    { label: "Eye Contact",   value: t > 15 ? 72 : 0, color: "#60a5fa", icon: "👁" },
    { label: "Confidence",   value: t > 22 ? 58 : 0, color: "#a78bfa", icon: "💪" },
    { label: "Engagement",   value: t > 29 ? 81 : 0, color: "#34d399", icon: "⚡" },
    { label: "Calmness",     value: t > 36 ? 65 : 0, color: "#fbbf24", icon: "🧘" },
  ];
  const analyses = [
    {
      title: "Communication Clarity",
      icon: MessageSquare, color: "#60a5fa",
      score: 62,
      desc: "The candidate struggled with verbal articulation — often using filler words (\"um\", \"like\") while transitioning between thoughts. Sentence structure was fragmented at times, reducing overall clarity. Recommend practising structured STAR-format responses.",
      show: t > 45,
    },
    {
      title: "Technical Accuracy",
      icon: Code2, color: "#a78bfa",
      score: 75,
      desc: "Good foundational React knowledge demonstrated. However, state management explanations lacked depth — the candidate did not cover advanced patterns like context composition or Zustand. Strong REST API understanding was evident from examples given.",
      show: t > 58,
    },
    {
      title: "Personality Fit",
      icon: User, color: "#fbbf24",
      score: 68,
      desc: "Motivation for the role was communicated positively, though alignment with company mission could be stated more explicitly. Candidate showed enthusiasm and a collaborative mindset — well-suited for a junior team environment.",
      show: t > 68,
    },
  ];
  return (
    <div className="w-full max-w-lg mx-auto space-y-3" style={fade(t > 3)}>
      {/* Header */}
      <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)" }}>
        <div>
          <p className="text-white font-black text-base">🎉 INTERVIEW COMPLETE!</p>
          <p className="text-white/40 text-xs">Final Analysis & Key Takeaways</p>
        </div>
        <div className="text-right">
          <p className="text-white font-black text-2xl"><span style={{ color: "#a78bfa" }}>68</span><span className="text-white/30 text-sm">/100</span></p>
          <p className="text-[9px] font-bold" style={{ color: "#a78bfa" }}>PROFESSIONAL</p>
        </div>
      </div>
      {/* Face Analysis */}
      <div className="p-4 rounded-xl space-y-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Camera size={11} className="text-white/30" />Live Face & Behavioural Analysis
        </p>
        <div className="grid grid-cols-2 gap-2">
          {faceMetrics.map((m, i) => (
            <div key={i} className="rounded-lg p-2.5" style={{ background: `${m.color}0d`, border: `1px solid ${m.color}25` }}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-white/60">{m.icon} {m.label}</span>
                <span className="text-[10px] font-black" style={{ color: m.color }}>{m.value}%</span>
              </div>
              <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full" style={{ width: `${m.value}%`, background: m.color, transition: "width 1.2s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Descriptive Analysis */}
      <div className="space-y-2">
        {analyses.map((a, i) => (
          <div key={i} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${a.color}25`, opacity: a.show ? 1 : 0, transform: a.show ? "translateY(0)" : "translateY(8px)", transition: "all 0.5s ease" }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <a.icon size={12} style={{ color: a.color }} />
                <span className="text-white font-black text-[11px]">{a.title}</span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: `${a.color}15`, color: a.color }}>{a.score}/100</span>
            </div>
            <p className="text-white/40 text-[9px] leading-relaxed">{a.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APTITUDE SCENE  (3 sub-steps)
// sub 1: Hero Setup       0-80
// sub 2: Live Exam        80-170
// sub 3: Full Analysis    170-240
// ══════════════════════════════════════════════════════════════════════════════
function AptitudeScene({ tick }: { tick: number }) {
  const sub = tick < 80 ? 1 : tick < 170 ? 2 : 3;
  const t = sub === 1 ? tick : sub === 2 ? tick - 80 : tick - 170;

  // ── SUB 1: Hero Setup ───────────────────────────────────────────────────
  if (sub === 1) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4" style={fade(t > 3)}>
        <div className="flex bg-[#121620] rounded-2xl p-6 relative overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex-1 pr-6 z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-4 rounded-full" style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}>
              <BookOpen size={10} style={{ color: "#60a5fa" }} />
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">AI Aptitude Module</span>
            </div>
            <h2 className="text-3xl font-black text-white leading-tight mb-2">
              AI Enabled General<br />
              <span className="text-blue-400">Aptitude Test</span>
            </h2>
            <p className="text-white/40 text-xs max-w-sm leading-relaxed">
              Test your quantitative, logical, and verbal reasoning skills with our dynamic, AI-generated aptitude assessments.
            </p>
          </div>
          <div className="w-32 h-32 bg-[#0a0d14] rounded-2xl border border-white/5 flex items-center justify-center relative z-10">
            <Brain size={60} className="text-blue-400" />
            <div className="absolute -top-3 -right-3 size-8 rounded-full bg-[#121620] border border-white/5 flex items-center justify-center">
              <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="bg-[#121620]/90 rounded-2xl p-5 border border-white/5 space-y-5">
          <div className="flex gap-8">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">Practice Categories</span>
                <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase cursor-pointer">Select All</span>
              </div>
              {["Numerics", "Verbal", "Logical Reasoning"].map((cat, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5">
                  <span className="text-white text-xs font-bold">{cat}</span>
                  <div className="size-4 rounded-full bg-blue-500 flex items-center justify-center">
                    <CheckCircle size={10} className="text-white" />
                  </div>
                </div>
              ))}
            </div>
            <div className="w-1/3 pt-1">
              <span className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-3 block">Questions</span>
              <div className="p-3 rounded-xl bg-blue-500 border border-blue-400" style={{ boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}>
                <span className="text-white text-xs font-bold block mb-1">Standard Exam Size</span>
                <span className="inline-block bg-white/20 text-white text-[9px] font-black px-2 py-0.5 rounded-full">50 QUESTIONS</span>
              </div>
            </div>
          </div>
          <button className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors" style={{ boxShadow: t > 40 ? "0 0 30px rgba(59,130,246,0.4)" : "none", transition: "all 0.5s ease" }}>
            <Zap size={14} /> Generate Aptitude Exam
          </button>
        </div>
      </div>
    );
  }

  // ── SUB 2: Live Exam with Time Alert ─────────────────────────────────────
  if (sub === 2) {
    const selected = t > 60 ? 1 : t > 35 ? 0 : -1;
    const isAlert = t > 45 && t < 70;
    const opts = ["200 km", "225 km", "250 km", "275 km"];
    return (
      <div className="flex flex-col gap-4 w-full max-w-md mx-auto" style={fade(t > 3)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(96,165,250,0.15)" }}><BookOpen size={14} style={{ color: "#60a5fa" }} /></div>
            <span className="text-white font-black text-sm">Aptitude Exam</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors duration-300" style={{ background: isAlert ? "rgba(239, 68, 68, 0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${isAlert ? "rgba(239, 68, 68, 0.3)" : "rgba(255,255,255,0.1)"}` }}>
              <Clock size={11} className={isAlert ? "text-red-400 animate-pulse" : "text-blue-400"} />
              <span className={`text-xs font-bold ${isAlert ? "text-red-400" : "text-white/60"}`}>
                {isAlert ? "00:09" : `00:${Math.max(45 - Math.floor(t / 2), 10)}`}
              </span>
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}>Q 12 / 50</span>
          </div>
        </div>
        
        {isAlert && (
          <div className="py-1.5 px-3 rounded-md bg-red-500/10 border border-red-500/20 flex items-center gap-2 animate-pulse">
            <AlertCircle size={12} className="text-red-400" />
            <span className="text-red-400 text-[10px] font-bold tracking-wider uppercase">Time running out for this question!</span>
          </div>
        )}

        <div className="flex gap-1">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full" style={{ background: i < 11 ? "#60a5fa" : i === 11 ? "rgba(96,165,250,0.4)" : "rgba(255,255,255,0.08)" }} />
          ))}
        </div>
        
        <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-white/40 text-[10px] uppercase tracking-wider mb-3 font-bold flex items-center gap-1.5">
            <span className="inline-block size-1.5 rounded-full bg-blue-400" />Speed & Distance (Medium)
          </p>
          <p className="text-white font-bold text-sm leading-relaxed">If a train travels at 90 km/h for 2.5 hours, what distance does it cover before its first stop?</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {opts.map((opt, i) => {
            const isSel = selected === i;
            return (
              <div key={i} className="rounded-xl px-4 py-3 font-bold text-sm cursor-default transition-all duration-300" style={{
                background: isSel ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.03)",
                border: isSel ? "1px solid rgba(96,165,250,0.4)" : "1px solid rgba(255,255,255,0.06)",
                color: isSel ? "#60a5fa" : "rgba(255,255,255,0.5)",
                transform: isSel ? "scale(1.02)" : "scale(1)"
              }}>
                <div className="flex items-center gap-2">
                  <div className="size-4 rounded-full border border-current flex items-center justify-center">
                    {isSel && <div className="size-2 rounded-full bg-current" />}
                  </div>
                  {opt}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── SUB 3: Full Analysis ────────────────────────────────────────────────
  return (
    <div className="w-full max-w-lg mx-auto space-y-4" style={fade(t > 3)}>
      <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.2)" }}>
        <div>
          <p className="text-white font-black text-base">EXAM COMPLETE!</p>
          <p className="text-white/40 text-xs">AI Performance & Method Analysis</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-white font-black text-xl"><span className="text-blue-400">42</span><span className="text-white/30 text-xs">/50</span></p>
            <p className="text-[9px] font-bold text-blue-400">SCORE</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-right">
            <p className="text-white font-black text-xl"><span className="text-amber-400">P85</span></p>
            <p className="text-[9px] font-bold text-amber-400">PERCENTILE</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Question Breakdown</span>
          <span className="text-[10px] px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/10 text-blue-400">Speed & Distance</span>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={14} className="text-emerald-400" />
              <p className="text-sm font-bold text-white">Q12. Train travel distance at 90km/h for 2.5h</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-red-400/5 border border-red-400/10">
              <div className="flex items-center gap-1.5 mb-2">
                <Clock size={12} className="text-red-400" />
                <span className="text-[10px] font-bold text-red-400 tracking-wider uppercase">Time Analysis</span>
              </div>
              <p className="text-white text-xl font-black mb-1">45s <span className="text-xs font-medium text-white/30 truncate">taken</span></p>
              <p className="text-[9px] text-white/40">Target ideal time: <span className="text-white/70">30s</span></p>
              <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-400" style={{ width: '60%' }} />
                <div className="h-full bg-red-400" style={{ width: '40%' }} />
              </div>
              <p className="text-[9px] text-red-400 mt-1 italic">You spent 15s longer than optimal.</p>
            </div>

            <div className="p-3 rounded-lg bg-blue-400/5 border border-blue-400/10">
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb size={12} className="text-blue-400" />
                <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">Optimal Method</span>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed font-mono bg-black/20 p-1.5 rounded">
                Distance = Speed × Time<br/>
                D = 90 × (5/2)<br/>
                D = 45 × 5 = 225 km
              </p>
              <p className="text-[9px] text-white/40 mt-1.5 leading-tight">
                AI Tip: Convert 2.5 to fraction (5/2) to calculate faster mentally without decimals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TECHNICAL SCENE
// ══════════════════════════════════════════════════════════════════════════════
function TechnicalScene({ tick }: { tick: number }) {
  const sub = tick < 80 ? 1 : tick < 250 ? 2 : 3;
  const t = sub === 1 ? tick : sub === 2 ? tick - 80 : tick - 250;

  // ── SUB 1: Hero Setup ───────────────────────────────────────────────────
  if (sub === 1) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-4" style={fade(t > 3)}>
        <div className="flex bg-[#121620] rounded-2xl p-8 relative overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex-1 pr-6 z-10 w-2/3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-5 rounded-full" style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
              <Zap size={10} style={{ color: "#a78bfa" }} />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#a78bfa]">AI Technical Assessment</span>
            </div>
            <h2 className="text-[2.2rem] font-black text-white leading-[1.1] mb-3">
              AI Enabled Technical<br />
              <span className="text-[#a78bfa]">Coding Editor</span>
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-md">
              Select a difficulty level to generate a custom technical programming problem for your interview practice.
            </p>
          </div>
          <div className="w-48 h-48 bg-[#0a0d14] rounded-3xl border border-white/5 flex items-center justify-center relative z-10 shadow-2xl" style={{ boxShadow: "0 20px 40px -10px rgba(0,0,0,0.8)" }}>
            <Code2 size={70} className="text-[#a78bfa]" />
            <div className="absolute -bottom-2 -left-2 px-3 py-1.5 rounded-lg bg-[#121620] border border-white/5 flex items-center justify-center font-mono text-xs text-white/50">
              &lt;/&gt;
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { level: "Easy", mins: "20 Minutes", icon: Brain, color: "#34d399", active: false },
            { level: "Medium", mins: "40 Minutes", icon: Brain, color: "#fbbf24", active: t > 40 },
            { level: "Difficult", mins: "60 Minutes", icon: Brain, color: "#f87171", active: false },
          ].map((lvl, i) => (
            <div key={i} className="bg-[#121620]/90 rounded-2xl p-6 border flex flex-col items-center justify-center text-center transition-all duration-500" style={{ borderColor: lvl.active ? `${lvl.color}40` : "rgba(255,255,255,0.05)", background: lvl.active ? `rgba(255,255,255,0.04)` : "rgba(255,255,255,0.02)", transform: lvl.active ? "scale(1.02)" : "scale(1)", boxShadow: lvl.active ? `0 0 30px ${lvl.color}20` : "none", cursor: "default" }}>
              <div className="size-12 rounded-2xl flex items-center justify-center mb-4 transition-all" style={{ background: lvl.active ? `${lvl.color}20` : "rgba(255,255,255,0.03)" }}>
                <lvl.icon size={22} style={{ color: lvl.color }} />
              </div>
              <p className="text-white font-black text-lg">{lvl.level}</p>
              <p className="text-white/30 text-xs mt-1 mb-4">{lvl.mins}</p>
              <div className="size-6 rounded-full flex items-center justify-center" style={{ background: lvl.active ? lvl.color : "rgba(255,255,255,0.05)" }}>
                {lvl.active ? <CheckCircle size={10} className="text-black" /> : <Play size={10} className="text-white/20 translate-x-[1px]" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── SUB 2: Live Coding ──────────────────────────────────────────────────
  if (sub === 2) {
    return (
      <div className="flex flex-col gap-3 w-full max-w-md mx-auto" style={fade(t > 3)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(52,211,153,0.15)" }}><Terminal size={14} style={{ color: "#34d399" }} /></div>
            <span className="text-white font-black text-sm">Technical Round — DSA</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <Clock size={11} className="text-emerald-400" />
              <span className="text-xs font-bold text-white/60">32:14</span>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>TypeScript</span>
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1 font-bold flex items-center gap-1.5">
            <span className="inline-block size-1.5 rounded-full bg-amber-400" />Problem (Medium)
          </p>
          <p className="text-white font-bold text-sm">Longest Substring Without Repeating Characters</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-white/40 font-medium px-2 py-0.5 rounded bg-white/5">Sliding Window</span>
            <span className="text-[10px] text-white/40 font-medium px-2 py-0.5 rounded bg-white/5">Hash Map</span>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden" style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="size-2.5 rounded-full bg-red-500/60" /><div className="size-2.5 rounded-full bg-yellow-500/60" /><div className="size-2.5 rounded-full bg-green-500/60" />
            <span className="ml-2 text-white/30 text-[10px] font-mono font-bold tracking-wider">solution.ts</span>
          </div>
          <pre className="p-4 text-[11px] font-mono overflow-hidden" style={{ color: "#c9d1d9", lineHeight: "1.6", minHeight: "130px" }}>
            <span style={{ color: "#79c0ff" }}>function </span><span style={{ color: "#d2a8ff" }}>longestSubstring</span><span style={{ color: "#c9d1d9" }}>(s: </span><span style={{ color: "#79c0ff" }}>string</span><span style={{ color: "#c9d1d9" }}>): </span><span style={{ color: "#79c0ff" }}>number</span><span style={{ color: "#c9d1d9" }}> {"{"}</span>
            {t > 15 && <>{"\n  "}<span style={{ color: "#ff7b72" }}>let </span><span style={{ color: "#c9d1d9" }}>max = 0, left = 0;</span></>}
            {t > 30 && <>{"\n  "}<span style={{ color: "#ff7b72" }}>const </span><span style={{ color: "#c9d1d9" }}>seen = </span><span style={{ color: "#ff7b72" }}>new </span><span style={{ color: "#d2a8ff" }}>Map</span><span style={{ color: "#c9d1d9" }}>&lt;string, number&gt;();</span></>}
            {t > 55 && <>{"\n\n  "}<span style={{ color: "#ff7b72" }}>for </span><span style={{ color: "#c9d1d9" }}>(let right = 0; right {"<"} s.length; right++) {"{"}</span></>}
            {t > 80 && <>{"\n    "}<span style={{ color: "#ff7b72" }}>if </span><span style={{ color: "#c9d1d9" }}>(seen.has(s[right])) left = seen.get(s[right])! + 1;</span></>}
            {t > 110 && <>{"\n    "}<span style={{ color: "#c9d1d9" }}>seen.set(s[right], right);</span>{"\n    "}<span style={{ color: "#c9d1d9" }}>max = Math.max(max, right - left + 1);</span></>}
            {t > 135 && <>{"\n  }"}{"\n  "}<span style={{ color: "#ff7b72" }}>return </span><span style={{ color: "#c9d1d9" }}>max;</span>{"\n}"}</>}
            {t <= 135 && <span className="animate-pulse ml-1 inline-block w-1.5 h-3 bg-white/50 align-middle" />}
          </pre>
        </div>
        <div className="flex justify-between items-center gap-2">
          <button className="flex-1 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-colors bg-white/5 text-white/50 hover:bg-white/10">Run Code</button>
          <button className="flex-1 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5" style={{ background: t > 150 ? "#34d399" : "rgba(52,211,153,0.1)", color: t > 150 ? "black" : "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>
            {t > 150 ? <><CheckCircle size={12} />Submitted</> : <><Code2 size={12} />Submit Code</>}
          </button>
        </div>
      </div>
    );
  }

  // ── SUB 3: Full Analysis ────────────────────────────────────────────────
  return (
    <div className="w-full max-w-lg mx-auto space-y-4" style={fade(t > 3)}>
      <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)" }}>
        <div>
          <p className="text-white font-black text-base flex items-center gap-2"><CheckCircle size={16} className="text-emerald-400" /> CODE ACCEPTED</p>
          <p className="text-white/40 text-[11px] mt-0.5">Performance & Complexity Analysis</p>
        </div>
        <div className="text-right">
          <p className="text-white font-black text-xl"><span className="text-emerald-400">12</span><span className="text-white/30 text-xs">/12</span></p>
          <p className="text-[9px] font-bold text-emerald-400">TEST CASES</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={13} className="text-emerald-400" />
            <span className="text-xs font-bold text-white/60">Time Complexity</span>
          </div>
          <p className="text-white font-black text-xl mb-1 text-emerald-400">O(n)</p>
          <p className="text-[10px] text-white/40 leading-relaxed">Highly optimal. Uses a single pass sliding window, bypassing nested iteration (O(n²)). Beats 91.4% of users in JavaScript setup.</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Terminal size={13} className="text-blue-400" />
            <span className="text-xs font-bold text-white/60">Space Complexity</span>
          </div>
          <p className="text-white font-black text-xl mb-1 text-blue-400">O(min(m, n))</p>
          <p className="text-[10px] text-white/40 leading-relaxed">Map stores at most 'm' unique characters from character set or 'n' string size. Better than O(n) worst-case storage constraint.</p>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-4 py-3 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-bold text-white/60">Solution Breakdown</span>
          <span className="text-[9px] px-2 py-0.5 rounded border border-white/10 bg-white/5 text-white/40">AI Generated</span>
        </div>
        <div className="p-4">
          <p className="text-xs text-white/50 leading-relaxed">
            The candidate utilised a <span className="text-white font-bold">Sliding Window</span> approach combined with a Hash Map to track indices of seen characters. When a repeating character is found, the <span className="text-emerald-400 font-mono text-[10px]">left</span> pointer jumps to the position <span className="text-emerald-400 font-mono text-[10px]">seen.get(s[right]) + 1</span> (if higher than current left). No extraneous logic or memory leaks detected. Handled boundary cases accurately.
          </p>
        </div>
      </div>
    </div>
  );
}



// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function DemoPlatformSection() {
  const [activeScene, setActiveScene] = useState(0);
  const [tick, setTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const scene = SCENES[activeScene];
  const totalTicks = scene.duration / TICK_MS;

  const goTo = (idx: number) => { setActiveScene(idx); setTick(0); setProgress(0); };
  const goNext = () => goTo((activeScene + 1) % SCENES.length);
  const goPrev = () => goTo((activeScene - 1 + SCENES.length) % SCENES.length);

  useEffect(() => {
    setTick(0); setProgress(0);
  }, [activeScene]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setTick(prev => {
        const next = prev + 1;
        setProgress((next / totalTicks) * 100);
        if (next >= totalTicks) { setActiveScene(s => (s + 1) % SCENES.length); return 0; }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [isPlaying, activeScene, totalTicks]);

  const renderScene = () => {
    switch (scene.id) {
      case "interview": return <InterviewScene tick={tick} />;
      case "aptitude":  return <AptitudeScene tick={tick} />;
      case "technical": return <TechnicalScene tick={tick} />;
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-24 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary-200 text-xs font-bold uppercase tracking-widest">
          <Play className="size-3 fill-primary-200" />Live Platform Demo
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white">
          See <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-blue-400">Everything</span> in Action
        </h2>
        <p className="text-white/40 max-w-xl mx-auto text-base">
          Watch the complete Careerly workflow — from creating your interview profile to receiving AI-powered feedback.
        </p>
      </div>

      {/* Player */}
      <div className="relative rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: `0 0 120px -20px ${scene.color}30, 0 40px 80px -30px rgba(0,0,0,0.6)`, transition: "box-shadow 0.8s ease" }}>
        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-5 pb-0 overflow-x-auto" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {SCENES.map((s, i) => {
            const Icon = s.icon; const isA = i === activeScene;
            return (
              <button key={i} onClick={() => goTo(i)} className="flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs font-bold whitespace-nowrap transition-all duration-300" style={{ background: isA ? "rgba(255,255,255,0.06)" : "transparent", color: isA ? s.color : "rgba(255,255,255,0.3)", borderBottom: isA ? `2px solid ${s.color}` : "2px solid transparent" }}>
                <Icon size={13} />{s.label}
              </button>
            );
          })}
        </div>

        {/* Step indicator for interview scene */}
        {scene.id === "interview" && (
          <div className="flex items-center justify-center gap-2 pt-4 px-6">
            {["Hero", "Setup Form", "30s Call", "Dashboard", "Full Interview", "Feedback"].map((label, i) => {
              const stepTick = [0, 70, 155, 245, 325, 400];
              const isActive = tick >= stepTick[i] && (i === 5 || tick < stepTick[i + 1]);
              const isDone = i < 5 && tick >= stepTick[i + 1];
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1">
                    <div className="size-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all duration-500" style={{ background: isDone ? "#34d399" : isActive ? scene.color : "rgba(255,255,255,0.08)", color: isDone || isActive ? "black" : "rgba(255,255,255,0.3)" }}>
                      {isDone ? "✓" : i + 1}
                    </div>
                    <span className="text-[9px] font-bold hidden md:block" style={{ color: isActive ? scene.color : isDone ? "#34d399" : "rgba(255,255,255,0.2)" }}>{label}</span>
                  </div>
                  {i < 5 && <div className="w-4 h-px" style={{ background: isDone ? "#34d399" : "rgba(255,255,255,0.1)" }} />}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Step indicator for aptitude scene */}
        {scene.id === "aptitude" && (
          <div className="flex items-center justify-center gap-2 pt-4 px-6">
            {["Exam Setup", "Live Test", "Detailed Analysis"].map((label, i) => {
              const stepTick = [0, 80, 170];
              const isActive = tick >= stepTick[i] && (i === 2 || tick < stepTick[i + 1]);
              const isDone = i < 2 && tick >= stepTick[i + 1];
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1">
                    <div className="size-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all duration-500" style={{ background: isDone ? "#34d399" : isActive ? scene.color : "rgba(255,255,255,0.08)", color: isDone || isActive ? "black" : "rgba(255,255,255,0.3)" }}>
                      {isDone ? "✓" : i + 1}
                    </div>
                    <span className="text-[9px] font-bold hidden md:block" style={{ color: isActive ? scene.color : isDone ? "#34d399" : "rgba(255,255,255,0.2)" }}>{label}</span>
                  </div>
                  {i < 2 && <div className="w-8 h-px" style={{ background: isDone ? "#34d399" : "rgba(255,255,255,0.1)" }} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Step indicator for technical scene */}
        {scene.id === "technical" && (
          <div className="flex items-center justify-center gap-2 pt-4 px-6">
            {["Setup Editor", "Live Coding", "Code Review"].map((label, i) => {
              const stepTick = [0, 80, 250];
              const isActive = tick >= stepTick[i] && (i === 2 || tick < stepTick[i + 1]);
              const isDone = i < 2 && tick >= stepTick[i + 1];
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1">
                    <div className="size-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all duration-500" style={{ background: isDone ? "#34d399" : isActive ? scene.color : "rgba(255,255,255,0.08)", color: isDone || isActive ? "black" : "rgba(255,255,255,0.3)" }}>
                      {isDone ? "✓" : i + 1}
                    </div>
                    <span className="text-[9px] font-bold hidden md:block" style={{ color: isActive ? scene.color : isDone ? "#34d399" : "rgba(255,255,255,0.2)" }}>{label}</span>
                  </div>
                  {i < 2 && <div className="w-8 h-px" style={{ background: isDone ? "#34d399" : "rgba(255,255,255,0.1)" }} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col items-center justify-center py-8 px-6 min-h-[460px] relative">
          <div className="absolute top-4 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest" style={{ background: scene.bg, color: scene.color, border: `1px solid ${scene.color}30` }}>
            <span className="size-1.5 rounded-full animate-pulse" style={{ background: scene.color }} />Live Preview
          </div>
          <div key={`${activeScene}-${scene.id === "interview" ? (tick < 70 ? 1 : tick < 155 ? 2 : tick < 245 ? 3 : tick < 325 ? 4 : tick < 400 ? 5 : 6) : scene.id === "aptitude" ? (tick < 80 ? 1 : tick < 170 ? 2 : 3) : scene.id === "technical" ? (tick < 80 ? 1 : tick < 250 ? 2 : 3) : 1}`} className="w-full" style={{ animation: "sceneFadeIn 0.5s ease both" }}>
            {renderScene()}
          </div>
        </div>

        {/* Progress */}
        <div className="relative h-1 bg-white/5">
          <div className="h-full" style={{ width: `${progress}%`, background: `linear-gradient(to right, ${scene.color}, ${scene.color}aa)`, transition: "width 0.06s linear" }} />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <button onClick={goPrev} className="size-9 rounded-xl flex items-center justify-center transition-all hover:scale-110" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}><SkipBack size={14} /></button>
            <button onClick={() => setIsPlaying(p => !p)} className="size-9 rounded-xl flex items-center justify-center transition-all hover:scale-110" style={{ background: scene.bg, border: `1px solid ${scene.color}30`, color: scene.color }}>
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button onClick={goNext} className="size-9 rounded-xl flex items-center justify-center transition-all hover:scale-110" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}><SkipForward size={14} /></button>
          </div>
          <div className="flex items-center gap-2">
            {SCENES.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className="rounded-full transition-all duration-300" style={{ width: i === activeScene ? "24px" : "6px", height: "6px", background: i === activeScene ? scene.color : "rgba(255,255,255,0.15)" }} />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full animate-pulse" style={{ background: scene.color }} />
            <span className="text-white/30 text-xs font-bold">{scene.label}</span>
          </div>
        </div>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-3">
        {[
          { icon: Shield,       label: "Anti-Cheat Protection", color: "#34d399" },
          { icon: Brain,        label: "AI-Powered Analysis",   color: "#a78bfa" },
          { icon: TrendingUp,   label: "Progress Tracking",     color: "#60a5fa" },
          { icon: Award,        label: "Industry-Ready Prep",   color: "#fbbf24" },
          { icon: MessageSquare,label: "Instant AI Feedback",   color: "#f472b6" },
          { icon: Mic,          label: "Behavioral Analysis",   color: "#34d399" },
        ].map((pill, i) => {
          const Icon = pill.icon;
          return (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold" style={{ background: `${pill.color}10`, border: `1px solid ${pill.color}25`, color: pill.color }}>
              <Icon size={12} />{pill.label}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes sceneFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
