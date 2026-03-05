"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
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

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-sm">
            <div
                className="w-full max-w-md rounded-2xl bg-[#0f1117] border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start p-6 pb-0 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                            Start Your Interview
                        </h2>
                        <p className="text-sm text-light-400">
                            Provide your details to begin your AI-powered interview
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-light-400 hover:text-white transition-colors text-lg leading-none ml-4 flex-shrink-0"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 overflow-y-auto px-6 py-5 flex-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
                    {/* Full Name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-white">
                            Full Name <span className="text-red-400">*</span>
                        </label>
                        <div className="flex items-center gap-3 bg-[#161925] border border-white/10 rounded-xl px-4 py-3 focus-within:border-white/30 transition-colors">
                            <span className="text-light-400 flex-shrink-0">👤</span>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                value={form.fullName}
                                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                required
                                className="bg-transparent text-white flex-1 outline-none text-sm placeholder:text-white/30"
                            />
                        </div>
                    </div>

                    {/* Position */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-white">
                            Position Applying For <span className="text-red-400">*</span>
                        </label>
                        <div className="flex items-center gap-3 bg-[#161925] border border-white/10 rounded-xl px-4 py-3 focus-within:border-white/30 transition-colors">
                            <span className="text-light-400 flex-shrink-0">💼</span>
                            <select
                                value={form.position}
                                onChange={(e) => setForm({ ...form, position: e.target.value })}
                                required
                                className="bg-transparent text-white flex-1 outline-none text-sm appearance-none cursor-pointer"
                            >
                                <option value="" disabled className="bg-[#161925] text-white/40">Select a position</option>
                                {POSITIONS.map((p) => (
                                    <option key={p} value={p} className="bg-[#161925] text-white">{p}</option>
                                ))}
                            </select>
                            <span className="text-light-400 pointer-events-none flex-shrink-0 text-xs">▼</span>
                        </div>
                    </div>

                    {/* Experience */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-white">
                            Years of Experience <span className="text-red-400">*</span>
                        </label>
                        <div className="flex items-center gap-3 bg-[#161925] border border-white/10 rounded-xl px-4 py-3 focus-within:border-white/30 transition-colors">
                            <span className="text-light-400 flex-shrink-0">🕒</span>
                            <select
                                value={form.experience}
                                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                                required
                                className="bg-transparent text-white flex-1 outline-none text-sm appearance-none cursor-pointer"
                            >
                                <option value="" disabled className="bg-[#161925] text-white/40">Select experience level</option>
                                {EXPERIENCE_LEVELS.map((lvl) => (
                                    <option key={lvl.value} value={lvl.value} className="bg-[#161925] text-white">{lvl.label}</option>
                                ))}
                            </select>
                            <span className="text-light-400 pointer-events-none flex-shrink-0 text-xs">▼</span>
                        </div>
                    </div>

                    {/* Resume */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-white">
                            Resume <span className="text-white/40 font-normal">(Optional)</span>
                        </label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 hover:border-white/30 transition-all"
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
                                    <p className="text-xs text-white/40">Click to change file</p>
                                </>
                            ) : (
                                <>
                                    <span className="text-white/40 mb-1">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                    </span>
                                    <p className="text-sm font-semibold text-white">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-white/40">
                                        PDF, DOC, DOCX up to 10MB
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl font-bold text-sm text-[#0f1117] bg-white hover:bg-white/90 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>🎙️</span>
                            {loading ? "Starting..." : "Start Interview"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-3 rounded-xl font-semibold text-sm text-white/60 bg-transparent border border-white/10 hover:border-white/20 hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

