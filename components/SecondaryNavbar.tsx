"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Code2, MessageSquare, GraduationCap, Coins } from "lucide-react";

const SecondaryNavbar = ({ 
  showCollegeExam = false,
  tokens = 0,
  isPlanActive = false
}: { 
  showCollegeExam?: boolean,
  tokens?: number,
  isPlanActive?: boolean
}) => {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Interview Round",
      href: "/",
      icon: MessageSquare,
    },
    {
      name: "Technical Round",
      href: "/technical-round",
      icon: Code2,
    },
    {
      name: "Aptitude Round",
      href: "/aptitude-round",
      icon: ClipboardList,
    },
    // Only shown for students
    ...(showCollegeExam
      ? [
          {
            name: "College Exam",
            href: "/student/exam",
            icon: GraduationCap,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 mb-10">
      <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md p-1.5 rounded-2xl w-fit border border-white/10 mx-auto md:mx-0">
        {navItems.map((item) => {
          const isActive =
            item.href === "/student/exam"
              ? pathname.startsWith("/student")
              : pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                isActive
                  ? "text-black"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-200 to-blue-400 rounded-xl shadow-lg shadow-primary-200/20 -z-10 animate-in fade-in zoom-in-95 duration-300" />
              )}
              <Icon size={18} className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {showCollegeExam ? (
        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 max-md:mt-4 cursor-default">
          <div className="size-10 rounded-xl bg-primary-200/10 flex items-center justify-center">
            <Coins size={20} className="text-primary-200" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-sm tracking-tight">{tokens.toLocaleString()} Tokens</span>
            <span className="text-primary-200 text-[10px] uppercase font-bold tracking-widest leading-tight">Remaining</span>
          </div>
        </div>
      ) : (
        <Link 
          href="/pricing"
          className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group max-md:mt-4"
        >
          <div className="size-10 rounded-xl bg-primary-200/10 flex items-center justify-center group-hover:bg-primary-200/20 transition-colors">
            <Coins size={20} className="text-primary-200" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-sm tracking-tight">{tokens.toLocaleString()} Tokens</span>
            <span className="text-primary-200 text-[10px] uppercase font-bold tracking-widest leading-tight">
              {isPlanActive ? "Top-up Plan" : "Upgrade Plan"}
            </span>
          </div>
        </Link>
      )}
    </div>
  );
};

export default SecondaryNavbar;
