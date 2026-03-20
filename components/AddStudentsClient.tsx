"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, Copy, CheckCircle, GraduationCap, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addStudent, getCollegeStudentStats } from "@/lib/actions/college.action";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const BRANCHES = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Data Science",
  "Artificial Intelligence & ML",
  "Cybersecurity",
];

const YEARS = ["1", "2", "3", "4"];

interface GeneratedCredential {
  name: string;
  studentId: string;
  password: string;
  year: string;
  branch: string;
}

export default function AddStudentsClient({ collegeId, collegeName }: { collegeId: string; collegeName: string }) {
  const [form, setForm] = useState({ name: "", year: "", branch: "" });
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<GeneratedCredential[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [stats, setStats] = useState<{ count: number; limit: number; plan: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getCollegeStudentStats(collegeId);
      setStats(data);
    };
    fetchStats();
  }, [collegeId]);

  const isLimitReached = stats ? stats.count >= stats.limit : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.year || !form.branch) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const result = await addStudent({
      collegeName,
      collegeId,
      name: form.name.trim(),
      year: form.year,
      branch: form.branch,
    });
    setLoading(false);

    if (!result.success) {
      toast.error(result.message);
      if (result.count !== undefined && result.limit !== undefined) {
         setStats(prev => prev ? { ...prev, count: result.count, limit: result.limit } : null);
      }
      return;
    }

    toast.success(`Student "${form.name}" added successfully!`);
    setCredentials((prev) => [result.student as GeneratedCredential, ...prev]);
    setStats(prev => prev ? { ...prev, count: (result.count || prev.count), limit: (result.limit || prev.limit) } : null);
    setForm({ name: "", year: "", branch: "" });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/[0.02] p-6 rounded-3xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary-200/10 flex items-center justify-center border border-primary-200/20 shadow-lg shadow-primary-200/5">
            <UserPlus className="text-primary-200 size-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white italic tracking-tight uppercase">Add Students</h1>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-0.5">Enrollment Management</p>
          </div>
        </div>

        {stats && (
           <div className={`flex items-center gap-4 px-5 py-3 rounded-2xl border transition-all duration-500 ${isLimitReached ? 'border-red-500/30 bg-red-500/5 shadow-lg shadow-red-500/5' : 'border-primary-200/20 bg-primary-200/5 shadow-lg shadow-primary-200/5'}`}>
              <div className={`size-10 rounded-xl flex items-center justify-center border ${isLimitReached ? 'bg-red-500/10 border-red-500/20' : 'bg-primary-200/10 border-primary-200/20'}`}>
                 <ShieldCheck size={20} className={isLimitReached ? 'text-red-400' : 'text-primary-200'} />
              </div>
              <div className="flex flex-col">
                 <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em] mb-0.5">Students Enrolled</p>
                 <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-black italic tracking-tighter ${isLimitReached ? 'text-red-400' : 'text-primary-200'}`}>
                      {stats.count}
                    </span>
                    <span className="text-white/20 text-sm font-bold">/ {stats.limit}</span>
                 </div>
              </div>
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Form */}
        <div className="glass-card p-8 border-white/5">
          <h2 className="text-xl font-bold mb-6 text-white">Student Details</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/70">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary-200/50 focus:bg-white/10 transition-all"
              />
            </div>

            {/* Year */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/70">Year of Study</label>
              <div className="flex gap-3">
                {YEARS.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, year: y }))}
                    className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                      form.year === y
                        ? "bg-primary-200 text-black"
                        : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {y}<sup className="text-xs">{y === "1" ? "st" : y === "2" ? "nd" : y === "3" ? "rd" : "th"}</sup>
                  </button>
                ))}
              </div>
            </div>

            {/* Branch */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/70">Branch</label>
              <div className="flex flex-wrap gap-2">
                {BRANCHES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, branch: b }))}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      form.branch === b
                        ? "bg-primary-200 text-black font-semibold"
                        : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {isLimitReached ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in duration-500">
                <AlertCircle className="text-red-400 size-8" />
                <div>
                  <h4 className="text-red-400 font-bold uppercase tracking-widest text-sm">Limit Reached</h4>
                  <p className="text-white/50 text-xs mt-1 leading-relaxed">
                    You have reached the maximum number of students allowed for your <strong>{stats?.plan}</strong> plan ({stats?.limit}).
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/college/setup")}
                  className="mt-2 border-red-500/30 text-red-400 hover:bg-red-500/10 w-full rounded-xl"
                >
                  Upgrade Plan
                </Button>
              </div>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                className="mt-2 h-12 text-base font-bold rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Adding Student...
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4 mr-2" />
                    Add Student & Generate Credentials
                  </>
                )}
              </Button>
            )}
          </form>
        </div>

        {/* Generated Credentials */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-white">Generated Credentials</h2>
          {credentials.length === 0 ? (
            <div className="glass-card p-8 border-white/5 flex flex-col items-center justify-center gap-3 text-center min-h-[200px]">
              <GraduationCap className="text-white/20 size-12" />
              <p className="text-white/40">No credentials generated yet.</p>
              <p className="text-white/25 text-sm">Add a student to see their login details here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
              {credentials.map((cred, idx) => (
                <div key={idx} className="glass-card p-5 border-primary-200/20 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-primary-200/20 flex items-center justify-center text-primary-200 font-bold">
                      {cred.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{cred.name}</p>
                      <p className="text-white/40 text-xs">{cred.branch} • Year {cred.year}</p>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-xl p-4 flex flex-col gap-2 font-mono text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/40">Student ID:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-primary-200 font-bold">{cred.studentId}</span>
                        <button
                          onClick={() => copyToClipboard(cred.studentId, `id-${idx}`)}
                          className="text-white/30 hover:text-white transition-colors"
                        >
                          {copiedId === `id-${idx}` ? (
                            <CheckCircle size={14} className="text-green-400" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/40">Password:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-300 font-bold">{cred.password}</span>
                        <button
                          onClick={() => copyToClipboard(cred.password, `pw-${idx}`)}
                          className="text-white/30 hover:text-white transition-colors"
                        >
                          {copiedId === `pw-${idx}` ? (
                            <CheckCircle size={14} className="text-green-400" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/25 text-xs">Share these credentials securely with the student.</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
