"use client";

import React from 'react';

interface RadarChartProps {
    scores: { name: string; score: number }[];
    size?: number;
}

const RadarChart = ({ scores, size = 300 }: RadarChartProps) => {
    const padding = 40;
    const radius = (size - padding * 2) / 2;
    const center = size / 2;
    const levels = 5;

    // Convert scores to polygon points
    const points = scores.map((s, i) => {
        const angle = (Math.PI * 2 * i) / scores.length - Math.PI / 2;
        const valueRadius = (radius * s.score) / 100;
        const x = center + valueRadius * Math.cos(angle);
        const y = center + valueRadius * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    // Labels positions
    const labelPositions = scores.map((s, i) => {
        const angle = (Math.PI * 2 * i) / scores.length - Math.PI / 2;
        const x = center + (radius + 25) * Math.cos(angle);
        const y = center + (radius + 15) * Math.sin(angle);
        return { x, y, name: s.name.split(' ')[0] }; // Use first word only
    });

    return (
        <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="overflow-visible">
                {/* Helper circles/web */}
                {[1, 2, 3, 4, 5].map((level) => (
                    <circle
                        key={level}
                        cx={center}
                        cy={center}
                        r={(radius * level) / levels}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.1)"
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
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data polygon */}
                <polygon
                    points={points}
                    fill="rgba(45, 212, 191, 0.3)"
                    stroke="#2dd4bf"
                    strokeWidth="2"
                    className="animate-pulse"
                />

                {/* Dots */}
                {points.split(' ').map((p, i) => {
                    const [x, y] = p.split(',').map(Number);
                    return (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#2dd4bf"
                            className="drop-shadow-[0_0_8px_rgba(45,212,191,0.6)]"
                        />
                    );
                })}

                {/* Labels */}
                {labelPositions.map((pos, i) => (
                    <text
                        key={i}
                        x={pos.x}
                        y={pos.y}
                        textAnchor="middle"
                        className="text-[10px] fill-white/60 font-medium uppercase tracking-wider"
                    >
                        {pos.name}
                    </text>
                ))}
            </svg>
        </div>
    );
};

export default RadarChart;
