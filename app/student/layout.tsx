"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { BookOpen, Code2, GraduationCap, LayoutDashboard } from "lucide-react";
import StudentSignOutButton from "@/components/StudentSignOutButton";
import StudentPerformanceBanner from "@/components/StudentPerformanceBanner";


export default function StudentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [studentName, setStudentName] = useState<string | null>(null);

  // Only show navbar if student is logged in (session in localStorage)
  useEffect(() => {
    const raw = localStorage.getItem("studentSession");
    if (raw) {
      const session = JSON.parse(raw);
      setStudentName(session?.name ?? null);
    }
  }, [pathname]);

  const isLoginPage = pathname === "/student/login";
  const showNav = !isLoginPage && !!studentName;

  return (
    <div className="min-h-screen">
      {/* Performance banner — shown when logged in and not on login page */}
      {showNav && <StudentPerformanceBanner />}

      {/* Student Navbar */}
      {showNav && (
        <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-40">
          {/* Brand */}
          <Link href="/student/exam" className="flex items-center gap-3">
            <div className="bg-primary-200 p-1.5 rounded-xl">
              <Image
                src="/careerly-icon.png"
                alt="Careerly"
                width={30}
                height={30}
                className="rounded-md"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-xl italic uppercase tracking-tighter"><span style={{ color: '#2dd4bf' }}>Career</span><span style={{ color: '#f97316' }}>ly</span></span>
              <span className="text-primary-200 text-[10px] font-bold uppercase tracking-widest">Student Portal</span>
            </div>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-2">
            <Link
              href="/student/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                pathname === "/student/dashboard"
                  ? "bg-white/15 text-white border border-white/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutDashboard size={15} />
              Dashboard
            </Link>

            <Link
              href="/student/exam"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                pathname === "/student/exam"
                  ? "bg-primary-200/15 text-primary-200 border border-primary-200/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <BookOpen size={15} />
              Aptitude Round
            </Link>

            <Link
              href="/student/technical"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                pathname === "/student/technical"
                  ? "bg-purple-400/15 text-purple-400 border border-purple-400/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Code2 size={15} />
              Technical Round
            </Link>
          </div>

          {/* Student info + sign-out */}
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-primary-200/20 flex items-center justify-center text-primary-200 font-bold text-sm">
              {studentName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white text-sm font-semibold">{studentName}</span>
              <span className="text-white/40 text-xs flex items-center gap-1">
                <GraduationCap size={10} /> Student
              </span>
            </div>
            <StudentSignOutButton />
          </div>
        </nav>
      )}

      {children}
    </div>
  );
}
