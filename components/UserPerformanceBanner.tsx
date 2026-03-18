import Link from "next/link";
import { MessageSquare, BookOpen, Code2, TrendingUp, BarChart3 } from "lucide-react";
import { getUserPerformanceSummary } from "@/lib/actions/general.action";

function StatPill({
  label, pct, count, icon, color, border,
}: {
  label: string; pct: number | null; count: number; icon: React.ReactNode; color: string; border: string;
}) {
  if (count === 0) return null;
  return (
    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl border ${border} bg-white/3`}>
      <span className={`${color} shrink-0`}>{icon}</span>
      <div className="flex flex-col leading-none">
        <span className="text-white/30 text-[10px] font-medium uppercase tracking-wider">{label} ({count})</span>
        <span className={`text-sm font-black ${color}`}>{pct !== null ? `${pct}%` : "—"}</span>
      </div>
    </div>
  );
}

export default async function UserPerformanceBanner({ userId }: { userId: string }) {
  const perf = await getUserPerformanceSummary(userId);

  const hasData = perf.interviewCount > 0 || perf.aptCount > 0 || perf.techCount > 0;

  return (
    <div className="w-full bg-[#09090b]/60 border-b border-white/5 px-8 py-2">
      <div className="flex items-center justify-between gap-4 flex-wrap max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-white/30 text-xs font-medium">
          <TrendingUp size={12} />
          <span className="uppercase tracking-wider">Your Performance</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {hasData ? (
            <>
              <StatPill
                label="AI Interviews"
                pct={perf.interviewAvg}
                count={perf.interviewCount}
                icon={<MessageSquare size={13} />}
                color="text-blue-400"
                border="border-blue-400/20"
              />
              <StatPill
                label="Aptitude"
                pct={perf.aptAvg}
                count={perf.aptCount}
                icon={<BookOpen size={13} />}
                color="text-primary-200"
                border="border-primary-200/20"
              />
              <StatPill
                label="Technical"
                pct={perf.techAvg}
                count={perf.techCount}
                icon={<Code2 size={13} />}
                color="text-purple-400"
                border="border-purple-400/20"
              />
            </>
          ) : (
            <div className="px-3 py-1.5 rounded-xl border border-white/5 bg-white/3 text-[10px] text-white/20 uppercase font-bold tracking-widest">
              No performance data yet
            </div>
          )}
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/40 hover:text-white hover:bg-white/5 transition-all border border-white/10"
          >
            <BarChart3 size={12} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
