"use client";

import { useState } from "react";
import { Users, GraduationCap, CheckCircle2, XCircle, Search, Filter, AlertTriangle } from "lucide-react";
import DeleteButton from "./DeleteButton";
import MessageButton from "./MessageButton";

type UserData = {
  id: string;
  name: string;
  email: string;
  plan: string;
  planExpiry: string | null;
  isPlanActive: boolean;
  tokens: string | number;
};

type CollegeData = {
  id: string;
  name: string;
  email: string;
  plan: string;
  planExpiry: string | null;
  isPlanActive: boolean;
  studentsCount: number;
};

export default function AdminDataTables({ users = [], colleges = [] }: { users: UserData[], colleges: CollegeData[] }) {
  const [userSearch, setUserSearch] = useState("");
  const [collegeSearch, setCollegeSearch] = useState("");
  
  const [userPlanFilter, setUserPlanFilter] = useState("All");
  const [collegePlanFilter, setCollegePlanFilter] = useState("All");

  // Get unique plans for filter dropdowns
  const userPlans = ["All", ...Array.from(new Set(users.map(u => u.plan)))];
  const collegePlans = ["All", ...Array.from(new Set(colleges.map(c => c.plan)))];

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesPlan = userPlanFilter === "All" || u.plan === userPlanFilter;
    return matchesSearch && matchesPlan;
  });

  const filteredColleges = colleges.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(collegeSearch.toLowerCase()) || c.email.toLowerCase().includes(collegeSearch.toLowerCase());
    const matchesPlan = collegePlanFilter === "All" || c.plan === collegePlanFilter;
    return matchesSearch && matchesPlan;
  });

  // Group by plan
  const groupedUsers = filteredUsers.reduce((acc, user) => {
    if (!acc[user.plan]) acc[user.plan] = [];
    acc[user.plan].push(user);
    return acc;
  }, {} as Record<string, UserData[]>);

  const groupedColleges = filteredColleges.reduce((acc, college) => {
    if (!acc[college.plan]) acc[college.plan] = [];
    acc[college.plan].push(college);
    return acc;
  }, {} as Record<string, CollegeData[]>);

  const nowMs = Date.now();
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

  const expiringUsers = users.filter((u) => {
    if (!u.isPlanActive || !u.planExpiry) return false;
    const diff = new Date(u.planExpiry).getTime() - nowMs;
    return diff > 0 && diff <= threeDaysMs;
  });

  const expiringColleges = colleges.filter((c) => {
    if (!c.isPlanActive || !c.planExpiry) return false;
    const diff = new Date(c.planExpiry).getTime() - nowMs;
    return diff > 0 && diff <= threeDaysMs;
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Colleges List */}
      <div className="card-border h-[700px]">
        <div className="card flex flex-col h-full bg-[#121620]/50 backdrop-blur-sm">
          <div className="p-6 border-b border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <GraduationCap className="text-orange-400" size={20} />
                  Registered Colleges
                </h3>
                <p className="text-white/40 text-xs mt-1">Institutions using the platform</p>
              </div>
            </div>
            
            {/* Search & Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input 
                  type="text" 
                  placeholder="Search colleges..." 
                  value={collegeSearch}
                  onChange={(e) => setCollegeSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 transition-all"
                />
              </div>
              <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <select 
                  value={collegePlanFilter}
                  onChange={(e) => setCollegePlanFilter(e.target.value)}
                  className="appearance-none bg-white/5 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all cursor-pointer"
                >
                  {collegePlans.map(plan => <option key={plan} value={plan} className="bg-[#121620]">{plan} Plan</option>)}
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-6 space-y-6 custom-scrollbar">
            {Object.keys(groupedColleges).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/30">
                <p>No colleges found matching criteria</p>
              </div>
            ) : (
              Object.entries(groupedColleges).map(([planGroup, items]) => (
                <div key={planGroup} className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2 pb-1 border-b border-white/5">
                    {planGroup} Plan ({items.length})
                  </h4>
                  {items.map((college) => (
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
                        <div className="flex bg-white/5 p-1 rounded-lg ml-3 border border-white/5">
                          <MessageButton id={college.id} name={college.name} />
                          <DeleteButton id={college.id} type="college" name={college.name} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="card-border h-[700px]">
        <div className="card flex flex-col h-full bg-[#121620]/50 backdrop-blur-sm">
          <div className="p-6 border-b border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Users className="text-blue-400" size={20} />
                  Registered Users
                </h3>
                <p className="text-white/40 text-xs mt-1">Individual candidates on the platform</p>
              </div>
            </div>
            
            {/* Search & Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <select 
                  value={userPlanFilter}
                  onChange={(e) => setUserPlanFilter(e.target.value)}
                  className="appearance-none bg-white/5 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer"
                >
                  {userPlans.map(plan => <option key={plan} value={plan} className="bg-[#121620]">{plan} Plan</option>)}
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-6 space-y-6 custom-scrollbar">
            {Object.keys(groupedUsers).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/30">
                <p>No users found matching criteria</p>
              </div>
            ) : (
              Object.entries(groupedUsers).map(([planGroup, items]) => (
                <div key={planGroup} className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2 pb-1 border-b border-white/5">
                    {planGroup} Plan ({items.length})
                  </h4>
                  {items.map((user) => (
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
                            {Number(user.tokens) > 0 && <span className="text-[10px] text-yellow-400 font-black">{user.tokens} tokens</span>}
                          </p>
                          {user.isPlanActive && user.planExpiry ? (
                            <p className="text-[10px] text-emerald-400 flex items-center justify-end gap-1"><CheckCircle2 size={10} /> Active</p>
                          ) : user.plan !== 'None' ? (
                            <p className="text-[10px] text-red-400 flex items-center justify-end gap-1"><XCircle size={10} /> Expired</p>
                          ) : null}
                        </div>
                        <div className="flex bg-white/5 p-1 rounded-lg ml-3 border border-white/5">
                          <MessageButton id={user.id} name={user.name} />
                          <DeleteButton id={user.id} type="users" name={user.name} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Expiring Soon Section */}
      {(expiringUsers.length > 0 || expiringColleges.length > 0) && (
        <div className="card-border">
          <div className="card bg-[#121620]/50 backdrop-blur-sm border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.05)]">
            <div className="p-6 border-b border-white/5 flex items-center gap-3">
              <div className="bg-orange-500/20 p-2 rounded-xl border border-orange-500/30 text-orange-400">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-orange-400">Expiring in 3 Days</h3>
                <p className="text-white/40 text-xs">Accounts requiring immediate renewal attention</p>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expiring Colleges */}
              {expiringColleges.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2 border-b border-white/5 pb-2">
                    <GraduationCap size={14} /> Colleges ({expiringColleges.length})
                  </h4>
                  {expiringColleges.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-center justify-between">
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-bold text-white truncate">{c.name}</p>
                        <p className="text-[10px] text-orange-400 mt-0.5">
                          Expires: {new Date(c.planExpiry!).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex bg-white/5 p-1 rounded-lg border border-white/5 shrink-0">
                        <MessageButton id={c.id} name={c.name} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Expiring Users */}
              {expiringUsers.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2 border-b border-white/5 pb-2">
                    <Users size={14} /> Users ({expiringUsers.length})
                  </h4>
                  {expiringUsers.map((u) => (
                    <div key={u.id} className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-center justify-between">
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-bold text-white truncate">{u.name}</p>
                        <p className="text-[10px] text-orange-400 mt-0.5">
                          Expires: {new Date(u.planExpiry!).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex bg-white/5 p-1 rounded-lg border border-white/5 shrink-0">
                        <MessageButton id={u.id} name={u.name} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
