"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { BookOpen, Code2, GraduationCap, LayoutDashboard, Menu, X } from "lucide-react";
import StudentSignOutButton from "@/components/StudentSignOutButton";
import StudentPerformanceBanner from "@/components/StudentPerformanceBanner";

export default function StudentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [studentName, setStudentName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("studentSession");
    if (raw) {
      const session = JSON.parse(raw);
      setStudentName(session?.name ?? null);
    }
  }, [pathname]);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const isLoginPage = pathname === "/student/login";
  const showNav = !isLoginPage && !!studentName;

  const navLinks = [
    { href: "/student/dashboard", label: "Dashboard", icon: <LayoutDashboard size={15} />, activeColor: "bg-white/15 text-white border border-white/30" },
    { href: "/student/exam", label: "Aptitude Round", icon: <BookOpen size={15} />, activeColor: "bg-primary-200/15 text-primary-200 border border-primary-200/30" },
    { href: "/student/technical", label: "Technical Round", icon: <Code2 size={15} />, activeColor: "bg-purple-400/15 text-purple-400 border border-purple-400/30" },
  ];

  return (
    <div className="min-h-screen">
      {showNav && <StudentPerformanceBanner />}

      {/* Navbar */}
      {showNav && (
        <nav className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-40">
          {/* Brand */}
          <Link href="/student/exam" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="bg-primary-200 p-1.5 rounded-xl">
              <Image src="/careerly-icon.png" alt="Careerly" width={28} height={28} className="rounded-md" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-lg sm:text-xl italic uppercase tracking-tighter">
                <span style={{ color: '#2dd4bf' }}>Career</span><span style={{ color: '#f97316' }}>ly</span>
              </span>
              <span className="text-primary-200 text-[9px] font-bold uppercase tracking-widest hidden sm:block">Student Portal</span>
            </div>
          </Link>

          {/* Desktop Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm transition-all ${
                  pathname === link.href ? link.activeColor : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.icon}
                <span className="hidden lg:inline">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop: Student info + sign-out */}
          <div className="hidden md:flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-primary-200/20 flex items-center justify-center text-primary-200 font-bold text-sm flex-shrink-0">
              {studentName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-col leading-none hidden lg:flex">
              <span className="text-white text-sm font-semibold truncate max-w-[120px]">{studentName}</span>
              <span className="text-white/40 text-xs flex items-center gap-1">
                <GraduationCap size={10} /> Student
              </span>
            </div>
            <StudentSignOutButton />
          </div>

          {/* Mobile: Hamburger button */}
          <button
            className="md:hidden p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      )}

      {/* Mobile Menu Drawer */}
      {showNav && menuOpen && (
        <div className="md:hidden fixed inset-0 top-[65px] z-30 bg-[#09090b]/97 backdrop-blur-xl border-t border-white/10 flex flex-col p-6 gap-3 overflow-y-auto pb-12">
          {/* Student info */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="size-10 rounded-full bg-primary-200/20 flex items-center justify-center text-primary-200 font-bold text-lg">
              {studentName!.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-semibold">{studentName}</p>
              <p className="text-white/40 text-xs flex items-center gap-1"><GraduationCap size={10} /> Student</p>
            </div>
          </div>

          {/* Mobile nav links */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-base transition-all ${
                pathname === link.href ? link.activeColor : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}

          <div className="mt-auto pt-6 border-t border-white/10 w-full">
            <div className="bg-white/5 rounded-2xl p-2">
              <StudentSignOutButton isMobile />
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
