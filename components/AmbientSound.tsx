"use client";

import { useEffect, useRef, useState } from "react";

export default function AmbientSound() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Create audio element
        audioRef.current = new Audio("/sounds/office-ambient.mp3");
        audioRef.current.loop = true;
        audioRef.current.volume = 0.18; // Very subtle volume

        // Check saved preference
        const savedMute = localStorage.getItem("voxintel_ambient_muted");
        if (savedMute === "true") setIsMuted(true);

        // Start playing on first user interaction (browser policy)
        const handleFirstInteraction = () => {
            if (!hasInteracted) {
                setHasInteracted(true);
                setIsVisible(true);
                if (audioRef.current && savedMute !== "true") {
                    audioRef.current.play().catch(() => {
                        // Autoplay blocked silently
                    });
                }
                window.removeEventListener("click", handleFirstInteraction);
                window.removeEventListener("keydown", handleFirstInteraction);
            }
        };

        window.addEventListener("click", handleFirstInteraction);
        window.addEventListener("keydown", handleFirstInteraction);

        return () => {
            window.removeEventListener("click", handleFirstInteraction);
            window.removeEventListener("keydown", handleFirstInteraction);
            audioRef.current?.pause();
        };
    }, []);

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!audioRef.current) return;

        if (isMuted) {
            audioRef.current.play().catch(() => { });
            audioRef.current.muted = false;
            setIsMuted(false);
            localStorage.setItem("voxintel_ambient_muted", "false");
        } else {
            audioRef.current.muted = true;
            setIsMuted(true);
            localStorage.setItem("voxintel_ambient_muted", "true");
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            {/* Tooltip */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[11px] text-gray-300 font-medium select-none">
                <span>{isMuted ? "🔇" : "🔊"}</span>
                <span>{isMuted ? "Office Ambience Off" : "Office Ambience On"}</span>
            </div>

            {/* Toggle button */}
            <button
                onClick={toggleMute}
                title={isMuted ? "Turn on office ambience" : "Turn off office ambience"}
                className={`group relative flex items-center justify-center size-12 rounded-full border transition-all duration-300 shadow-lg backdrop-blur-md ${isMuted
                        ? "bg-dark-200/80 border-white/10 text-gray-500 hover:border-white/20"
                        : "bg-primary-200/20 border-primary-200/40 text-primary-200 hover:bg-primary-200/30"
                    }`}
            >
                {/* Pulse ring when active */}
                {!isMuted && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-primary-200/20 pointer-events-none" />
                )}
                <span className="text-xl relative z-10">{isMuted ? "🔇" : "🔊"}</span>
            </button>
        </div>
    );
}
