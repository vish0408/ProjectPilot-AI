import { useState, useEffect } from "react";
import { BarChart2, Plus, GraduationCap, UserCheck, Building, CheckCircle, FlaskConical, Clock, Users, BookOpen } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import StatCard from "../../components/cards/StatCard";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import WidgetErrorBoundary from "../../components/common/WidgetErrorBoundary";
import { useApp } from "../../context/AppContext";
import { adminService } from "../../services/AdminService";
import type { AdminDashboardResponse } from "../../types/Admin";

function SkeletonRow() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted rounded-2xl p-4 h-24" />
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted rounded-2xl p-4 h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-muted rounded-2xl p-4 h-64" />
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useApp();
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminService.getDashboard()
      .then((result) => { if (!cancelled) setData(result); })
      .catch((e) => { if (!cancelled && e instanceof Error) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <SkeletonRow />;

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-red-500">Unable to load dashboard</p>
        <p className="text-xs text-muted-foreground">{error}</p>
        <button onClick={() => { setError(null); setLoading(true); adminService.getDashboard().then(setData).catch(e => setError(e.message)).finally(() => setLoading(false)); }}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">Retry</button>
      </div>
    );
  }

  const roleLabel = user?.role === "superadmin" ? "Super Admin" : "College Admin";
  const roleColors: Record<string, string> = {
    "College Admin": "#2563EB", SuperAdmin: "#7C3AED", Student: "#22C55E", Guide: "#F59E0B", HOD: "#8B5CF6"
  };

  const safeData = data ?? ({} as AdminDashboardResponse);
  const usersByRole = safeData.usersByRole ?? {};
  const pieData = Object.entries(usersByRole).map(([name, value]) => ({ name, value }));
  const monthlyActivity = safeData.monthlyActivity ?? [];
  const recentLogs = safeData.recentLogs ?? [];
  const departmentStats = safeData.departmentStats ?? [];

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 mb-4">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:"radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",backgroundSize:"40px 40px"}}/>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-slate-300 text-sm mb-0.5">{roleLabel}</p>
            <h2 className="text-xl font-bold">{user?.institution || "ResearchHub AI"}</h2>
            <p className="text-slate-300 text-sm mt-0.5">{safeData.totalUsers ?? 0} total users · {safeData.totalColleges ?? 0} colleges · Services operational</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2"><Plus className="w-4 h-4"/>Add User</button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2"><BarChart2 className="w-4 h-4"/>Analytics</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={`${safeData.totalStudents ?? 0}`} icon={GraduationCap} color="bg-blue-500" />
        <StatCard label="Research Guides" value={`${safeData.totalGuides ?? 0}`} sub={`${safeData.activeGuides ?? 0} active`} icon={UserCheck} color="bg-indigo-500"/>
        <StatCard label="Departments" value={`${safeData.totalDepartments ?? 0}`} sub="Across colleges" icon={Building} color="bg-cyan-500"/>
        <StatCard label="HODs" value={`${safeData.totalHods ?? 0}`} sub={`${safeData.activeHods ?? 0} active`} icon={CheckCircle} color="bg-green-500"/>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={`${safeData.totalUsers ?? 0}`} icon={Users} color="bg-violet-500"/>
        <StatCard label="Colleges" value={`${safeData.totalColleges ?? 0}`} icon={BookOpen} color="bg-amber-500"/>
        <StatCard label="Active Academic Years" value={`${safeData.activeAcademicYears ?? 0}`} icon={Clock} color="bg-teal-500"/>
        <StatCard label="Active Projects" value={`${0}`} icon={FlaskConical} color="bg-rose-500"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WidgetErrorBoundary title="Monthly Activity">
          <Card>
            <SectionHead title="Monthly Activity" />
            {monthlyActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyActivity}>
                  <defs>
                    <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/><stop offset="95%" stopColor="#2563EB" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/><stop offset="95%" stopColor="#22C55E" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                  <XAxis dataKey="month" tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"12px",fontSize:12}}/>
                  <Area type="monotone" dataKey="submissions" stroke="#2563EB" fill="url(#colorSub)" strokeWidth={2.5} name="Submissions"/>
                  <Area type="monotone" dataKey="approvals" stroke="#22C55E" fill="url(#colorApp)" strokeWidth={2.5} name="Approvals"/>
                  <Area type="monotone" dataKey="meetings" stroke="#F59E0B" fill="url(#colorApp)" strokeWidth={2.5} name="Meetings"/>
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No activity data yet</p>
            )}
          </Card>
        </WidgetErrorBoundary>

        <WidgetErrorBoundary title="Users by Role">
          <Card>
            <SectionHead title="Users by Role" />
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <RechartsPieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={roleColors[entry.name] || "#888888"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"12px",fontSize:12}}/>
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No user data</p>
            )}
          </Card>
        </WidgetErrorBoundary>

        <WidgetErrorBoundary title="Recent Activity">
          <Card>
            <SectionHead title="Recent Activity" />
            <div className="flex flex-col gap-2.5 mt-2">
              {recentLogs.length > 0 ? recentLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border">
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{log.action}</p>
                    <p className="text-[10px] text-muted-foreground">{log.userName} · {log.entityName}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">{new Date(log.timestamp).toLocaleDateString()}</span>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </div>
          </Card>
        </WidgetErrorBoundary>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <WidgetErrorBoundary title="Department Statistics">
          <Card>
            <SectionHead title="Department Statistics" />
            {departmentStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-semibold text-foreground">Department</th>
                      <th className="text-right py-2 px-3 font-semibold text-foreground">Students</th>
                      <th className="text-right py-2 px-3 font-semibold text-foreground">Completed Projects</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentStats.map((dept, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="py-2.5 px-3 text-foreground">{dept.name}</td>
                        <td className="py-2.5 px-3 text-right text-muted-foreground">{dept.students}</td>
                        <td className="py-2.5 px-3 text-right text-muted-foreground">{dept.completed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No department statistics available</p>
            )}
          </Card>
        </WidgetErrorBoundary>
      </div>
    </div>
  );
}
