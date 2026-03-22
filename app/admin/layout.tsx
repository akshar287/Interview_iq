import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { adminSignOut } from "@/lib/actions/admin.action";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("adminSession");

  if (!adminSession || adminSession.value !== "authenticated_admin") {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white selection:bg-primary-200/30 font-sans flex flex-col">
      <header className="sticky top-0 z-50 py-4 px-6 md:px-10 bg-[#0a0d14]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary-200 p-2 rounded-xl shadow-lg shadow-primary-200/20">
            <img
              src="/careerly-icon.png"
              alt="Logo"
              className="size-6 rounded-md object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase leading-none tracking-tight">
              <span className="text-teal-400">Career</span>
              <span className="text-orange-500">ly</span>
            </h1>
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/40">Admin Panel</p>
          </div>
        </div>

        <form action={adminSignOut}>
          <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-all text-white/70 hover:text-white">
            <LogOut size={16} />
            Sign Out
          </button>
        </form>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
