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

            // Pass the position and experience to the interview page as URL params
            // so Vapi can ask role/level-specific questions
            const params = new URLSearchParams({
                position: form.position,
                experience: form.experience,
                fullName: form.fullName,
            });
            router.push(`/interview?${params.toString()}`);
        } catch (err: any) {
            toast.error(err.message || "Something went wrong.", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div
                className="relative w-full max-w-md bg-[#1a1c20] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-bold text-white !text-xl !font-bold">Start Your Interview</h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Provide your details to begin your AI-powered interview
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors ml-4 mt-1 text-xl leading-none"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                    {/* Full Name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-white">
                            Full Name <span className="text-red-400">*</span>
                        </label>
                        <div className="flex items-center gap-3 bg-[#27282f] rounded-xl px-4 py-3 border border-white/10 focus-within:border-primary-200 transition-colors">
                            <span className="text-gray-400 text-base">👤</span>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                value={form.fullName}
                                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                required
                                className="bg-transparent text-white flex-1 outline-none text-sm placeholder:text-gray-500"
                            />
                        </div>
                    </div>

                    {/* Position */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-white">
                            Position Applying For <span className="text-red-400">*</span>
                        </label>
                        <div className="flex items-center gap-3 bg-[#27282f] rounded-xl px-4 py-3 border border-white/10 focus-within:border-primary-200 transition-colors">
                            <span className="text-gray-400 text-base">💼</span>
                            <select
                                value={form.position}
                                onChange={(e) => setForm({ ...form, position: e.target.value })}
                                required
                                className="bg-transparent text-white flex-1 outline-none text-sm appearance-none cursor-pointer"
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
                        <label className="text-sm font-semibold text-white">
                            Years of Experience <span className="text-red-400">*</span>
                        </label>
                        <div className="flex items-center gap-3 bg-[#27282f] rounded-xl px-4 py-3 border border-white/10 focus-within:border-primary-200 transition-colors">
                            <span className="text-gray-400 text-base">🕐</span>
                            <select
                                value={form.experience}
                                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                                required
                                className="bg-transparent text-white flex-1 outline-none text-sm appearance-none cursor-pointer"
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
                        <label className="text-sm font-semibold text-white">
                            Resume <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-white/20 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-200/60 transition-colors"
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
                                    <p className="text-sm text-primary-200 font-medium text-center">{resumeFile.name}</p>
                                    <p className="text-xs text-gray-400">Click to change</p>
                                </>
                            ) : (
                                <>
                                    <span className="text-2xl text-gray-400">⬆</span>
                                    <p className="text-sm text-white font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-400">PDF, DOC, DOCX up to 10MB</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 mt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-semibold text-white bg-[#27282f] hover:bg-[#3a3b44] transition-colors border border-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl font-semibold text-dark-100 bg-primary-200 hover:bg-primary-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
