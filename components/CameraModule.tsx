"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

interface CameraModuleProps {
    onMetricsUpdate: (metrics: { eyeContact: number; confidence: number }) => void;
}

const CameraModule = ({ onMetricsUpdate }: CameraModuleProps) => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = "/models";
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                ]);
                setModelsLoaded(true);
                console.log("Face-api models loaded");
            } catch (error) {
                console.error("Error loading face-api models:", error);
            }
        };
        loadModels();
    }, []);

    const runAnalysis = useCallback(async () => {
        if (
            modelsLoaded &&
            webcamRef.current &&
            webcamRef.current.video &&
            webcamRef.current.video.readyState === 4
        ) {
            const video = webcamRef.current.video;
            const displaySize = { width: video.videoWidth, height: video.videoHeight };

            if (canvasRef.current) {
                faceapi.matchDimensions(canvasRef.current, displaySize);
            }

            const detections = await faceapi
                .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions();

            if (detections.length > 0) {
                const detection = detections[0];

                // 1. Calculate Eye Contact Score
                // Landmarks indices: 36-41 (left eye), 42-47 (right eye), 30 (nose tip)
                const landmarks = detection.landmarks.positions;
                const leftEye = landmarks.slice(36, 42);
                const rightEye = landmarks.slice(42, 48);
                const nose = landmarks[30];

                const avgLeftEye = {
                    x: leftEye.reduce((s, p) => s + p.x, 0) / 6,
                    y: leftEye.reduce((s, p) => s + p.y, 0) / 6,
                };
                const avgRightEye = {
                    x: rightEye.reduce((s, p) => s + p.x, 0) / 6,
                    y: rightEye.reduce((s, p) => s + p.y, 0) / 6,
                };

                // Heuristic for "looking at camera": nose is horizontally centered between eyes
                const eyeWidth = avgRightEye.x - avgLeftEye.x;
                const noseOffset = Math.abs((nose.x - avgLeftEye.x) / eyeWidth - 0.5);
                const eyeContactScore = Math.max(0, 1 - noseOffset * 3); // Higher is better

                // 2. Calculate Confidence Score
                // Weighted sum of expressions: neutral and happy are positive for confidence
                const expressions = detection.expressions;
                const confidenceScore = expressions.neutral + (expressions.happy * 0.5) - (expressions.fear * 0.5) - (expressions.sad * 0.5);

                onMetricsUpdate({
                    eyeContact: Math.min(100, Math.max(0, eyeContactScore * 100)),
                    confidence: Math.min(100, Math.max(0, confidenceScore * 100)),
                });

                // Optional: Draw debug info on canvas if needed
                if (canvasRef.current) {
                    const resizedDetections = faceapi.resizeResults(detections, displaySize);
                    const ctx = canvasRef.current.getContext("2d");
                    if (ctx) {
                        ctx.clearRect(0, 0, displaySize.width, displaySize.height);
                        // faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
                    }
                }
            }
        }
    }, [modelsLoaded, onMetricsUpdate]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (modelsLoaded) {
            interval = setInterval(runAnalysis, 1000); // Analyze every second
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [modelsLoaded, runAnalysis]);

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl border-4 border-[#5E17EB]/40 shadow-inner group">
            <Webcam
                ref={webcamRef}
                audio={false}
                mirrored={true}
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: "user",
                }}
            />
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
            {!modelsLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-sm font-semibold transition-opacity duration-500">
                    <div className="flex flex-col items-center gap-4">
                        <div className="size-10 border-4 border-primary-200 border-t-transparent rounded-full animate-spin" />
                        <p className="animate-pulse">Initializing Vision AI...</p>
                    </div>
                </div>
            )}
            <div className="absolute top-4 right-4 z-30">
                <div className="flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                    <div className="size-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-white font-bold tracking-widest uppercase">Live Analysis</span>
                </div>
            </div>
        </div>
    );
};

export default CameraModule;
