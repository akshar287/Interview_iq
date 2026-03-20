"use client";

import React from "react";
import { Shield, ShieldAlert, Zap, Brain, Target } from "lucide-react";

export default function SecurityLandingSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-red-500/5 blur-[120px] rounded-full -z-10" />
      
      <div className="glass-card border-red-500/20 bg-red-500/[0.02] p-8 md:p-16 flex flex-col lg:flex-row items-center gap-12 md:gap-20">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest">
            <Shield size={14} className="fill-red-400" /> Integrity First
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
            Military-Grade <br />
            <span className="text-red-400">Exam Security</span>
          </h2>
          <p className="text-white/50 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
            Our AI-driven proctoring system ensures 100% integrity. With real-time monitoring and 
            automated enforcement, you can focus on your performance while we handle the security.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: <ShieldAlert size={18} />, title: "Anti-Cheat Protocol", desc: "Disabled copy-paste, right-click, and text selection." },
              { icon: <Zap size={18} />, title: "Auto-Submission", desc: "Instant submission if security boundaries are crossed." },
              { icon: <Brain size={18} />, title: "Tab-Switch Detection", desc: "AI-monitored detection for tab or window changes." },
              { icon: <Target size={18} />, title: "Fullscreen Lock", desc: "Enforced fullscreen mode to prevent external tool use." }
            ].map((f, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-red-400/30 group-hover:bg-red-400/10 transition-all">
                  <div className="text-white/40 group-hover:text-red-400 transition-colors">{f.icon}</div>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">{f.title}</h4>
                  <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative w-full lg:w-[45%] aspect-square">
           <div className="absolute inset-0 bg-red-500/20 blur-[100px] rounded-full animate-pulse" />
           <div className="glass-card size-full border-white/10 bg-[#09090b]/40 overflow-hidden relative flex items-center justify-center group shadow-3xl">
              <div className="relative text-center space-y-6 z-10 px-8">
                 <div className="size-32 md:size-40 rounded-[40px] bg-gradient-to-br from-red-500/20 to-black border border-red-500/30 mx-auto flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-700">
                    <Shield size={64} className="text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                 </div>
                 <div>
                    <p className="text-red-400 font-black text-2xl tracking-tight uppercase tracking-[0.1em]">Protected</p>
                    <p className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] mt-2 italic">AI Proctoring System Active</p>
                 </div>
              </div>

              {/* Floating labels */}
              <div className="absolute top-12 right-12 glass-card px-4 py-2 border-red-500/20 hidden md:block">
                 <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400 text-[10px] font-black tracking-widest uppercase">Live Monitoring</span>
                 </div>
              </div>
              <div className="absolute bottom-16 left-12 glass-card px-4 py-2 border-green-500/20 hidden md:block">
                 <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-green-400 text-[10px] font-black tracking-widest uppercase">Identity Verified</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
