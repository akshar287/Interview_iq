import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import AddStudentsClient from "@/components/AddStudentsClient";

const AddStudentsPage = async () => {
  const user = await getCurrentUser();

  if (!user || user.type !== "college") {
    redirect("/college/sign-in");
  }

  return <AddStudentsClient collegeId={user.id} collegeName={user.name} />;
};

export default AddStudentsPage;
