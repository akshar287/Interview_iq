export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated, signOut } from "@/lib/actions/auth.action";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import AmbientSound from "@/components/AmbientSound";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();

  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-primary-200 p-2 rounded-xl">
            <Image src="/logo.svg" alt="VoxIntel Logo" width={24} height={20} className="invert brightness-0" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">VoxIntel</h2>
        </Link>

        {isUserAuthenticated && (
          <form action={signOut}>
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5 gap-2 rounded-xl transition-all">
              <LogOut size={18} />
              <span className="font-medium">Sign Out</span>
            </Button>
          </form>
        )}
      </nav>

      {children}

      {/* Ambient office sound — plays softly in the background */}
      <AmbientSound />
    </div>
  );
};

export default Layout;
