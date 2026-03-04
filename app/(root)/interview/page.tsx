import { redirect } from "next/navigation";
import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

const Page = async ({ searchParams }: PageProps) => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const params = await searchParams;
  const position = params.position || "";
  const experience = params.experience || "";
  const fullName = params.fullName || user?.name || "";
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
        userName={fullName || user?.name!}
        userId={user?.id}
        interviewId={interviewId}
        type="generate"
        interviewPosition={position}
        interviewExperience={experience}
      />
    </>
  );
};

export default Page;
