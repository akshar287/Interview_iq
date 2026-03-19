import { redirect } from "next/navigation";
import Agent from "@/components/Agent";
import { getCurrentUser, getStudentFromSession } from "@/lib/actions/auth.action";

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

const Page = async ({ searchParams }: PageProps) => {
  const [user, student] = await Promise.all([
    getCurrentUser(),
    getStudentFromSession()
  ]);

  if (!user && !student) redirect("/sign-in");

  const params = await searchParams;
  const position = params.position || "";
  const experience = params.experience || "";
  const fullName = params.fullName || user?.name || student?.name || "";
  const userId = user?.id || student?.firestoreId;
  const interviewId = params.interviewId || "";

  return (
    <>
      <div className="mb-5">
        <h3>Create Your Interview Profile</h3>
        {position && (
          <p className="text-light-400 text-sm mt-1">
            Role: <span className="text-primary-200 font-semibold">{position}</span>
            {experience && (
              <span> · Level: <span className="text-primary-200 font-semibold capitalize">{experience}</span></span>
            )}
          </p>
        )}
      </div>

      <Agent
        userName={fullName}
        userId={userId}
        interviewId={interviewId}
        type="generate"
        interviewPosition={position}
        interviewExperience={experience}
      />
    </>
  );
};

export default Page;
