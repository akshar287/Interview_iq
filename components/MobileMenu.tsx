"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, MessageSquare, Code2, ClipboardList, GraduationCap, Share2, MoveRight, User, GraduationCap as CollegeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import InstallButton from "./InstallButton";

interface Props {
  onSignOut?: any;
  userName?: string;
  isStudent?: boolean;
  isGuest?: boolean;
}

export default function MobileMenu({ onSignOut, userName, isStudent, isGuest }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = [
    { name: "Interview Round", href: "/interview-round", icon: MessageSquare },
    { name: "Technical Round", href: "/technical-round", icon: Code2 },
    { name: "Aptitude Round", href: "/aptitude-round", icon: ClipboardList },
    ...(isStudent ? [{ name: "College Exam", href: "/student/exam", icon: GraduationCap }] : []),
  ];

  const handleShare = async () => {
    const shareData = {
      title: "Careerly",
      text: "Check out Careerly — AI-powered placement preparation suite for Aptitude, Technical & AI Mock Interviews!",
      url: "https://interview-iq-beta.vercel.app/",
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText("https://interview-iq-beta.vercel.app/");
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Handle body scroll locking when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white transition-all shadow-lg"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="fixed inset-0 top-[65px] sm:top-[73px] z-[100] bg-[#09090b]/98 backdrop-blur-2xl flex flex-col p-6 animate-in slide-in-from-top-4 fade-in duration-300 border-t border-white/5">
          {/* Background Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-primary-200/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-[10%] right-[-5%] w-[50%] h-[30%] bg-blue-500/10 blur-[80px] rounded-full" />
          </div>

            <div className="flex flex-col gap-2 mb-6">
                <InstallButton />
                <Button 
                    variant="ghost" 
                    className="w-full text-white/70 hover:text-white hover:bg-white/10 border border-white/10 h-14 rounded-2xl gap-3 justify-center transition-all bg-white/5 group"
                    onClick={handleShare}
                >
                  <Share2 size={20} className="group-hover:scale-110 transition-transform text-primary-200" /> 
                  <span className="font-bold uppercase tracking-widest text-[10px]">Share Careerly App</span>
                </Button>
            </div>

            {isGuest ? (
              <div className="flex flex-col gap-3">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-2">Login to Continue</p>
                <Link
                  href="/sign-in"
                  className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl font-bold text-base transition-all text-white/60 hover:text-white hover:bg-white/5 border border-white/5 bg-white/5"
                >
                  <div className="flex items-center gap-4">
                    <User size={20} className="text-primary-200" />
                    Student Sign In
                  </div>
                  <MoveRight size={18} className="text-white/20" />
                </Link>
                <Link
                  href="/college/sign-in"
                  className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl font-bold text-base transition-all text-white/60 hover:text-white hover:bg-white/5 border border-primary-200/10 bg-primary-200/5 mt-1"
                >
                  <div className="flex items-center gap-4">
                    <CollegeIcon size={20} className="text-orange-400" />
                    College Portal Login
                  </div>
                  <MoveRight size={18} className="text-white/20" />
                </Link>
              </div>
            ) : (
              <>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-2">Navigation</p>
                <div className="flex flex-col gap-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href === "/student/exam" && pathname.startsWith("/student"));
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-base transition-all ${
                          isActive
                            ? "bg-primary-200/10 text-primary-200 border border-primary-200/20 shadow-[0_8px_20px_-6px_rgba(45,212,191,0.2)]"
                            : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <Icon size={20} className={isActive ? "text-primary-200" : "text-white/40"} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}

          <div className="mt-auto pt-6 border-t border-white/5">
            {userName && (
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="size-10 rounded-full bg-primary-200/20 flex items-center justify-center text-primary-200 font-black text-sm border border-primary-200/20">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm">{userName}</span>
                  <span className="text-white/40 text-xs">Active Session</span>
                </div>
              </div>
            )}
            
            {!isGuest && (
              <form action={onSignOut} className="w-full">
                  <Button 
                      type="submit"
                      variant="ghost" 
                      className="w-full text-white/50 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent h-14 rounded-2xl gap-3 justify-center transition-all bg-white/5 group"
                  >
                    <LogOut size={20} className="group-hover:text-red-400 transition-colors" /> 
                    <span className="font-bold">Sign Out</span>
                  </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
