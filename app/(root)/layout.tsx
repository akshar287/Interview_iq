import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated, getCurrentUser, signOut, getStudentFromSession, clearStudentSession } from "@/lib/actions/auth.action";
import { Button } from "@/components/ui/button";
import { LogOut, GraduationCap } from "lucide-react";
import AmbientSound from "@/components/AmbientSound";
import SecondaryNavbar from "@/components/SecondaryNavbar";

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
    redirect("/sign-in");
  }

  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between py-6">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-primary-200 p-2 rounded-xl">
            <Image src="/logo.svg" alt="VoxIntel Logo" width={24} height={20} className="invert brightness-0" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">VoxIntel</h2>
        </Link>

        {/* Middle nav area */}
        <div className="flex items-center gap-2">
          {/* Show College Exam nav item ONLY when a student is logged in */}
          {student && (
            <Link
              href="/student/exam"
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all bg-primary-200/10 text-primary-200 border border-primary-200/20 hover:bg-primary-200/20"
            >
              <GraduationCap size={15} />
              College Exam
            </Link>
          )}
        </div>

        {/* Right side: sign-in links or sign-out button */}
        {!isUserAuthenticated && !student && (
          <div className="flex items-center gap-6">
            <Link href="/" className="text-white/70 hover:text-white font-medium transition-colors">
              Home
            </Link>
            <Link href="/sign-in" className="text-white/70 hover:text-white font-medium transition-colors">
              User
            </Link>
            <Link href="/college/sign-in" className="text-white/70 hover:text-white font-medium transition-colors">
              College
            </Link>
            <Link href="/student/login" className="text-white/70 hover:text-white font-medium transition-colors">
              Student
            </Link>
          </div>
        )}

        {/* Normal authenticated user sign-out */}
        {isUserAuthenticated && (
          <form action={signOut}>
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5 gap-2 rounded-xl transition-all">
              <LogOut size={18} />
              <span className="font-medium">Sign Out</span>
            </Button>
          </form>
        )}

        {/* Student-only sign-out (no Firebase session) */}
        {!isUserAuthenticated && student && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-primary-200/20 flex items-center justify-center text-primary-200 font-bold text-sm">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white text-sm font-semibold">{student.name}</span>
                <span className="text-white/40 text-xs">Student</span>
              </div>
            </div>
            <form action={handleStudentSignOut}>
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5 gap-2 rounded-xl transition-all">
                <LogOut size={18} />
                <span className="font-medium">Sign Out</span>
              </Button>
            </form>
          </div>
        )}
      </nav>

      {/* Secondary Navbar for authenticated users */}
      {isUserAuthenticated && user?.type === "user" && (
        <SecondaryNavbar />
      )}

      {children}

      <AmbientSound />
    </div>
  );
};

export default Layout;
