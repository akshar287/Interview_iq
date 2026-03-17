import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, BookOpen, Code2, GraduationCap, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getStudentsByCollege } from "@/lib/actions/college.action";

const CollegeDashboard = async () => {
  const user = await getCurrentUser();

  if (!user || user.type !== "college") {
    redirect("/college/sign-in");
  }

  const students = (await getStudentsByCollege(user.id)) as any[];

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* Welcome Banner */}
      <section className="glass-card px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <GraduationCap className="text-primary-200 size-8" />
            <h1 className="text-4xl font-bold text-white">
              Welcome, <span className="text-primary-200">{user.name}</span>
            </h1>
          </div>
          <p className="text-white/50 text-lg max-w-lg">
            Manage your students, schedule aptitude and technical rounds, and track placement progress from your college portal.
          </p>
          <p className="text-white/30 text-sm">{user.email}</p>
        </div>
        <div className="flex flex-col gap-3 items-end">
          <div className="glass-card px-8 py-5 text-center border-primary-200/30">
            <p className="text-4xl font-black text-primary-200">{students.length}</p>
            <p className="text-white/50 text-sm font-medium mt-1">Total Students</p>
          </div>
        </div>
      </section>

      {/* Quick Action Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/college/dashboard/add-students"
          className="glass-card p-8 border-white/5 hover:border-primary-200/40 transition-all group cursor-pointer"
        >
          <div className="size-12 rounded-2xl bg-primary-200/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <Users className="text-primary-200 size-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Add Students</h3>
          <p className="text-white/50 text-sm leading-relaxed mb-4">
            Register students with their name, year, and branch. Auto-generate login credentials.
          </p>
          <div className="flex items-center gap-2 text-primary-200 text-sm font-medium">
            Manage Students <ArrowRight size={14} />
          </div>
        </Link>

        <Link
          href="/college/dashboard/aptitude-round"
          className="glass-card p-8 border-white/5 hover:border-blue-400/40 transition-all group cursor-pointer"
        >
          <div className="size-12 rounded-2xl bg-blue-400/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <BookOpen className="text-blue-400 size-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Aptitude Round</h3>
          <p className="text-white/50 text-sm leading-relaxed mb-4">
            Schedule and manage aptitude assessments for your students in placement drives.
          </p>
          <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
            Manage Rounds <ArrowRight size={14} />
          </div>
        </Link>

        <Link
          href="/college/dashboard/technical-round"
          className="glass-card p-8 border-white/5 hover:border-purple-400/40 transition-all group cursor-pointer"
        >
          <div className="size-12 rounded-2xl bg-purple-400/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <Code2 className="text-purple-400 size-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Technical Round</h3>
          <p className="text-white/50 text-sm leading-relaxed mb-4">
            Assign and track technical interview rounds powered by AI for your students.
          </p>
          <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
            Manage Rounds <ArrowRight size={14} />
          </div>
        </Link>
      </section>

      {/* Recent Students - Grouped by Department */}
      {students.length > 0 && (
        <section className="flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Students by Department</h2>
          </div>
          
          {Object.entries(
            students.reduce((acc: any, student: any) => {
              const branch = student.branch || "General";
              if (!acc[branch]) acc[branch] = [];
              acc[branch].push(student);
              return acc;
            }, {})
          ).map(([branch, branchStudents]: [string, any]) => (
            <div key={branch} className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                <h3 className="text-xl font-semibold text-primary-200 uppercase tracking-widest px-4 py-1 bg-primary-200/10 rounded-full border border-primary-200/20">
                  {branch}
                </h3>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branchStudents.map((student: any) => (
                  <Link
                    key={student.id}
                    href={`/college/dashboard/student/${student.id}`}
                    className="glass-card p-6 border-white/5 hover:border-primary-200/40 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-2xl bg-primary-200/20 flex items-center justify-center text-primary-200 font-bold text-xl group-hover:scale-110 transition-transform">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg">{student.name}</p>
                          <p className="text-white/40 text-xs">Year {student.year}</p>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-white/20 group-hover:text-primary-200 transition-colors" />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center justify-between text-xs px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-white/40">Student ID</span>
                        <span className="text-white/80 font-mono">{student.studentId}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-white/40">Tokens</span>
                        <span className="text-primary-200 font-bold">{student.tokens}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

    </div>
  );
};

export default CollegeDashboard;
