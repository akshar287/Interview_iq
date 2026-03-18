"use server";

import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { activateCollegePlan } from "@/lib/actions/college.action";
import { redirect } from "next/navigation";
import { Check, Zap, Shield, GraduationCap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageProps {
    searchParams: Promise<{ students?: string }>;
}

export default async function CollegePricingPage({ searchParams }: PageProps) {
    const user = await getCurrentUser();
    if (!user || user.type !== "college") redirect("/college/sign-in");

    const params = await searchParams;
    const students = parseInt(params.students || "100");

    const plans = [
        {
            id: "base",
            name: "Base Plan",
            duration: "3 Months",
            costPerStudent: 900,
            tokensPerStudent: 1800,
            icon: GraduationCap,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20",
            features: [
                "1800 AI Tokens per student",
                "Full dashboard access",
                "Unlimited Aptitude Rounds",
                "Unlimited Technical Rounds",
                "Placement tracking",
                "Email support"
            ]
        },
        {
            id: "pro",
            name: "Pro Plan",
            duration: "6 Months",
            costPerStudent: 2100,
            tokensPerStudent: 4200,
            icon: Zap,
            color: "text-primary-200",
            bg: "bg-primary-200/10",
            border: "border-primary-200/20",
            features: [
                "4200 AI Tokens per student",
                "Priority dashboard access",
                "Advance Technical rounds",
                "AI Interview profile generation",
                "Detailed AI feedback",
                "1-on-1 support for admin"
            ],
            recommended: true
        }
    ];

    async function handlePlanActivation(planId: string, amount: number) {
        "use server";
        const result = await activateCollegePlan(user!.id, {
            plan: planId,
            studentLimit: students,
            amount: amount,
        });

        if (result.success) {
            redirect("/college/dashboard");
        }
    }

    return (
        <div className="flex flex-col gap-10 pb-20 max-w-6xl mx-auto px-4">
            <Link
                href="/college/dashboard"
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors w-fit text-sm font-medium pt-8"
            >
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <div className="flex flex-col items-center text-center gap-4 py-10">
                <h1 className="text-5xl font-black text-white tracking-tight">
                    Select Your <span className="text-primary-200">Growth Plan</span>
                </h1>
                <p className="text-white/40 text-xs mt-4">Secure billing provided by Careerly</p>
                <p className="text-white/50 text-xl max-w-2xl leading-relaxed">
                    Customized for <span className="text-white font-bold">{students} students</span>. 
                    Tokens are allocated to each student as soon as they are registered by you.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-4">
                {plans.map((plan) => (
                    <div 
                        key={plan.id}
                        className={`glass-card relative p-10 flex flex-col gap-8 transition-all hover:scale-[1.02] border-2 ${
                            plan.recommended ? "border-primary-200 shadow-[0_0_50px_rgba(255,255,255,0.05)]" : "border-white/5"
                        }`}
                    >
                        {plan.recommended && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-200 text-dark-100 text-xs font-black px-4 py-1.5 rounded-full tracking-widest uppercase">
                                Recommended
                            </div>
                        )}

                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-2">
                                <div className={`size-12 rounded-2xl ${plan.bg} flex items-center justify-center mb-2`}>
                                    <plan.icon className={plan.color} size={28} />
                                </div>
                                <h2 className="text-3xl font-bold text-white">{plan.name}</h2>
                                <span className="text-white/40 font-medium">{plan.duration} Subscription</span>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-black text-white">₹{(plan.costPerStudent * students).toLocaleString()}</div>
                                <div className="text-white/30 text-sm font-medium mt-1">Total for {students} students</div>
                            </div>
                        </div>

                        <div className="border-t border-white/5 pt-8 flex-1">
                            <div className="text-sm font-bold text-white/70 uppercase tracking-widest mb-6">What's included</div>
                            <ul className="flex flex-col gap-4">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-white/60">
                                        <div className="size-5 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                                            <Check size={12} className="text-success-100" />
                                        </div>
                                        <span className="text-sm font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <form action={handlePlanActivation.bind(null, plan.id, plan.costPerStudent * students)}>
                            <Button 
                                className={`w-full h-14 rounded-2xl font-black text-lg transition-all ${
                                    plan.recommended 
                                    ? "bg-primary-200 hover:bg-primary-200/90 text-dark-100 shadow-xl" 
                                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                }`}
                            >
                                Activate {plan.name}
                            </Button>
                        </form>
                    </div>
                ))}
            </div>

            <p className="text-center text-white/20 text-sm mt-12 flex items-center justify-center gap-2">
                <Shield size={14} /> Secure billing provided by Careely SaaS Logic. No hidden charges.
            </p>
        </div>
    );
}
