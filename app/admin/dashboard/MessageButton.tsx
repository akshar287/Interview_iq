"use client";

import { useTransition } from "react";
import { MessageSquare } from "lucide-react";
import { sendBroadcast } from "@/lib/actions/broadcast.action";
import { toast } from "sonner";

export default function MessageButton({ id, name }: { id: string, name: string }) {
  const [isPending, startTransition] = useTransition();

  const handleMessage = () => {
    const text = window.prompt(`Message for ${name}:\n\nThis will send a notification that expires in 24 hours.`, "");
    
    if (text !== null && text.trim() !== "") {
      startTransition(async () => {
        const res = await sendBroadcast(text.trim(), "individual", id);
        if (res.success) {
          toast.success(`Message sent to ${name}.`);
        } else {
          toast.error(`Error sending message: ${res.message}`);
        }
      });
    }
  };

  return (
    <button 
      onClick={handleMessage}
      disabled={isPending}
      className={`p-1.5 rounded-lg transition-colors ml-2 ${isPending ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-500/10 text-white/20 hover:text-blue-400"}`}
      title={`Direct Message to ${name}`}
    >
      <MessageSquare size={14} />
    </button>
  );
}
