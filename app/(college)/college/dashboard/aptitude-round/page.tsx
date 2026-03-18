import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getAptitudeExamByCollege,
  getActiveSession,
  getAllSessions,
  getSubmissionsBySession,
} from "@/lib/actions/aptitude.action";
import AptitudeSetupClient from "@/components/AptitudeSetupClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const AptitudeRoundPage = async () => {
  const user = await getCurrentUser();

  if (!user || user.type !== "college") {
    redirect("/college/sign-in");
  }

  const [existingExam, activeSession, allSessions] = await Promise.all([
    getAptitudeExamByCollege(user.id),
    getActiveSession(user.id),
    getAllSessions(user.id),
  ]);

  // Fetch submissions for each session in parallel
  const submissionsBySession: Record<string, any[]> = {};
  if (allSessions.length > 0) {
    const results = await Promise.all(
      allSessions.map((s: any) => getSubmissionsBySession(s.id))
    );
    allSessions.forEach((s: any, i: number) => {
      submissionsBySession[s.id] = results[i];
    });
  }

  return (
    <div className="flex flex-col gap-10 pb-20">
      <Link
        href="/college/dashboard"
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors w-fit text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      <AptitudeSetupClient
        collegeId={user.id}
        collegeName={user.name}
        existingExam={existingExam}
        activeSession={activeSession}
        allSessions={allSessions}
        submissionsBySession={submissionsBySession}
      />
    </div>
  );
};

export default AptitudeRoundPage;
