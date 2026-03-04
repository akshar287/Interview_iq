"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

const EXPERIENCE_LEVELS = [
    { label: "0-1 years (Entry Level)", value: "entry" },
    { label: "1-3 years (Junior)", value: "junior" },
    { label: "3-5 years (Mid Level)", value: "mid" },
    { label: "5-8 years (Senior)", value: "senior" },
    { label: "8+ years (Lead/Principal)", value: "lead" },
];

interface InterviewSetupModalProps {
    userId: string;
    userName: string;
    onClose: () => void;
}

export default function InterviewSetupModal({
    userId,
    userName,
    onClose,
}: InterviewSetupModalProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState({
        fullName: userName || "",
        position: "",
        experience: "",
    });
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File too large. Max 10MB.");
                return;
            }
            setResumeFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.position || !form.experience) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Saving your profile...");

        try {
            const payload = {
                userId,
                fullName: form.fullName,
                position: form.position,
                experience: form.experience,
                resumeFileName: resumeFile?.name || null,
                createdAt: new Date().toISOString(),
            };

            const res = await fetch("/api/interview-setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || "Failed to save setup");
            }

            toast.success("Profile saved! Starting interview...", { id: toastId });
            onClose();

            // Pass the position, experience, and new interviewId to the interview page
            const params = new URLSearchParams({
                position: form.position,
                experience: form.experience,
                fullName: form.fullName,
                interviewId: data.setupId,
            });
            router.push(`/interview?${params.toString()}`);
        } catch (err: any) {
            toast.error(err.message || "Something went wrong.", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/80 via-black/70 to-slate-900/90 backdrop-blur-md p-4 sm:p-6">
            <div
                className="relative w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-b from-[#20232d] via-[#151721] to-[#0d0f15] shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-white/10 bg-gradient-to-r from-white/5 via-transparent to-white/5">
                    <div>
                        <h2 className="text-xl font-semibold text-white tracking-tight">
                            Start Your Interview
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xs">
                            Provide your details to begin your AI-powered interview
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors text-base leading-none"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 pt-5 flex flex-col gap-5">
                    {/* Full Name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">
                            Full Name <span className="text-red-400">*</span>
                        </label>
                        <div className="flex items-center gap-3 bg-[#23252f]/90 hover:bg-[#262835] rounded-xl px-4 py-3 border border-white/10 focus-within:border-primary-200/80 focus-within:ring-2 focus-within:ring-primary-200/30 focus-within:ring-offset-1 focus-within:ring-offset-[#111318] transition-all duration-150">
                            <span className="text-gray-400 text-base shrink-0">👤</span>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                value={form.fullName}
                                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                required
                                className="bg-transparent text-white flex-1 outline-none text-sm placeholder:text-gray-500/80"
                            />
                        </div>
                    </div>

                    {/* Position */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">
                            Position Applying For <span className="text-red-400">*</span>
                        </label>
                        <div className="flex items-center gap-3 bg-[#23252f] rounded-xl px-4 py-3 border border-white/10 hover:bg-[#262835] focus-within:border-primary-200/80 focus-within:ring-2 focus-within:ring-primary-200/30 focus-within:ring-offset-1 focus-within:ring-offset-[#111318] transition-all duration-150">
                            <span className="text-gray-400 text-base shrink-0">💼</span>
                            <select
                                value={form.position}
                                onChange={(e) => setForm({ ...form, position: e.target.value })}
                                required
                                className="bg-transparent text-white flex-1 outline-none text-sm appearance-none cursor-pointer pr-6"
                            >
                                <option value="" disabled className="bg-[#27282f]">Select a position</option>
                                {POSITIONS.map((p) => (
                                    <option key={p} value={p} className="bg-[#27282f]">{p}</option>
                                ))}
                            </select>
                            <span className="text-gray-400 text-sm pointer-events-none">▾</span>
                        </div>
                    </div>

                    {/* Experience */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">
                            Years of Experience <span className="text-red-400">*</span>
                        </label>
                        <div className="flex items-center gap-3 bg-[#23252f] rounded-xl px-4 py-3 border border-white/10 hover:bg-[#262835] focus-within:border-primary-200/80 focus-within:ring-2 focus-within:ring-primary-200/30 focus-within:ring-offset-1 focus-within:ring-offset-[#111318] transition-all duration-150">
                            <span className="text-gray-400 text-base shrink-0">🕐</span>
                            <select
                                value={form.experience}
                                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                                required
                                className="bg-transparent text-white flex-1 outline-none text-sm appearance-none cursor-pointer pr-6"
                            >
                                <option value="" disabled className="bg-[#27282f]">Select experience level</option>
                                {EXPERIENCE_LEVELS.map((lvl) => (
                                    <option key={lvl.value} value={lvl.value} className="bg-[#27282f]">{lvl.label}</option>
                                ))}
                            </select>
                            <span className="text-gray-400 text-sm pointer-events-none">▾</span>
                        </div>
                    </div>

                    {/* Resume */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">
                            Resume <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-white/15 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#181a22]/60 hover:border-primary-200/60 hover:bg-[#1f2230] transition-all duration-150"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            {resumeFile ? (
                                <>
                                    <span className="text-2xl">📄</span>
                                    <p className="text-sm text-primary-200 font-medium text-center line-clamp-1">
                                        {resumeFile.name}
                                    </p>
                                    <p className="text-xs text-gray-400">Click to change file</p>
                                </>
                            ) : (
                                <>
                                    <span className="text-2xl text-gray-400">⬆</span>
                                    <p className="text-sm text-white font-medium">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        PDF, DOC, DOCX up to 10MB
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 mt-2 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-medium text-sm sm:text-[0.9rem] text-gray-200 bg-[#1b1d26] hover:bg-[#242735] border border-white/15 hover:border-white/25 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl font-semibold text-sm sm:text-[0.9rem] text-dark-100 bg-gradient-to-r from-primary-200 to-primary-100 hover:from-primary-100 hover:to-primary-50 flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(180,83,246,0.45)] hover:shadow-[0_0_32px_rgba(192,132,252,0.7)] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            <span>📋</span>
                            {loading ? "Starting..." : "Start Interview"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
