"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  isActive: boolean;
  onAutoSubmit: () => void;
  onViolation?: (count: number) => void;
  title?: string;
  strictMode?: boolean; // If true, auto-submit on 2nd violation
}

/**
 * ExamSecurity Component
 * Handles security measures for exams:
 * - Fullscreen mode
 * - Tab-switch detection (Visibility Change)
 * - Disabling Copy, Paste, Cut, Selection
 * - Disabling Right-Click
 * - Disabling common dev shortcuts (F12, PrintScreen)
 */
export default function ExamSecurity({ 
  isActive, 
  onAutoSubmit, 
  onViolation, 
  title = "Exam",
  strictMode = true 
}: Props) {
  const [showWarning, setShowWarning] = useState(false);
  const violationCount = useRef(0);

  useEffect(() => {
    if (!isActive) {
      // Small cleanup when no longer active
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      return;
    }

    // Attempt to enter fullscreen
    const enterFullscreen = () => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn("Fullscreen request failed:", err);
        });
      }
    };

    enterFullscreen();

    const handleSecurityViolation = (reason: string) => {
      console.log(`Security violation: ${reason}`);
      violationCount.current += 1;
      if (onViolation) onViolation(violationCount.current);
      
      if (strictMode) {
        console.log("Strict mode active: Auto-submitting...");
        onAutoSubmit();
      } else {
        setShowWarning(true);
      }
    };

    const handleVisibility = () => {
      console.log("Visibility State Change:", document.visibilityState);
      if (document.visibilityState === "hidden" && isActive) {
        handleSecurityViolation("Visibility hidden (Tab switch/Minimize)");
      }
    };

    const handleBlur = () => {
      console.log("Window blur detected - focus lost");
      if (isActive && !showWarning) {
        handleSecurityViolation("Window lost focus (Application switch)");
      }
    };

    const handleFocus = () => {
      console.log("Window focus regained");
    };

    const blockKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrlOrMeta = e.ctrlKey || e.metaKey;
      
      if (ctrlOrMeta && ["c", "v", "x", "a", "s", "u", "p"].includes(key)) {
        console.log(`Blocked key combo: ${ctrlOrMeta ? "Ctrl/Cmd" : ""} + ${key}`);
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const blockContext = (e: MouseEvent) => {
      console.log("Blocked right-click");
      e.preventDefault();
      return false;
    };

    // Event listeners
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("keydown", blockKey, true);
    document.addEventListener("contextmenu", blockContext);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    
    // Global body styling for security
    const originalUserSelect = document.body.style.userSelect;
    const originalWebkitUserSelect = document.body.style.webkitUserSelect;
    
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    console.log(`ExamSecurity: Full monitoring enabled for ${title}. StrictMode: ${strictMode}`);

    return () => {
      console.log("ExamSecurity: Dismounting/Disabling monitoring");
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("keydown", blockKey, true);
      document.removeEventListener("contextmenu", blockContext);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.body.style.userSelect = originalUserSelect || "auto";
      document.body.style.webkitUserSelect = originalWebkitUserSelect || "auto";
    };
  }, [isActive, onAutoSubmit, onViolation, strictMode, showWarning, title]);

  if (!isActive) return null;

  return (
    <>
      {/* Visual Indicator that Security is ON */}
      <div className="fixed top-2 right-24 z-[9999] flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-black uppercase tracking-widest pointer-events-none">
          <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
          Security Protocol Active
        </div>
      </div>

      {showWarning && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="max-w-sm w-full glass-card p-8 border-red-500/50 flex flex-col items-center gap-5 text-center bg-[#09090b]">
            <div className="size-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <ShieldAlert className="text-red-400 size-8" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase">⚠️ Security Warning!</h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Switching tabs or applications during the {title} is strictly prohibited. 
              This violation has been recorded.
              <br /><br />
              <strong className="text-red-400">Warning:</strong> One more violation will result in an <strong>automatic submission</strong>.
            </p>
            <Button 
              onClick={() => setShowWarning(false)} 
              className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-[0_8px_20px_-4px_rgba(239,44,44,0.4)] transition-all active:scale-95"
            >
              Return to {title}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
