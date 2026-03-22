"use client";

import { useState, useTransition } from "react";
import { Megaphone, Trash2, Send, Clock, Users, GraduationCap, Globe } from "lucide-react";
import { sendBroadcast, deleteBroadcast } from "@/lib/actions/broadcast.action";
import { toast } from "sonner";

type Announcement = {
  id: string;
  message: string;
  target: "users" | "colleges" | "both";
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
};

export default function AdminBroadcast({ initialAnnouncements }: { initialAnnouncements: Announcement[] }) {
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<"users" | "colleges" | "both">("both");
  const [isPending, startTransition] = useTransition();

  const handleSend = () => {
    if (!message.trim()) {
      toast.error("Please enter a message to broadcast.");
      return;
    }

    startTransition(async () => {
      const res = await sendBroadcast(message, target);
      if (res.success) {
        toast.success("Broadcast sent successfully!");
        setMessage("");
      } else {
        toast.error(`Error sending broadcast: ${res.message}`);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      startTransition(async () => {
        const res = await deleteBroadcast(id);
        if (res.success) {
          toast.success("Broadcast deleted.");
        } else {
          toast.error(`Error deleting broadcast: ${res.message}`);
        }
      });
    }
  };

  const getTargetIcon = (t: string) => {
    if (t === "users") return <Users size={12} />;
    if (t === "colleges") return <GraduationCap size={12} />;
    return <Globe size={12} />;
  };

  return (
    <div className="card-border mb-8">
      <div className="card flex flex-col md:flex-row bg-[#121620]/50 backdrop-blur-sm overflow-hidden">
        
        {/* Compose Section */}
        <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-white/5 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="text-yellow-400" size={24} />
            <div>
              <h3 className="text-lg font-black text-white">Broadcast Announcement</h3>
              <p className="text-white/40 text-xs mt-0.5">Send a global 24-hour notification to users or colleges.</p>
            </div>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isPending}
            placeholder="Write your announcement here..."
            className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-500/50 transition-all resize-none"
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              {(["both", "users", "colleges"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTarget(t)}
                  type="button"
                  className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all flex items-center gap-1.5 ${
                    target === t 
                      ? "bg-white/10 text-white shadow-sm" 
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {getTargetIcon(t)} {t}
                </button>
              ))}
            </div>

            <button
              onClick={handleSend}
              disabled={isPending || !message.trim()}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-yellow-500/20 text-yellow-500 font-bold hover:bg-yellow-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              {isPending ? "Sending..." : "Send Now"}
            </button>
          </div>
        </div>

        {/* History Section */}
        <div className="flex-1 flex flex-col h-72 md:h-auto max-h-[350px]">
          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <h4 className="text-sm font-bold flex items-center gap-2 text-white/70">
              <Clock size={16} /> Recent Broadcasts
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {initialAnnouncements.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/30 text-sm">
                No recent announcements
              </div>
            ) : (
              initialAnnouncements.map((announcement) => (
                <div key={announcement.id} className="group p-3 rounded-lg bg-white/5 border border-white/5 relative">
                  <div className="flex justify-between items-start mb-2 pr-6">
                    <p className="text-xs text-white/80 leading-relaxed pr-2">{announcement.message}</p>
                    <button 
                      onClick={() => handleDelete(announcement.id)}
                      disabled={isPending}
                      className="absolute right-3 top-3 text-white/20 hover:text-red-400 transition-colors"
                      title="Delete Broadcast"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-wider">
                    <span className="flex items-center gap-1 text-white/40">
                      {getTargetIcon(announcement.target)} {announcement.target}
                    </span>
                    <span className={announcement.isExpired ? "text-red-400" : "text-emerald-400"}>
                      {announcement.isExpired ? "Expired" : "Active"}
                    </span>
                    <span className="text-white/30 ml-auto">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
