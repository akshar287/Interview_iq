"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Plus, User, Mail, Briefcase, Award, Users, Trash2 } from "lucide-react";
import { addIntern, getCompanyInterns, deleteIntern } from "@/lib/actions/company.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { useRouter } from "next/navigation";

const POSITIONS = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Fullstack Developer",
    "Data Scientist",
    "Product Manager",
    "UI/UX Designer",
    "DevOps Engineer",
    "Other",
];

const internSchema = z.object({
    name: z.string().min(2, "Name is required"),
    role: z.string().min(2, "Role is required"),
    experience: z.string().min(1, "Experience level is required"),
});

export default function CompanyDashboard() {
    const [user, setUser] = useState<any>(null);
    const [interns, setInterns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [recruitmentCount, setRecruitmentCount] = useState<number>(0);
    const [recommendedInterns, setRecommendedInterns] = useState<any[]>([]);
    const router = useRouter();

    const form = useForm<z.infer<typeof internSchema>>({
        resolver: zodResolver(internSchema),
        defaultValues: {
            name: "",
            role: "",
            experience: "",
        },
    });

    useEffect(() => {
        async function init() {
            const currentUser = await getCurrentUser();
            if (!currentUser || currentUser.type !== "company") {
                router.push("/sign-in");
                return;
            }
            setUser(currentUser);
            const data = await getCompanyInterns(currentUser.id);
            setInterns(data);
            setLoading(false);
        }
        init();
    }, [router]);

    async function onSubmit(values: z.infer<typeof internSchema>) {
        try {
            const result = await addIntern({
                companyId: user.id,
                companyName: user.name,
                ...values,
            });

            if (result.success) {
                toast.success("Intern added successfully!");
                setShowForm(false);
                form.reset();
                // Refresh intern list
                const data = await getCompanyInterns(user.id);
                setInterns(data);

                // Show credentials in a way company can copy
                alert(`Intern Created!\n\nID: ${result.internCredentials?.id}\nPassword: ${result.internCredentials?.password}\n\nPlease save these credentials.`);
            } else {
                toast.error(result.message || "Something went wrong");
            }
        } catch (error) {
            toast.error("Failed to add intern");
        }
    }

    async function handleDelete(uid: string) {
        if (!confirm("Are you sure you want to delete this intern? This action cannot be undone.")) return;

        try {
            const result = await deleteIntern(uid);
            if (result.success) {
                toast.success("Intern deleted successfully");
                setInterns(interns.filter(i => i.id !== uid));
            } else {
                toast.error(result.message || "Failed to delete intern");
            }
        } catch (error) {
            toast.error("An error occurred during deletion");
        }
    }

    function handleGetRecommendations() {
        if (recruitmentCount <= 0) {
            toast.error("Please enter a valid number of interns to recruit");
            return;
        }

        const scoringInterns = interns
            .filter(i => i.interviewStatus === "Completed" && i.lastInterviewScore !== undefined)
            .sort((a, b) => b.lastInterviewScore - a.lastInterviewScore);

        setRecommendedInterns(scoringInterns.slice(0, recruitmentCount));

        if (scoringInterns.length === 0) {
            toast.info("No completed interviews found to recommend.");
        } else {
            toast.success(`Found top ${Math.min(recruitmentCount, scoringInterns.length)} recommendations`);
        }
    }

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Company Dashboard</h1>
                    <p className="text-muted-foreground">{user?.name}</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "Add New Intern"}
                </Button>
            </div>

            {showForm && (
                <div className="glass-card p-6 max-w-md">
                    <h2 className="text-xl font-semibold mb-4">Add Intern Profile</h2>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Intern Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <FormControl>
                                            <select
                                                {...field}
                                                className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="" disabled className="bg-zinc-900">Select role</option>
                                                {POSITIONS.map((p) => (
                                                    <option key={p} value={p} className="bg-zinc-900">{p}</option>
                                                ))}
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="experience"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Experience Level</FormLabel>
                                        <FormControl>
                                            <select
                                                {...field}
                                                className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="" disabled className="bg-zinc-900">Select level</option>
                                                <option value="Intern" className="bg-zinc-900">Intern</option>
                                                <option value="Junior" className="bg-zinc-900">Junior</option>
                                                <option value="Mid" className="bg-zinc-900">Mid-level</option>
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">Generate Credentials</Button>
                        </form>
                    </Form>
                </div>
            )}

            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Managed Interns</h2>
                {interns.length === 0 ? (
                    <p className="text-muted-foreground">No interns added yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {interns.map((intern) => (
                            <div key={intern.id} className="glass-card p-4 border border-white/10 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold">{intern.name}</h3>
                                        <p className="text-sm text-primary-200">{intern.role}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(intern.id)}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">ID: {intern.email}</p>
                                <p className="text-xs text-muted-foreground">Password: {intern.password}</p>

                                <div className="mt-4 space-y-2">
                                    <div className={`text-xs p-2 rounded flex justify-between items-center ${intern.interviewStatus === "Completed"
                                        ? "bg-green-500/10 text-green-400"
                                        : "bg-black/20 text-muted-foreground"
                                        }`}>
                                        <span>Status: {intern.interviewStatus || "Pending"}</span>
                                        {intern.lastInterviewScore !== undefined && (
                                            <span className="font-bold">Score: {intern.lastInterviewScore}%</span>
                                        )}
                                    </div>

                                    {intern.lastInterviewId && (
                                        <Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>
                                            <Link href={`/interview/${intern.lastInterviewId}/feedback`}>
                                                View Full Feedback
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {interns.length > 0 && (
                <div className="glass-card p-6 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold">Recruitment Recommendations</h2>
                            <p className="text-sm text-muted-foreground">Identify top candidates based on scores.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Input
                                type="number"
                                placeholder="Number to recruit"
                                className="w-40"
                                value={recruitmentCount || ""}
                                onChange={(e) => setRecruitmentCount(parseInt(e.target.value))}
                            />
                            <Button onClick={handleGetRecommendations} variant="secondary">
                                Get Recommendations
                            </Button>
                        </div>
                    </div>

                    {recommendedInterns.length > 0 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-lg font-medium text-primary-200">Recommended Candidates:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {recommendedInterns.map((intern, idx) => (
                                    <div key={`rec-${intern.id}`} className="glass-card p-4 border border-primary-200/30 bg-primary-200/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2">
                                            <div className="bg-primary-200 text-slate-950 font-bold px-2 py-0.5 rounded-bl-lg text-[10px]">
                                                TOP #{idx + 1}
                                            </div>
                                        </div>
                                        <h4 className="font-bold">{intern.name}</h4>
                                        <p className="text-sm text-primary-200/80">{intern.role}</p>
                                        <div className="mt-4 flex justify-between items-center bg-black/40 p-2 rounded">
                                            <span className="text-xs font-medium">Interview Score:</span>
                                            <span className="text-sm font-black text-primary-200">{intern.lastInterviewScore}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
