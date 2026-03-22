"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteUserOrCollege } from "@/lib/actions/admin.action";
import { toast } from "sonner";

export default function DeleteButton({ id, type, name }: { id: string, type: "users" | "college", name: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to completely delete ${name}?\n\nThis will also delete them from Authentication. This action cannot be undone.`)) {
      startTransition(async () => {
        const res = await deleteUserOrCollege(id, type);
        if (res.success) {
          toast.success(`${name} deleted successfully.`);
        } else {
          toast.error(`Error deleting ${name}: ${res.message}`);
        }
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className={`p-1.5 rounded-lg transition-colors ml-2 ${isPending ? "opacity-50 cursor-not-allowed" : "hover:bg-red-500/10 text-white/20 hover:text-red-400"}`}
      title={`Delete ${name}`}
    >
      <Trash2 size={14} />
    </button>
  );
}
