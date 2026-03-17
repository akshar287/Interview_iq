"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function GlobalBackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Define paths where the back button should NOT be shown
  const hiddenPaths = [
    "/",
    "/sign-in",
    "/college/sign-in",
    "/college/setup",
  ];

  if (hiddenPaths.includes(pathname)) {
    return null;
  }

  // Also hide on some exam pages where going back might be restricted, if necessary.
  if (pathname.includes("/student/exam")) {
    return null; // The exam page might have its own security logic that conflicts with a back button.
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-6 left-6 z-50 rounded-full shadow-lg bg-black/50 backdrop-blur-md border-white/20 hover:bg-white/20 text-white transition-all duration-300"
      onClick={() => router.back()}
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="sr-only">Go Back</span>
    </Button>
  );
}
