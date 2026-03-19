import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { isAuthenticated, getCurrentUser, signOut, getStudentFromSession, clearStudentSession } from "@/lib/actions/auth.action";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import AmbientSound from "@/components/AmbientSound";
import SecondaryNavbar from "@/components/SecondaryNavbar";
import MobileMenu from "@/components/MobileMenu";
import HeaderShareButton from "@/components/HeaderShareButton";
import { MessageSquare, Code2, ClipboardList, GraduationCap } from "lucide-react";
import UserPerformanceBanner from "@/components/UserPerformanceBanner";
import StudentPerformanceBanner from "@/components/StudentPerformanceBanner";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  const user = await getCurrentUser();

  // Redirect college accounts to the college module
  if (isUserAuthenticated && user?.type === "college") {
    redirect("/college/dashboard");
  }

  // Check if a student is logged in via the student session cookie
  const student = await getStudentFromSession();

  // ─── Sign-out action (clears both FireBase session + student cookie) ───────
  async function handleSignOut() {
    "use server";
    await clearStudentSession();
    await signOut();
  }

  // ─── Student-only sign-out (no Firebase session to clear) ────────────────
  async function handleStudentSignOut() {
    "use server";
    await clearStudentSession();
    redirect("/");
  }

  return (
    <div className="root-layout">
      {/* Removed Performance Banners per user request */}
      <nav className="flex items-center justify-between py-4 sm:py-6">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="bg-primary-200 p-1.5 rounded-xl flex-shrink-0">
            <Image src="/careerly-icon.png" alt="Careerly Logo" width={28} height={28} className="rounded-md" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tighter italic uppercase"><span style={{ color: '#2dd4bf' }}>Career</span><span style={{ color: '#f97316' }}>ly</span></h2>
        </Link>

        {/* Right side: sign-in links or sign-out button */}
        {!isUserAuthenticated && !student && (
          <div className="hidden md:flex items-center gap-2 sm:gap-6">
            <Link href="/" className="text-white/70 hover:text-white font-medium transition-colors text-sm sm:text-base hidden sm:block">
              Home
            </Link>
            <Link href="/sign-in" className="text-white/70 hover:text-white font-medium transition-colors text-sm sm:text-base">
              <span className="hidden sm:inline">User</span>
            </Link>
            <Link href="/college/sign-in" className="text-white/70 hover:text-white font-medium transition-colors text-sm sm:text-base">
              <span className="hidden sm:inline">College</span>
            </Link>
          </div>
        )}

          <div className="flex items-center gap-1.5 sm:gap-2">
            <HeaderShareButton />
            <MobileMenu 
              onSignOut={isUserAuthenticated ? handleSignOut : handleStudentSignOut}
              userName={student?.name || user?.name}
              isStudent={!!student}
              isGuest={!isUserAuthenticated && !student}
            />
          </div>
      </nav>

      {/* Secondary Navbar — shown for authenticated users AND student sessions */}
      {(isUserAuthenticated && user?.type === "user") || student ? (
        <SecondaryNavbar 
          showCollegeExam={!!student} 
          tokens={student ? student.tokens : (user?.tokens || 0)}
          isPlanActive={user?.isPlanActive || false}
        />
      ) : null}


      {children}

      <AmbientSound />
    </div>
  );
};

export default Layout;
