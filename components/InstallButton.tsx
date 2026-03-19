"use client";

import { useState, useEffect } from "react";
import { Download, Monitor, Smartphone, Info, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Props {
  isMinimal?: boolean;
}

export default function InstallButton({ isMinimal }: Props) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for the beforeinstallprompt event (Android/Chrome/Edge)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    // If it's iOS, we already show the guide
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    // If it's a browser that doesn't support the prompt (or already installed)
    if (!deferredPrompt) {
      setShowIOSGuide(true); // Re-use the guide modal for general instructions
      return;
    }

    // If we have the native prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      <div className={`flex flex-col gap-2 ${!isMinimal ? "mb-4" : ""}`}>
        <Button
          variant="ghost"
          size={isMinimal ? "icon" : "default"}
          className={isMinimal 
            ? "size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:text-white hover:bg-emerald-500 transition-all shadow-lg active:scale-95"
            : "w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 h-14 rounded-2xl gap-3 justify-center transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] group"
          }
          onClick={handleInstallClick}
        >
          <Download size={20} className={!isMinimal ? "group-hover:bounce transition-transform" : ""} />
          {!isMinimal && (
            <div className="flex flex-col items-start leading-none ml-1">
              <span className="font-black text-[11px] uppercase tracking-widest">Download App</span>
              <span className="text-[9px] text-emerald-400/60 font-bold uppercase mt-0.5">
                {isInstallable ? "Install on device" : "Installation Guide"}
              </span>
            </div>
          )}
        </Button>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          {/* Enhanced Backdrop - 클릭시 닫힘 (English: Click to close) */}
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-xl cursor-pointer transition-all animate-in fade-in duration-300" 
            onClick={() => setShowIOSGuide(false)} 
          />
          
          {/* Modal Content - Perfected Wide Form for Laptop */}
          <div className="relative w-[90vw] md:w-[650px] bg-[#09090b] border border-white/10 rounded-[2.5rem] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 duration-500">
            {/* Emerald Top Accent */}
            <div className="absolute top-0 left-0 w-full h-[4px] bg-emerald-500" />
            
            <div className="p-8 md:p-14">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-2xl bg-emerald-500 p-3 shadow-2xl shadow-emerald-500/30">
                    <Image src="/careerly-icon.png" alt="Logo" width={56} height={56} className="rounded-md" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none italic">Install Careerly</h3>
                </div>
                <button 
                  onClick={() => setShowIOSGuide(false)} 
                  className="size-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5 active:scale-90"
                >
                  <X size={20} className="text-white hover:scale-110" />
                </button>
              </div>

              <div className="space-y-10">
                {/* Step 1 */}
                <div className="flex gap-6 group">
                  <div className="size-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-white font-black text-sm group-hover:bg-emerald-500 group-hover:text-black transition-colors duration-300">1</div>
                  <div className="flex-1 space-y-2">
                    <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] opacity-60">
                       {isIOS ? "Safari Share Button" : "Browser Menu Option"}
                    </h4>
                    <p className="text-white text-[15px] font-bold leading-relaxed">
                      {isIOS 
                        ? "Tap the Share icon at the bottom of Safari (square with arrow)." 
                        : "Click the three dots (⋮) or arrow (↑) in your browser menu."}
                    </p>
                    <div className="flex items-center gap-2.5 text-blue-400 font-black text-xs bg-blue-400/10 w-fit px-4 py-2 rounded-xl border border-blue-400/20 mt-2 uppercase tracking-widest">
                       {isIOS ? <Share size={16} /> : <Monitor size={16} />} 
                       {isIOS ? "Tap Share" : "Menu Settings"}
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-6 group">
                  <div className="size-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-white font-black text-sm group-hover:bg-emerald-500 group-hover:text-black transition-colors duration-300">2</div>
                  <div className="flex-1 space-y-2">
                    <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] opacity-60">
                       Add to Home Screen
                    </h4>
                    <p className="text-white text-[15px] font-bold leading-relaxed">
                      {isIOS 
                        ? "Scroll down and select 'Add to Home Screen' to install." 
                        : "Choose 'Install App' or 'Install Careerly' from the list."}
                    </p>
                    <div className="flex items-center gap-2.5 text-emerald-400 font-black text-xs bg-emerald-500/10 w-fit px-4 py-2 rounded-xl border border-emerald-500/20 mt-2 uppercase tracking-widest leading-none">
                       {isIOS ? "Add to Home Screen" : "Install Careerly"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-14 pt-8 border-t border-white/5">
                <Button 
                  className="w-full bg-white text-black hover:bg-emerald-500 hover:text-white font-black uppercase tracking-[0.4em] text-[11px] h-16 rounded-2xl shadow-xl active:scale-[0.98] transition-all"
                  onClick={() => setShowIOSGuide(false)}
                >
                  Close & Start Now
                </Button>
                <p className="text-center text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mt-6">
                  Click anywhere outside to dismiss guide
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

