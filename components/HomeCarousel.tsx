"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";

const slides = [
  {
    src: "/images/carousel/aptitude.png",
    title: "Aptitude Assessment",
    desc: "Master logical reasoning and quantitative math with real-time scoring and comprehensive analytics.",
    color: "from-blue-400/20",
    badge: "Module 01"
  },
  {
    src: "/images/carousel/technical.png",
    title: "Technical Excellence",
    desc: "Solve complex coding challenges across multiple languages with instant execution results.",
    color: "from-purple-400/20",
    badge: "Module 02"
  },
  {
    src: "/images/carousel/interview.png",
    title: "AI Mock Interviews",
    desc: "Experience realistic, high-pressure interview scenarios with behavioral and technical AI analysis.",
    color: "from-primary-200/20",
    badge: "Module 03"
  },
];

export default function HomeCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div 
      className="relative w-full max-w-6xl mx-auto mt-12 mb-20 px-4 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative aspect-[21/9] md:aspect-[24/9] rounded-[48px] overflow-hidden bg-[#09090b] border border-white/5 shadow-2xl">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02),transparent)]" />
        
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-all duration-[1500ms] cubic-bezier(0.4, 0, 0.2, 1) flex items-center ${
              idx === current 
                ? "opacity-100 translate-x-0 scale-100 z-10" 
                : "opacity-0 translate-x-20 scale-105 z-0 pointer-events-none"
            }`}
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} to-transparent opacity-30`} />
            
            <div className="relative w-full h-full flex flex-col md:flex-row items-center justify-between p-10 md:p-16 gap-10">
              {/* Content Box */}
              <div className="flex flex-col gap-6 max-w-lg text-left animate-in fade-in slide-in-from-left-8 duration-1000">
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-black tracking-widest text-primary-200">
                        {slide.badge}
                    </span>
                    <div className="h-px w-8 bg-white/10" />
                </div>
                
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
                  {slide.title}
                </h2>
                
                <p className="text-lg md:text-xl text-white/50 leading-relaxed font-medium">
                  {slide.desc}
                </p>

                <div className="flex items-center gap-2 mt-4">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i === current ? "w-12 bg-primary-200" : "w-3 bg-white/10 hover:bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Image Frame */}
              <div className="relative w-full md:w-[50%] aspect-video rounded-3xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10 transform transition-transform duration-1000 hover:scale-[1.02]">
                <Image
                  src={slide.src}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={idx === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button 
            onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 backdrop-blur-md"
        >
            <ChevronLeft size={24} />
        </button>
        <button 
            onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 backdrop-blur-md"
        >
            <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
