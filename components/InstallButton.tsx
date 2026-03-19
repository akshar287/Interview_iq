"use client";

import { useState, useEffect } from "react";
import { Download, Monitor, Smartphone, Info, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InstallButton() {
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
      <div className="flex flex-col gap-2 mb-4">
        <Button
          variant="ghost"
          className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 h-14 rounded-2xl gap-3 justify-center transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] group"
          onClick={handleInstallClick}
        >
          <Download size={20} className="group-hover:bounce transition-transform" />
          <div className="flex flex-col items-start leading-none ml-1">
            <span className="font-black text-[11px] uppercase tracking-widest">Download App</span>
            <span className="text-[9px] text-emerald-400/60 font-bold uppercase mt-0.5">
              {isInstallable ? "Install on your device" : "Installation Guide"}
            </span>
          </div>
        </Button>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-md" onClick={() => setShowIOSGuide(false)} />
          <div className="relative w-full max-w-sm bg-[#121214] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 size-48 bg-primary-200/20 blur-[60px] rounded-full" />
            
            <div className="relative text-center">
              <div className="flex justify-between items-start mb-6">
                <div className="size-12 rounded-2xl bg-primary-200 p-2.5 shadow-lg shadow-primary-200/20">
                  <Image src="/careerly-icon.png" alt="Logo" width={40} height={40} className="rounded-md" />
                </div>
                <button onClick={() => setShowIOSGuide(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} className="text-white/40" />
                </button>
              </div>

              <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight text-left">How to Install Careerly</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-8 font-medium text-left">You can install Careerly directly onto your home screen for an app-like experience.</p>

              <div className="space-y-6 text-left">
                <div className="flex items-start gap-4">
                  <div className="size-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-white font-black text-xs border border-white/10">1</div>
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-bold flex items-center gap-2">
                       {isIOS ? "Tap the Share button" : "Click the browser menu"} 
                       {isIOS ? <Share size={16} className="text-blue-400" /> : <Monitor size={16} className="text-primary-200" />}
                    </span>
                    <span className="text-white/40 text-xs mt-1 font-medium italic">
                      {isIOS ? "Look for the box with upward arrow in Safari" : "Tap the three-dot menu icon in Chrome/Edge"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="size-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-white font-black text-xs border border-white/10">2</div>
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-bold">Select the option</span>
                    <span className="text-primary-200 text-sm font-black flex items-center gap-2 mt-0.5 uppercase tracking-wider">
                       {isIOS ? "Add to Home Screen" : "Install App"}
                    </span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full mt-10 bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-[10px] h-12 rounded-xl"
                onClick={() => setShowIOSGuide(false)}
              >
                Let&apos;s Go
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper needed for Image in a client component if using next/image
import Image from "next/image";
