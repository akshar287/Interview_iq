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
      className="relative w-full max-w-6xl mx-auto mt-8 mb-16 px-4 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative aspect-[3/4] sm:aspect-[4/5] md:aspect-[24/9] rounded-[32px] md:rounded-[48px] overflow-hidden bg-[#09090b] border border-white/5 shadow-2xl">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02),transparent)]" />

        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-all duration-[1200ms] ease-in-out ${
              idx === current
                ? "opacity-100 z-10"
                : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} to-transparent opacity-30`} />

            {/* Mobile layout: stacked, image on top */}
            <div className="flex flex-col md:hidden h-full">
              {/* Image - mobile */}
              <div className="relative w-full h-52 sm:h-64 flex-shrink-0">
                <Image
                  src={slide.src}
                  alt={slide.title}
                  fill
                  className="object-cover object-top"
                  priority={idx === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#09090b]" />
              </div>
              {/* Text - mobile */}
              <div className="flex flex-col gap-3 px-6 pb-8 pt-4">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-black tracking-widest text-primary-200 w-fit">
                  {slide.badge}
                </span>
                <h2 className="text-3xl font-black text-white tracking-tighter leading-none">
                  {slide.title}
                </h2>
                <p className="text-sm text-white/50 leading-relaxed font-medium">
                  {slide.desc}
                </p>
                {/* Dots */}
                <div className="flex items-center gap-2 mt-4">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i === current ? "w-10 bg-primary-200" : "w-3 bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop layout: side by side */}
            <div className="hidden md:flex items-center justify-between p-12 lg:p-16 gap-10 h-full min-h-[360px]">
              {/* Content */}
              <div className="flex flex-col gap-6 max-w-lg text-left">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-black tracking-widest text-primary-200">
                    {slide.badge}
                  </span>
                  <div className="h-px w-8 bg-white/10" />
                </div>
                <h2 className="text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none">
                  {slide.title}
                </h2>
                <p className="text-lg text-white/50 leading-relaxed font-medium">
                  {slide.desc}
                </p>
                <div className="flex items-center gap-2 mt-2">
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

              {/* Image */}
              <div className="relative w-[48%] flex-shrink-0 aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10">
                <Image
                  src={slide.src}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={idx === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows - always visible on mobile, hover on desktop */}
        <button
          onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-3 md:left-6 top-[104px] sm:top-[128px] md:top-1/2 -translate-y-1/2 z-20 size-8 md:size-12 rounded-full bg-black/40 md:bg-white/5 border border-white/20 flex items-center justify-center text-white transition-all hover:bg-white/10 backdrop-blur-md"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
          className="absolute right-3 md:right-6 top-[104px] sm:top-[128px] md:top-1/2 -translate-y-1/2 z-20 size-8 md:size-12 rounded-full bg-black/40 md:bg-white/5 border border-white/20 flex items-center justify-center text-white transition-all hover:bg-white/10 backdrop-blur-md"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
