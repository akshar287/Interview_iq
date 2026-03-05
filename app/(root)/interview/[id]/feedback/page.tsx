import dayjs from "dayjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  MessageSquare,
  Zap,
  Users,
  CheckCircle2,
  XCircle,
  ArrowRight,
  UserCheck
} from "lucide-react";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import RadarChart from "@/components/RadarChart";
import FeedbackHighlight from "@/components/FeedbackHighlight";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  if (!feedback) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <h1 className="text-4xl font-bold text-white">Feedback Pending</h1>
        <p className="text-white/60 max-w-md">We are still processing your interview analysis. Please check back in a few moments.</p>
        <Button className="btn-secondary" asChild>
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </section>
    );
  }

  // Split scores for visualization
  const scores = feedback.categoryScores.map(cat => ({
    name: cat.name,
    score: cat.score
  }));

  // Calculate generic fit percentages for display (mock logic if not in DB)
  const personalityFit = feedback.categoryScores.find(s => s.name === "Cultural & Role Fit")?.score || 85;
  const technicalFit = feedback.categoryScores.find(s => s.name === "Technical Knowledge")?.score || 80;

  return (
    <section className="section-feedback animate-fadeIn bg-slate-950/20 p-4 sm:p-8 rounded-[40px] border border-white/5">
      {/* Header Section */}
      <div className="flex flex-col gap-2 mb-10">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-2">
          Interview Complete!
        </h1>
        <h2 className="text-xl sm:text-2xl font-medium text-white/50">
          Final Analysis & Key Takeaways
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

        {/* Left Column: Rating & Radar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card flex-1 flex flex-col items-center justify-center">
            <div className="w-full mb-6">
              <h3 className="text-xl font-bold text-white/90 mb-1">Final Rating</h3>
              <p className="text-sm text-white/50">{personalityFit}% Personality Fit / {technicalFit}% Technical Fit</p>
            </div>

            <RadarChart scores={scores} size={280} />
          </div>
        </div>

        {/* Middle Column: Highlights & Personality */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-white/90">Analysis Highlights</h3>
            <FeedbackHighlight
              icon={MessageSquare}
              title="Communication Clarity"
              description={feedback.categoryScores.find(s => s.name === "Communication Skills")?.comment || "Analysis pending..."}
            />
            <FeedbackHighlight
              icon={Zap}
              title="Technical Accuracy"
              description={feedback.categoryScores.find(s => s.name === "Technical Knowledge")?.comment || "Analysis pending..."}
            />
            <FeedbackHighlight
              icon={Users}
              title="Personality Fit"
              description={feedback.categoryScores.find(s => s.name === "Cultural & Role Fit")?.comment || "Analysis pending..."}
            />
          </div>

          <div className="glass-card flex flex-col items-start gap-4">
            <h3 className="text-lg font-bold text-white/90">Personality Archetype</h3>
            <p className="text-xs text-white/50 leading-relaxed italic">
              Summary: {feedback.finalAssessment.slice(0, 150)}...
            </p>
            <div className="w-full flex flex-col items-center justify-center py-4 bg-white/5 rounded-2xl border border-white/[0.05]">
              <UserCheck className="size-12 text-primary-200 mb-2 drop-shadow-[0_0_15px_rgba(202,197,254,0.4)]" />
              <span className="text-xl font-bold text-white uppercase tracking-widest">{interview.level} Candidate</span>
            </div>
          </div>
        </div>

        {/* Right Column: Roadmap */}
        <div className="lg:col-span-4 flex flex-col h-full gap-6">
          <div className="glass-card flex-1 flex flex-col h-full">
            <h3 className="text-2xl font-bold text-white mb-2">Practice Roadmap</h3>
            <p className="text-sm text-white/50 mb-6">Key Improvement Areas</p>

            <div className="flex flex-col gap-4 flex-1 overflow-y-auto max-h-[300px] pr-2 scrollbar-hide">
              {feedback.areasForImprovement.map((area, idx) => (
                <div key={idx} className="roadmap-item group">
                  <div className="p-2 rounded-full bg-destructive-100/10 text-destructive-100 group-hover:bg-destructive-100/20 transition-all">
                    <XCircle size={18} />
                  </div>
                  <span className="text-sm text-white/80">{area}</span>
                </div>
              ))}
              {feedback.strengths.slice(0, 2).map((strength, idx) => (
                <div key={`s-${idx}`} className="roadmap-item group">
                  <div className="p-2 rounded-full bg-success-100/10 text-success-100 group-hover:bg-success-100/20 transition-all">
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="text-sm text-white/80">{strength}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 mt-8">
              <Button className="btn-glossy w-full flex items-center justify-between" asChild>
                <Link href={`/interview/${id}`}>
                  Schedule Next Session
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button className="btn-secondary w-full border-white/10 text-white/80 py-4" asChild>
                <Link href="/">
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Feedback;
