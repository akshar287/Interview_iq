"use client";

import React from 'react';

interface RadarChartProps {
    scores: { name: string; score: number }[];
    size?: number;
}

const RadarChart = ({ scores, size = 300 }: RadarChartProps) => {
    const padding = 50;
    const radius = (size - padding * 2) / 2;
    const center = size / 2;
    const levels = 4;

    // Convert scores to polygon points
    const points = scores.map((s, i) => {
        const angle = (Math.PI * 2 * i) / scores.length - Math.PI / 2;
        const valueRadius = (radius * s.score) / 100;
        const x = center + valueRadius * Math.cos(angle);
        const y = center + valueRadius * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    // Labels positions with adjusted spacing
    const labelPositions = scores.map((s, i) => {
        const angle = (Math.PI * 2 * i) / scores.length - Math.PI / 2;
        const x = center + (radius + 40) * Math.cos(angle);
        const y = center + (radius + 20) * Math.sin(angle);
        return { x, y, name: s.name.split(' ')[0] };
    });

    return (
        <div className="relative flex items-center justify-center p-4">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-teal-500/10 blur-[60px] rounded-full" />

            <svg width={size} height={size} className="overflow-visible relative z-10">
                <defs>
                    <radialGradient id="radar-gradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(45, 212, 191, 0.4)" />
                        <stop offset="100%" stopColor="rgba(45, 212, 191, 0.1)" />
                    </radialGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Web Grid */}
                {[...Array(levels)].map((_, i) => (
                    <circle
                        key={i}
                        cx={center}
                        cy={center}
                        r={(radius * (i + 1)) / levels}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeWidth="1"
                    />
                ))}

                {/* Axis lines */}
                {scores.map((_, i) => {
                    const angle = (Math.PI * 2 * i) / scores.length - Math.PI / 2;
                    const x = center + radius * Math.cos(angle);
                    const y = center + radius * Math.sin(angle);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={x}
                            y2={y}
                            stroke="rgba(255, 255, 255, 0.08)"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data polygon */}
                <polygon
                    points={points}
                    fill="url(#radar-gradient)"
                    stroke="#2dd4bf"
                    strokeWidth="3"
                    className="drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]"
                    style={{ filter: 'url(#glow)' }}
                />

                {/* Dots with pulse effect */}
                {points.split(' ').map((p, i) => {
                    const [x, y] = p.split(',').map(Number);
                    return (
                        <g key={i} className="animate-slow-pulse">
                            <circle cx={x} cy={y} r="5" fill="#2dd4bf" />
                            <circle cx={x} cy={y} r="10" fill="#2dd4bf" className="opacity-20" />
                        </g>
                    );
                })}

                {/* Labels */}
                {labelPositions.map((pos, i) => (
                    <text
                        key={i}
                        x={pos.x}
                        y={pos.y}
                        textAnchor="middle"
                        className="text-[11px] fill-white/80 font-bold uppercase tracking-widest"
                    >
                        {pos.name}
                    </text>
                ))}
            </svg>
        </div>
    );
};

export default RadarChart;
