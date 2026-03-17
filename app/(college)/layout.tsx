export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated, getCurrentUser, signOut } from "@/lib/actions/auth.action";
import { Button } from "@/components/ui/button";
import { LogOut, Users, BookOpen, Code2 } from "lucide-react";
import { db } from "@/firebase/admin";
import { headers } from "next/headers";

const CollegeLayout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated) {
    redirect("/college/sign-in");
  }

  // Reject regular user accounts from accessing the college module
  const currentUser = await getCurrentUser();
  if (currentUser?.type !== "college") {
    redirect("/");
  }

  // Check for active plan
  const collegeDoc = await db.collection("college").doc(currentUser.id).get();
  const collegeData = collegeDoc.data();
  const hasPlan = !!collegeData?.plan;

  // Get current path to avoid infinite redirect
  const headersList = await headers();
  const fullUrl = headersList.get("x-url") || "";
  
  // Also check referer as a fallback if x-url is somehow missing
  const referer = headersList.get("referer") || "";
  
  const isSetupPage = fullUrl.includes("/college/setup") || 
                      fullUrl.includes("/college/pricing") ||
                      referer.includes("/college/setup") ||
                      referer.includes("/college/pricing");

  if (!hasPlan && !isSetupPage) {
    // Force redirect to setup if no plan is found
    redirect("/college/setup");
  }


  return (
    <div className="root-layout">
      {/* College-specific top navbar */}
      <nav className="flex items-center justify-between py-6 border-b border-white/10 mb-8">
        <Link href="/college/dashboard" className="flex items-center gap-3">
          <div className="bg-primary-200 p-2 rounded-xl">
            <Image src="/logo.svg" alt="VoxIntel Logo" width={24} height={20} className="invert brightness-0" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold tracking-tight text-white leading-none">VoxIntel</h2>
            <span className="text-xs text-primary-200 font-medium">College Portal</span>
          </div>
        </Link>

        {/* College nav links - Only show if plan is active */}
        {hasPlan && (
          <div className="flex items-center gap-2">
            <Link
              href="/college/dashboard/add-students"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 font-medium transition-all"
            >
              <Users size={16} />
              Add Students
            </Link>
            <Link
              href="/college/dashboard/aptitude-round"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 font-medium transition-all"
            >
              <BookOpen size={16} />
              Aptitude Round
            </Link>
            <Link
              href="/college/dashboard/technical-round"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 font-medium transition-all"
            >
              <Code2 size={16} />
              Technical Round
            </Link>
          </div>
        )}

        <form action={signOut}>
          <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5 gap-2 rounded-xl transition-all">
            <LogOut size={18} />
            <span className="font-medium">Sign Out</span>
          </Button>
        </form>
      </nav>

      {children}
    </div>
  );
};

export default CollegeLayout;
