"use client";

import { useState } from "react";
import { Check, Zap, Crown, Shield, ArrowRight, Coins, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addTokens } from "@/lib/actions/billing.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    id: "pro",
    name: "Pro Plan",
    price: "499",
    duration: "1 Month",
    tokens: 800,
    icon: Zap,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    shadow: "shadow-blue-400/10",
    features: [
      "800 AI Tokens included",
      "50 tokens per Aptitude test",
      "50 tokens per Technical test",
      "175 tokens per AI Interview",
      "Real-time interview feedback",
      "Priority AI processing",
    ],
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: "1299",
    duration: "3 Months",
    tokens: 2800,
    icon: Crown,
    color: "text-primary-200",
    bg: "bg-primary-200/10",
    border: "border-primary-200/20",
    shadow: "shadow-primary-200/10",
    popular: true,
    features: [
      "2800 AI Tokens included",
      "Best for intensive preparation",
      "50 tokens per Aptitude test",
      "50 tokens per Technical test",
      "175 tokens per AI Interview",
      "Advanced behavioral analytics",
      "Lifetime access to feedback history",
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string, tokens: number, planName: string) => {
    setLoading(planId);
    
    // Simulate payment processing delay
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: `Processing payment for ${planName}...`,
        success: async () => {
          const res = await addTokens(tokens, `Purchased ${planName}`);
          if (res.success) {
            router.refresh();
            setLoading(null);
            return `${planName} activated! ${tokens} tokens added.`;
          } else {
            setLoading(null);
            throw new Error(res.message);
          }
        },
        error: (err) => {
          setLoading(null);
          return `Payment failed: ${err.message}`;
        }
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="max-w-4xl w-full text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-200/10 border border-primary-200/20 text-primary-200 text-xs font-black uppercase tracking-widest">
          <Shield size={12} className="fill-primary-200" />
          SaaS Mock Interview Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">
          Fuel Your AI <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-blue-400">Preparation</span>
        </h1>
        <p className="text-xl text-white/50 max-w-2xl mx-auto">
          Choose a plan that fits your career goals. Get tokens to unlock premium AI mock interviews and deep technical assessments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {PLANS.map((plan) => (
          <div 
            key={plan.id}
            className={`glass-card relative p-10 flex flex-col gap-8 transition-all duration-500 hover:scale-[1.02] ${plan.border} ${plan.popular ? 'bg-primary-200/[0.03]' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary-200 to-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-200/20">
                Most Popular
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className={`size-14 rounded-2xl ${plan.bg} flex items-center justify-center`}>
                <plan.icon size={28} className={plan.color} />
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-1">
                  <span className="text-white font-black text-sm">₹</span>
                  <span className="text-5xl font-black text-white tracking-tight">{plan.price}</span>
                </div>
                <span className="text-white/30 text-xs font-bold uppercase tracking-widest mt-1">/ {plan.duration}</span>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
              <div className="flex items-center gap-2 text-primary-200">
                <Coins size={16} />
                <span className="font-bold">{plan.tokens.toLocaleString()} AI Tokens Included</span>
              </div>
            </div>

            <div className="h-px w-full bg-white/5" />

            <ul className="flex-1 space-y-4">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 group">
                  <div className={`size-5 rounded-full ${plan.bg} flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform`}>
                    <Check size={12} className={plan.color} strokeWidth={3} />
                  </div>
                  <span className="text-white/60 text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleUpgrade(plan.id, plan.tokens, plan.name)}
              disabled={loading !== null}
              className={`w-full h-16 rounded-2xl font-black text-lg transition-all active:scale-95 flex items-center gap-3 ${
                plan.popular 
                ? "bg-gradient-to-r from-primary-200 to-blue-600 text-white shadow-xl shadow-primary-200/20 hover:opacity-90" 
                : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
              }`}
            >
              {loading === plan.id ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight size={20} />
                </>
              )}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center space-y-6">
        <p className="text-white/30 text-xs font-black uppercase tracking-[0.3em]">Token Usage Breakdown</p>
        <div className="flex flex-wrap justify-center gap-8">
          {[
            { label: "AI Interview", cost: 175 },
            { label: "Technical Round", cost: 50 },
            { label: "Aptitude Round", cost: 50 },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className="text-white font-bold">{item.cost}</span>
              <span className="text-white/40 text-[10px] uppercase tracking-widest font-black">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
