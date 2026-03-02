"use client";

import { useEffect, useRef, useState } from "react";

export default function AmbientSound() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const playedRef = useRef(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const audio = new Audio("/sounds/office-ambient.mp3");
        audio.loop = true;
        audio.volume = 0.25;
        audioRef.current = audio;

        audio.addEventListener("canplaythrough", () => setIsReady(true));
        audio.addEventListener("error", () => {
            console.error("AmbientSound: Could not load /sounds/office-ambient.mp3 — check the file exists in /public/sounds/");
            setError(true);
        });

        // Check saved preference
        const saved = localStorage.getItem("voxintel_ambient_muted");
        if (saved === "true") setIsMuted(true);

        // Start on first user click anywhere on page
        const tryPlay = () => {
            if (playedRef.current) return;
            const saved = localStorage.getItem("voxintel_ambient_muted");
            if (saved === "true") {
                playedRef.current = true;
                return;
            }
            audio.play()
                .then(() => { playedRef.current = true; })
                .catch((err) => console.warn("AmbientSound play blocked:", err));
        };

        document.addEventListener("click", tryPlay, { once: false });
        document.addEventListener("keydown", tryPlay, { once: false });

        return () => {
            audio.pause();
            document.removeEventListener("click", tryPlay);
            document.removeEventListener("keydown", tryPlay);
        };
    }, []);

    const handleButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const audio = audioRef.current;
        if (!audio) return;

        if (isMuted) {
            // Unmute and ensure playing
            audio.muted = false;
            audio.volume = 0.25;
            audio.play().catch(console.warn);
            playedRef.current = true;
            setIsMuted(false);
            localStorage.setItem("voxintel_ambient_muted", "false");
        } else {
            // Mute
            audio.muted = true;
            setIsMuted(true);
            localStorage.setItem("voxintel_ambient_muted", "true");
        }
    };

    // Don't show the button if the file failed to load
    if (error) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            {/* Label */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full border border-white/10 text-[11px] text-gray-300 font-medium select-none pointer-events-none">
                <span>{isMuted ? "🔇" : "🔊"}</span>
                <span>{isMuted ? "Office Noise Off" : "Office Noise On"}</span>
            </div>

            {/* Toggle button */}
            <button
                onClick={handleButtonClick}
                title={isMuted ? "Click to hear office ambience" : "Click to mute office ambience"}
                className={`group relative flex items-center justify-center size-12 rounded-full border transition-all duration-300 shadow-xl backdrop-blur-md cursor-pointer ${isMuted
                        ? "bg-dark-200/90 border-white/10 text-gray-500 hover:border-white/20"
                        : "bg-primary-200/20 border-primary-200/40 text-primary-200 hover:bg-primary-200/30"
                    }`}
            >
                {!isMuted && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-primary-200/15 pointer-events-none" />
                )}
                <span className="text-xl relative z-10">{isMuted ? "🔇" : "🔊"}</span>
            </button>
        </div>
    );
}
