import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import AddStudentsClient from "@/components/AddStudentsClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const AddStudentsPage = async () => {
  const user = await getCurrentUser();

  if (!user || user.type !== "college") {
    redirect("/college/sign-in");
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      <Link
        href="/college/dashboard"
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors w-fit text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      <AddStudentsClient collegeId={user.id} collegeName={user.name} />
    </div>
  );
};

export default AddStudentsPage;
