import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  ArrowLeft, 
  BookOpen, 
  Code2, 
  Mic2, 
  TrendingUp, 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getStudentDetails, getStudentPerformance } from "@/lib/actions/college.action";

const StudentProfilePage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user || user.type !== "college") {
    redirect("/college/sign-in");
  }

  const student = await getStudentDetails(id);
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <h1 className="text-2xl font-bold">Student not found</h1>
        <Link href="/college/dashboard" className="text-primary-200 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const performance = await getStudentPerformance(id);

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* Header & Back Button */}
      <div className="flex flex-col gap-6">
        <Link 
          href="/college/dashboard" 
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors w-fit"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
        
        <div className="glass-card p-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-primary-200/10 to-transparent">
          <div className="flex items-center gap-6">
            <div className="size-20 rounded-3xl bg-primary-200/20 flex items-center justify-center text-primary-200 font-bold text-4xl shadow-2xl shadow-primary-200/10">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-4xl font-extrabold text-white">{student.name}</h1>
              <p className="text-primary-200 font-medium tracking-wide uppercase text-sm">
                {student.branch} • Year {student.year}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-white/40 text-xs font-mono bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                  ID: {student.studentId}
                </span>
                <span className="text-white/40 text-xs font-mono bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                  Joined: {new Date(student.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="glass-card px-6 py-4 text-center border-primary-200/30">
              <p className="text-3xl font-black text-primary-200">{student.tokens}</p>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">Available Tokens</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Aptitude Section */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
              <BookOpen className="text-blue-400 size-5" />
            </div>
            <h2 className="text-xl font-bold">Aptitude Rounds</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            {performance.aptitude.length === 0 ? (
              <div className="glass-card p-8 border-white/5 text-center flex flex-col items-center gap-3">
                <AlertCircle className="text-white/20 size-8" />
                <p className="text-white/40 text-sm italic">No aptitude rounds attempted yet</p>
              </div>
            ) : (
              performance.aptitude.map((sub: any) => (
                <div key={sub.id} className="glass-card p-5 border-white/5 hover:border-blue-400/20 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <p className="font-bold text-white mb-1">Score: {sub.percentage}%</p>
                      <div className="flex items-center gap-2 text-white/40 text-[10px]">
                        <Calendar size={10} />
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    {sub.percentage >= 70 ? (
                      <CheckCircle2 size={18} className="text-green-400" />
                    ) : (
                      <TrendingUp size={18} className="text-blue-400 opacity-50" />
                    )}
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-400 transition-all" 
                      style={{ width: `${sub.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Technical Section */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
              <Code2 className="text-purple-400 size-5" />
            </div>
            <h2 className="text-xl font-bold">Technical Rounds</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            {performance.technical.length === 0 ? (
              <div className="glass-card p-8 border-white/5 text-center flex flex-col items-center gap-3">
                <AlertCircle className="text-white/20 size-8" />
                <p className="text-white/40 text-sm italic">No technical rounds attempted yet</p>
              </div>
            ) : (
              performance.technical.map((sub: any) => (
                <div key={sub.id} className="glass-card p-5 border-white/5 hover:border-purple-400/20 transition-all">
                   <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <p className="font-bold text-white mb-1">Score: {sub.score}/100</p>
                      <div className="flex items-center gap-2 text-white/40 text-[10px]">
                        <Clock size={10} />
                        Time Used: {Math.floor(sub.totalTimeUsed / 60)}m
                      </div>
                    </div>
                    <CheckCircle2 size={18} className="text-purple-400" />
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-400 transition-all" 
                      style={{ width: `${sub.score}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* AI Interviews Section */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary-200/10 flex items-center justify-center">
              <Mic2 className="text-primary-200 size-5" />
            </div>
            <h2 className="text-xl font-bold">AI Interviews</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            {performance.interviews.length === 0 ? (
              <div className="glass-card p-8 border-white/5 text-center flex flex-col items-center gap-3">
                <AlertCircle className="text-white/20 size-8" />
                <p className="text-white/40 text-sm italic">No AI interviews recorded yet</p>
              </div>
            ) : (
              performance.interviews.map((interview: any) => (
                <div key={interview.id} className="glass-card p-5 border-white/5 hover:border-primary-200/20 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                      <p className="font-bold text-white capitalize mb-1">{interview.role}</p>
                      <div className="flex items-center gap-2 text-white/40 text-[10px]">
                        <Calendar size={10} />
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {interview.feedback ? (
                      <div className="text-primary-200 font-black text-lg">
                        {interview.feedback.totalScore}
                      </div>
                    ) : (
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/40 uppercase">Finalizing</span>
                    )}
                  </div>
                  
                  {interview.feedback && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {interview.feedback.strengths?.slice(0, 2).map((s: string, idx: number) => (
                        <span key={idx} className="text-[9px] bg-green-400/10 text-green-400 border border-green-400/20 px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default StudentProfilePage;
