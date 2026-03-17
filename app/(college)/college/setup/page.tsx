"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CollegeSetupPage() {
    const [numStudents, setNumStudents] = useState<number>(100);
    const router = useRouter();

    const handleNext = () => {
        if (numStudents < 1) return;
        router.push(`/college/pricing?students=${numStudents}`);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="glass-card max-w-xl p-10 flex flex-col items-center gap-8 border-primary-200/20 shadow-2xl">
                <div className="size-20 rounded-3xl bg-primary-200/10 flex items-center justify-center">
                    <Users className="text-primary-200 size-10" />
                </div>
                
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold text-white tracking-tight">Complete Your Setup</h1>
                    <p className="text-white/50 text-lg">
                        Tell us approximately how many students you plan to register. We'll customize a plan that fits your college needs perfectly.
                    </p>
                </div>

                <div className="w-full flex flex-col gap-4">
                    <label className="text-sm font-semibold text-white/70 text-left">Estimated Number of Students</label>
                    <div className="relative group">
                        <input
                            type="number"
                            min="1"
                            value={numStudents}
                            onChange={(e) => setNumStudents(parseInt(e.target.value) || 0)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-2xl font-bold focus:outline-none focus:border-primary-200/50 transition-all text-center"
                            placeholder="e.g. 500"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 font-bold">Students</div>
                    </div>
                </div>

                <Button 
                    onClick={handleNext}
                    className="w-full h-14 rounded-2xl bg-primary-200 hover:bg-primary-200/90 text-dark-100 font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                    View Customized Plans <ArrowRight size={20} />
                </Button>

                <p className="text-white/30 text-xs">
                    You can always upgrade your plan later if your student count increases.
                </p>
            </div>
        </div>
    );
}
