"use client";

import { useEffect, useRef } from "react";

export default function AmbientSound() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const playedRef = useRef(false);

    useEffect(() => {
        const audio = new Audio("/sounds/office-ambient.mp3");
        audio.loop = true;
        audio.volume = 0.25;
        audioRef.current = audio;

        const tryPlay = () => {
            if (playedRef.current) return;
            audio.play()
                .then(() => { playedRef.current = true; })
                .catch(() => { }); // silently ignore autoplay block
        };

        document.addEventListener("click", tryPlay);
        document.addEventListener("keydown", tryPlay);

        return () => {
            audio.pause();
            document.removeEventListener("click", tryPlay);
            document.removeEventListener("keydown", tryPlay);
        };
    }, []);

    // No visible UI — sound plays invisibly in background
    return null;
}
