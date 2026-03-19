"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  isDesktop?: boolean;
}

export default function HeaderShareButton({ isDesktop }: Props) {
  const handleShare = async () => {
    const shareData = {
      title: "Careerly",
      text: "Check out Careerly — AI-powered placement preparation suite for Aptitude, Technical & AI Mock Interviews!",
      url: "https://interview-iq-beta.vercel.app/",
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText("https://interview-iq-beta.vercel.app/");
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`${!isDesktop ? "md:hidden" : ""} size-11 rounded-xl bg-primary-200/10 border border-primary-200/20 text-primary-200 hover:text-white hover:bg-primary-200 transition-all shadow-lg active:scale-95`}
      onClick={handleShare}
      aria-label="Share Careerly"
    >
      <Share2 size={20} />
    </Button>
  );
}
