"use client";

import { useState } from "react";
import InterviewSetupModal from "./InterviewSetupModal";

interface NewInterviewButtonProps {
    userId: string;
    userName: string;
}

export default function NewInterviewButton({ userId, userName }: NewInterviewButtonProps) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="btn-primary max-sm:w-full px-5 py-2 rounded-full font-bold text-sm cursor-pointer"
            >
                Create New Interview Profile
            </button>

            {showModal && (
                <InterviewSetupModal
                    userId={userId}
                    userName={userName}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}
