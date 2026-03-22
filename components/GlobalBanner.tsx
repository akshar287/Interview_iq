"use client";

import { useState, useEffect } from "react";
import { X, Megaphone } from "lucide-react";

export default function GlobalBanner({ announcements }: { announcements: any[] }) {
  const [visibleMessages, setVisibleMessages] = useState<any[]>([]);

  useEffect(() => {
    // Only show announcements we haven't dismissed yet
    const dismissed = JSON.parse(localStorage.getItem("dismissedAnnouncements") || "[]");
    setVisibleMessages(announcements.filter(a => !dismissed.includes(a.id)));
  }, [announcements]);

  const dismiss = (id: string) => {
    setVisibleMessages(prev => prev.filter(m => m.id !== id));
    const dismissed = JSON.parse(localStorage.getItem("dismissedAnnouncements") || "[]");
    localStorage.setItem("dismissedAnnouncements", JSON.stringify([...dismissed, id]));
  };

  if (visibleMessages.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col items-center p-2 sm:p-4 gap-2 pointer-events-none">
      {visibleMessages.map(msg => (
        <div 
          key={msg.id}
          className="pointer-events-auto bg-yellow-500 text-black px-4 py-2 sm:py-3 rounded-lg shadow-xl flex items-start sm:items-center justify-between gap-4 max-w-4xl w-full animate-in slide-in-from-top-4"
        >
          <div className="flex items-start sm:items-center gap-3">
            <div className="bg-black/10 p-1.5 rounded-md shrink-0">
              <Megaphone size={16} />
            </div>
            <p className="text-sm font-bold min-w-0 pr-4 leading-snug break-words">
              {msg.message}
            </p>
          </div>
          <button 
            onClick={() => dismiss(msg.id)}
            className="shrink-0 p-1 hover:bg-black/10 rounded-md transition-colors"
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
