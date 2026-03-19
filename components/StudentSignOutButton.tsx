"use client";

import { LogOut } from "lucide-react";
import { clearStudentSession } from "@/lib/actions/auth.action";
import { useRouter } from "next/navigation";

export default function StudentSignOutButton({ isMobile }: { isMobile?: boolean }) {
  const router = useRouter();

  const handleSignOut = async () => {
    // Clear server-side cookie
    await clearStudentSession();
    // Clear client-side localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("studentSession");
    }
    // Redirect to home
    router.push("/");
  };

  return (
    <button
      onClick={handleSignOut}
      className={isMobile 
        ? "w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-base text-red-400 hover:text-white hover:bg-red-500/10 transition-all border border-red-500/10"
        : "flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
      }
    >
      <LogOut size={isMobile ? 20 : 15} />
      Sign Out
    </button>
  );
}
