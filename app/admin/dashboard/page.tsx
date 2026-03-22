import { getAdminDashboardData } from "@/lib/actions/admin.action";
import { getAllAnnouncements } from "@/lib/actions/broadcast.action";
import { Users, GraduationCap, Building2, Activity, XCircle } from "lucide-react";
import AdminDataTables from "./AdminDataTables";
import AdminBroadcast from "./AdminBroadcast";

export default async function AdminDashboard() {
  const [adminData, broadcastData] = await Promise.all([
    getAdminDashboardData(),
    getAllAnnouncements()
  ]);

  const { success, users, colleges, message } = adminData;
  const announcements = broadcastData.success ? broadcastData.announcements || [] : [];

  if (!success) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-2">
          <XCircle className="mx-auto size-8 text-red-400 mb-2" />
          <h2 className="text-red-400 font-bold text-lg">Error loading data</h2>
          <p className="text-red-400/70 text-sm">{message}</p>
        </div>
      </div>
    );
  }

  const activeUsers = users?.filter((u: any) => u.isPlanActive) || [];
  const activeColleges = colleges?.filter((c: any) => c.isPlanActive) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black mb-2 tracking-tight">Platform Overview</h2>
        <p className="text-white/40 text-sm">Monitor all users, colleges, and current subscription plans.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="card-border">
          <div className="card p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Total Users</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-white">{users?.length || 0}</p>
                <span className="text-emerald-400 text-xs font-bold flex items-center">
                  <Activity size={12} className="mr-1" /> {activeUsers.length} Active
                </span>
              </div>
            </div>
            <div className="size-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Users size={28} className="text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card-border">
          <div className="card p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Total Colleges</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-white">{colleges?.length || 0}</p>
                <span className="text-emerald-400 text-xs font-bold flex items-center">
                  <Activity size={12} className="mr-1" /> {activeColleges.length} Active
                </span>
              </div>
            </div>
            <div className="size-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <GraduationCap size={28} className="text-orange-400" />
            </div>
          </div>
        </div>

        <div className="card-border">
          <div className="card p-6 flex flex-col justify-center bg-gradient-to-br from-emerald-500/10 to-teal-500/5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-emerald-400/80 text-xs font-bold uppercase tracking-wider">Estimated Revenue</p>
              <Building2 size={16} className="text-emerald-400/50" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-emerald-400">Coming Soon</p>
            </div>
            <p className="text-white/30 text-xs mt-2">Transactions module in development</p>
          </div>
        </div>
      </div>

      <AdminBroadcast initialAnnouncements={announcements as any} />

      {/* Users & Colleges Tables Container */}
      <AdminDataTables users={users || []} colleges={colleges || []} />
    </div>
  );
}
