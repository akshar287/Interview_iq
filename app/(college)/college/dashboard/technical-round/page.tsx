import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getTechnicalExamByCollege,
  getActiveTechSession,
  getAllTechSessions,
  getTechSubmissionsBySession,
} from "@/lib/actions/technical.action";
import TechnicalSetupClient from "@/components/TechnicalSetupClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const TechnicalRoundPage = async () => {
  const user = await getCurrentUser();

  if (!user || user.type !== "college") {
    redirect("/college/sign-in");
  }

  const [existingExam, activeSession, allSessions] = await Promise.all([
    getTechnicalExamByCollege(user.id),
    getActiveTechSession(user.id),
    getAllTechSessions(user.id),
  ]);

  // Fetch submissions for each session
  const submissionsBySession: Record<string, any[]> = {};
  if (allSessions.length > 0) {
    const results = await Promise.all(
      allSessions.map((s: any) => getTechSubmissionsBySession(s.id))
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
      <TechnicalSetupClient
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

export default TechnicalRoundPage;
