"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Code2, MessageSquare } from "lucide-react";

const SecondaryNavbar = () => {
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
  ];

  return (
    <div className="flex items-center gap-2 mb-10 bg-white/5 backdrop-blur-md p-1.5 rounded-2xl w-fit border border-white/10 mx-auto md:mx-0">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
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
  );
};

export default SecondaryNavbar;
