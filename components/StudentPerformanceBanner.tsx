"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Code2, TrendingUp, History, MessageSquare } from "lucide-react";
import { getUserPerformanceSummary } from "@/lib/actions/general.action";

interface StudentSession {
  firestoreId: string; name: string; studentId: string;
  year: string; branch: string; collegeId: string; collegeName: string;
}

function RoundStat({
  label, pct, icon, color, border,
}: {
  label: string; pct: number | null; icon: React.ReactNode; color: string; border: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border ${border} bg-white/3`}>
      <span className={`${color} shrink-0`}>{icon}</span>
      <div className="flex flex-col leading-none">
        <span className="text-white/30 text-[10px] font-medium uppercase tracking-wider">{label}</span>
        <span className={`text-sm font-black ${color}`}>
          {pct !== null ? `${pct}%` : "—"}
        </span>
      </div>
    </div>
  );
}

export default function StudentPerformanceBanner() {
  const [perf, setPerf] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem("studentSession");
    if (!raw) return;
    const session: StudentSession = JSON.parse(raw);

    getUserPerformanceSummary(session.firestoreId).then(setPerf);
  }, []);

  if (!perf) return null;
  if (perf.interviewCount === 0 && perf.aptCount === 0 && perf.techCount === 0) return null;

  return (
    <div className="w-full bg-[#09090b]/60 border-b border-white/5 px-8 py-2">
      <div className="flex items-center justify-between gap-4 flex-wrap max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-white/30 text-xs font-medium">
          <TrendingUp size={12} />
          <span className="uppercase tracking-wider">Round-wise Performance</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {perf.interviewCount > 0 && (
            <RoundStat
              label={`Interviews (${perf.interviewCount})`}
              pct={perf.interviewAvg}
              icon={<MessageSquare size={13} />}
              color="text-blue-400"
              border="border-blue-400/20"
            />
          )}
          {perf.aptCount > 0 && (
            <RoundStat
              label={`Aptitude (${perf.aptCount})`}
              pct={perf.aptAvg}
              icon={<BookOpen size={13} />}
              color="text-primary-200"
              border="border-primary-200/20"
            />
          )}
          {perf.techCount > 0 && (
            <RoundStat
              label={`Technical (${perf.techCount})`}
              pct={perf.techAvg}
              icon={<Code2 size={13} />}
              color="text-purple-400"
              border="border-purple-400/20"
            />
          )}
          <Link
            href="/student/dashboard"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/40 hover:text-white hover:bg-white/5 transition-all border border-white/10"
          >
            <History size={12} /> View History
          </Link>
        </div>
      </div>
    </div>
  );
}
