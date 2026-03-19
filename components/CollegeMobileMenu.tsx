"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Users, BookOpen, Code2, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth.action";

interface Props {
  hasPlan: boolean;
  collegeName?: string;
}

export default function CollegeMobileMenu({ hasPlan, collegeName }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  const navLinks = hasPlan ? [
    { href: "/college/dashboard/add-students", label: "Add Students", icon: <Users size={16} /> },
    { href: "/college/dashboard/aptitude-round", label: "Aptitude Round", icon: <BookOpen size={16} /> },
    { href: "/college/dashboard/technical-round", label: "Technical Round", icon: <Code2 size={16} /> },
  ] : [];

  return (
    <>
      <button
        className="md:hidden p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 top-[73px] z-30 bg-[#09090b]/97 backdrop-blur-xl border-t border-white/10 flex flex-col p-6 gap-3 overflow-y-auto pb-12">
          {collegeName && (
            <div className="pb-4 border-b border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-widest font-bold">College Portal</p>
              <p className="text-white font-semibold mt-1 truncate">{collegeName}</p>
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-base transition-all ${
                pathname === link.href
                  ? "bg-primary-200/15 text-primary-200 border border-primary-200/30"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}

          <div className="mt-auto pt-4 border-t border-white/10">
            <form action={signOut}>
              <Button variant="ghost" className="w-full text-white/70 hover:text-white gap-2 justify-start">
                <LogOut size={16} /> Sign Out
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
