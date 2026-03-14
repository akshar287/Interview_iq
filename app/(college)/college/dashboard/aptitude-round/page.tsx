import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getAptitudeExamByCollege,
  getActiveSession,
  getAllSessions,
  getSubmissionsBySession,
} from "@/lib/actions/aptitude.action";
import AptitudeSetupClient from "@/components/AptitudeSetupClient";

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
