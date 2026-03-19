import { Brain, Code2, Monitor, Target } from "lucide-react";

export default function HowToUseSection() {
  const steps = [
    {
      title: "1. Aptitude Round",
      icon: <Brain className="text-blue-400 size-6" />,
      desc: "Sharpen your logical reasoning, quantitative math, and analytical skills. Get real-time scoring to track your baseline performance.",
      instructions: ["Select your topics", "Solve AI-generated questions", "Get instant logic analysis"],
      bg: "bg-blue-500/5",
      border: "border-blue-500/10",
      iconBg: "bg-blue-500/10",
    },
    {
      title: "2. Technical Round",
      icon: <Code2 className="text-purple-400 size-6" />,
      desc: "Solve hands-on coding challenges across various languages. Write, compile, and execute code instantly to test your problem-solving abilities.",
      instructions: ["Choose your tech stack", "Implement the solution", "Analyze code efficiency"],
      bg: "bg-purple-500/5",
      border: "border-purple-500/10",
      iconBg: "bg-purple-500/10",
    },
    {
      title: "3. AI Mock Interviews",
      icon: <Monitor className="text-emerald-400 size-6" />,
      desc: "Experience realistic, high-pressure interview scenarios. Our AI analyzes both your behavioral responses and technical knowledge.",
      instructions: [
        "Create specific role-based interview",
        "View and track interview on dashboard",
        "Participate in the full AI Interview"
      ],
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/10",
      iconBg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="w-full mt-12 mb-16 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-10 text-center sm:text-left">
        <div className="size-14 rounded-[20px] bg-[#1a1c23] border border-white/10 flex items-center justify-center shrink-0 shadow-lg group-hover:border-primary-200/30 transition-colors">
          <Target className="text-primary-200/80 size-7" />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">How to Use Careerly</h2>
          <p className="text-white/40 font-medium pt-1 max-w-md">Follow these 3 steps to master your interview preparation and land your dream job.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, idx) => (
          <div 
            key={idx} 
            className={`p-8 rounded-[32px] border ${step.border} ${step.bg} backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:bg-opacity-10 group relative overflow-hidden`}
          >
            {/* Subtle light effect on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="flex items-center gap-5 mb-6 relative z-10">
              <div className={`p-4 ${step.iconBg} rounded-[20px] border border-white/5 shadow-inner transition-transform duration-300 group-hover:scale-110`}>
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">{step.title}</h3>
            </div>
            <p className="text-white/50 text-[15px] leading-relaxed font-medium relative z-10 mb-6 font-display">
              {step.desc}
            </p>

            <div className="relative z-10 space-y-3 pt-6 border-t border-white/5">
              {step.instructions.map((ins, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-white/40 group/item">
                  <div className={`size-1.5 rounded-full ${step.iconBg} transition-all group-hover/item:scale-150`} />
                  <span className="group-hover/item:text-white/60 transition-colors">{ins}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
