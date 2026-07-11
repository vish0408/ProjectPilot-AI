import { useState, useEffect } from "react";
import { BarChart2, Plus, GraduationCap, UserCheck, Building, CheckCircle, FlaskConical, Clock, Users, BookOpen } from "lucide-react";
import { Area, AreaChart, Bar, BarChart as RechartsBar, CartesianGrid, Cell, Legend, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { useApp } from "../../context/AppContext";
import { adminService } from "../../services/AdminService";
import type { AdminDashboardResponse } from "../../types/Admin";

export default function AdminDashboard() {
  const { user } = useApp();
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    Admin: "#2563EB", Student: "#22C55E", Guide: "#F59E0B", HOD: "#8B5CF6"
  };
  const pieData = data ? Object.entries(data.usersByRole).map(([name, value]) => ({ name, value })) : [];
  const monthlyData = [
    { month: "Jan", submissions: 65, approvals: 40, meetings: 28 },
    { month: "Feb", submissions: 78, approvals: 52, meetings: 32 },
    { month: "Mar", submissions: 90, approvals: 61, meetings: 35 },
    { month: "Apr", submissions: 82, approvals: 58, meetings: 30 },
    { month: "May", submissions: 95, approvals: 70, meetings: 38 },
    { month: "Jun", submissions: 110, approvals: 85, meetings: 42 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:"radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",backgroundSize:"40px 40px"}}/>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div><p className="text-slate-300 text-sm mb-0.5">System Administrator</p><h2 className="text-xl font-bold">{user?.institution || "ResearchHub AI"}</h2><p className="text-slate-300 text-sm mt-0.5">{data?.totalUsers || 0} total users · {data?.totalColleges || 0} colleges · Services operational</p></div>
          <div className="flex gap-2"><button className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2"><Plus className="w-4 h-4"/>Add User</button><button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2"><BarChart2 className="w-4 h-4"/>Analytics</button></div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={`${data?.totalStudents || 0}`} icon={GraduationCap} color="bg-blue-500" />
        <StatCard label="Research Guides" value={`${data?.totalGuides || 0}`} sub="Active" icon={UserCheck} color="bg-indigo-500"/>
        <StatCard label="Departments" value={`${data?.totalDepartments || 0}`} sub="Across colleges" icon={Building} color="bg-cyan-500"/>
        <StatCard label="HODs" value={`${data?.totalHods || 0}`} icon={CheckCircle} color="bg-green-500"/>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={`${data?.totalUsers || 0}`} icon={Users} color="bg-violet-500"/>
        <StatCard label="Colleges" value={`${data?.totalColleges || 0}`} icon={BookOpen} color="bg-amber-500"/>
        <StatCard label="Active Academic Years" value={`${data?.activeAcademicYears || 0}`} icon={Clock} color="bg-teal-500"/>
        <StatCard label="Active Projects" value="-" icon={FlaskConical} color="bg-rose-500"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <SectionHead title="Monthly Activity" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
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
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionHead title="Users by Role" />
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
        </Card>
        <Card>
          <SectionHead title="Recent Activity" />
          <div className="flex flex-col gap-2.5 mt-2">
            {data?.recentLogs?.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border">
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{log.action}</p>
                  <p className="text-[10px] text-muted-foreground">{log.userName} · {log.entityName}</p>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">{new Date(log.timestamp).toLocaleDateString()}</span>
              </div>
            ))}
            {(!data?.recentLogs || data.recentLogs.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
