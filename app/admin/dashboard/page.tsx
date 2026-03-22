import { getAdminDashboardData } from "@/lib/actions/admin.action";
import { Users, GraduationCap, Building2, CheckCircle2, XCircle, ChevronRight, Activity } from "lucide-react";
import DeleteButton from "./DeleteButton";

export default async function AdminDashboard() {
  const { success, users, colleges, message } = await getAdminDashboardData();

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

      {/* Users & Colleges Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Colleges List */}
        <div className="card-border h-[600px]">
          <div className="card flex flex-col h-full bg-[#121620]/50 backdrop-blur-sm">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <GraduationCap className="text-orange-400" size={20} />
                  Registered Colleges
                </h3>
                <p className="text-white/40 text-xs mt-1">Institutions using the platform</p>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-3 custom-scrollbar">
              {colleges?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/30">
                  <p>No colleges found</p>
                </div>
              ) : (
                colleges?.map((college: any) => (
                  <div key={college.id} className="group p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: college.isPlanActive ? '#34d399' : 'rgba(255,255,255,0.1)' }} />
                    <div className="flex-1 min-w-0 pr-4 pl-2">
                      <p className="text-sm font-bold text-white truncate">{college.name}</p>
                      <p className="text-xs text-white/50 truncate flex items-center gap-2 mt-0.5">
                        {college.email}
                      </p>
                      {college.planExpiry && (
                        <p className="text-[10px] text-white/40 mt-1">
                          Expiry: {new Date(college.planExpiry).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center">
                      <div className="text-right">
                        <p className="text-xs font-bold text-white mb-0.5 uppercase tracking-wider px-2 py-0.5 rounded inline-block" style={{ background: college.plan === 'None' ? 'rgba(255,255,255,0.1)' : 'rgba(167,139,250,0.15)', color: college.plan === 'None' ? 'rgba(255,255,255,0.5)' : '#a78bfa' }}>
                          {college.plan}
                        </p>
                        {college.isPlanActive && college.planExpiry ? (
                          <p className="text-[10px] text-emerald-400 flex items-center justify-end gap-1"><CheckCircle2 size={10} /> Active</p>
                        ) : college.plan !== 'None' ? (
                          <p className="text-[10px] text-red-400 flex items-center justify-end gap-1"><XCircle size={10} /> Expired</p>
                        ) : null}
                      </div>
                      <DeleteButton id={college.id} type="college" name={college.name} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="card-border h-[600px]">
          <div className="card flex flex-col h-full bg-[#121620]/50 backdrop-blur-sm">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Users className="text-blue-400" size={20} />
                  Registered Users
                </h3>
                <p className="text-white/40 text-xs mt-1">Individual candidates on the platform</p>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-3 custom-scrollbar">
              {users?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/30">
                  <p>No users found</p>
                </div>
              ) : (
                users?.map((user: any) => (
                  <div key={user.id} className="group p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: user.isPlanActive ? '#34d399' : 'rgba(255,255,255,0.1)' }} />
                    <div className="flex-1 min-w-0 pr-4 pl-2">
                      <p className="text-sm font-bold text-white truncate">{user.name}</p>
                      <p className="text-xs text-white/50 truncate flex items-center gap-2 mt-0.5">
                        {user.email}
                      </p>
                      {user.planExpiry && (
                        <p className="text-[10px] text-white/40 mt-1">
                          Expiry: {new Date(user.planExpiry).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center">
                      <div className="text-right">
                        <p className="text-xs font-bold text-white mb-0.5 flex flex-col items-end gap-1">
                          <span className="uppercase tracking-wider px-2 py-0.5 rounded inline-block bg-white/5 text-white/60">
                            {user.plan}
                          </span>
                          {user.tokens > 0 && <span className="text-[10px] text-yellow-400 font-black">{user.tokens} tokens</span>}
                        </p>
                        {user.isPlanActive && user.planExpiry ? (
                          <p className="text-[10px] text-emerald-400 flex items-center justify-end gap-1"><CheckCircle2 size={10} /> Active</p>
                        ) : user.plan !== 'None' ? (
                          <p className="text-[10px] text-red-400 flex items-center justify-end gap-1"><XCircle size={10} /> Expired</p>
                        ) : null}
                      </div>
                      <DeleteButton id={user.id} type="users" name={user.name} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
