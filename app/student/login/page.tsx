"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GraduationCap, LogIn, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { studentLogin } from "@/lib/actions/aptitude.action";

export default function StudentLoginPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !password.trim()) {
      toast.error("Please enter your Student ID and Password.");
      return;
    }

    setLoading(true);
    const result = await studentLogin({ studentId: studentId.trim(), password: password.trim() });
    setLoading(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    // Store student session in localStorage for simplicity
    if (typeof window !== "undefined") {
      localStorage.setItem("studentSession", JSON.stringify(result.student));
    }

    toast.success(`Welcome, ${result.student?.name}!`);
    router.push("/student/exam");
  };

  return (
    <div className="min-h-screen flex items-center justify-center pattern px-4">
      <div className="card-border w-full max-w-md">
        <div className="card flex flex-col gap-6 py-12 px-10">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="size-14 rounded-2xl bg-primary-200/10 flex items-center justify-center">
              <GraduationCap className="text-primary-200 size-7" />
            </div>
            <h2 className="text-2xl font-bold text-white">Student Portal</h2>
            <p className="text-white/50 text-sm">Log in with your college-issued credentials</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Student ID */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/70">Student ID</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. CS3RAH4521"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono placeholder:text-white/25 focus:outline-none focus:border-primary-200/50 focus:bg-white/8 transition-all"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/70">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-white/25 focus:outline-none focus:border-primary-200/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="h-12 text-base font-bold rounded-xl mt-2">
              {loading ? (
                <><Loader2 size={16} className="animate-spin mr-2" />Logging in...</>
              ) : (
                <><LogIn size={16} className="mr-2" />Login to Exam Portal</>
              )}
            </Button>
          </form>

          <p className="text-center text-white/30 text-xs">
            Use the Student ID and Password provided by your college.
          </p>
        </div>
      </div>
    </div>
  );
}
