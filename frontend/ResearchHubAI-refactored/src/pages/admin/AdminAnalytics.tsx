import { useState, useEffect, useMemo } from "react";
import {
  Activity, AlertCircle, Award, BarChart2, Brain,
  Building, Database, FileText,
  GraduationCap, HeartPulse, Mail, Plus,
  School, Server, Settings, ShieldCheck, TrendingUp, UserCheck,
  UserPlus, Users,
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import StatCard from "../../components/cards/StatCard";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import Badge from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";
import { adminService } from "../../services/AdminService";
import type { AdminDashboardResponse, CollegeAnalyticsResponse } from "../../types/Admin";

type HealthStatus = "good" | "warning" | "error" | "unknown";

function HealthDot({ status }: { status: HealthStatus }) {
  const colors: Record<HealthStatus, string> = {
    good: "bg-emerald-500 shadow-emerald-500/40",
    warning: "bg-amber-500 shadow-amber-500/40",
    error: "bg-red-500 shadow-red-500/40",
    unknown: "bg-slate-300 dark:bg-slate-600",
  };
  return <span className={`w-2.5 h-2.5 rounded-full shadow-lg ${colors[status]}`} />;
}

interface HealthService {
  name: string;
  icon: typeof Database;
  status: HealthStatus;
  description: string;
}

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#14b8a6", "#f97316"];

export default function AdminAnalytics() {
  const { setScreen } = useApp();
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [collegeAnalytics, setCollegeAnalytics] = useState<CollegeAnalyticsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [serverTime, setServerTime] = useState(new Date());

  useEffect(() => {
    adminService.getDashboard()
      .then(setData)
      .catch((e) => { if (e instanceof Error) setError(e.message); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    adminService.getCollegeAnalytics()
      .then(setCollegeAnalytics)
      .catch((e) => { if (e instanceof Error) setAnalyticsError(e.message); })
      .finally(() => setAnalyticsLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setServerTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const safeData = data ?? ({} as AdminDashboardResponse);
  const isAllGood = !error && data !== null;

  const stats = useMemo(() => [
    { label: "Total Colleges", value: `${safeData.totalColleges ?? 0}`, icon: School, color: "bg-amber-500" },
    { label: "Total Users", value: `${safeData.totalUsers ?? 0}`, icon: Users, color: "bg-violet-500" },
    { label: "Total Students", value: `${safeData.totalStudents ?? 0}`, icon: GraduationCap, color: "bg-blue-500" },
    { label: "Total Guides", value: `${safeData.totalGuides ?? 0}`, sub: `${safeData.activeGuides ?? 0} active`, icon: UserCheck, color: "bg-indigo-500" },
    { label: "Total HODs", value: `${safeData.totalHods ?? 0}`, sub: `${safeData.activeHods ?? 0} active`, icon: Award, color: "bg-green-500" },
    { label: "Total College Admins", value: `${safeData.totalCollegeAdmins ?? 0}`, sub: `${safeData.activeCollegeAdmins ?? 0} active`, icon: ShieldCheck, color: "bg-purple-500" },
    { label: "Total Departments", value: `${safeData.totalDepartments ?? 0}`, icon: Building, color: "bg-cyan-500" },
    { label: "System Health", value: isAllGood ? "Operational" : "Error", icon: HeartPulse, color: isAllGood ? "bg-emerald-500" : "bg-red-500" },
  ], [safeData.totalColleges, safeData.totalUsers, safeData.totalStudents, safeData.totalGuides, safeData.activeGuides, safeData.totalHods, safeData.activeHods, safeData.totalCollegeAdmins, safeData.activeCollegeAdmins, safeData.totalDepartments, isAllGood]);

  const usersByRoleData = useMemo(() => {
    const roles = safeData.usersByRole ?? {};
    return Object.entries(roles).map(([name, value], idx) => ({ name, value, color: CHART_COLORS[idx % CHART_COLORS.length] }));
  }, [safeData.usersByRole]);

  const collegeDistData = useMemo(() => {
    return collegeAnalytics.map((c) => ({ name: c.name, departments: c.departmentCount }));
  }, [collegeAnalytics]);

  const healthServices = useMemo<HealthService[]>(() => [
    { name: "Database", icon: Database, status: isAllGood ? "good" : "error", description: isAllGood ? "Connected & operational" : "Connection failed" },
    { name: "API", icon: Activity, status: isAllGood ? "good" : "error", description: isAllGood ? "Responding normally" : "API unreachable" },
    { name: "Email Service", icon: Mail, status: "warning", description: "Status unavailable — check configuration" },
    { name: "AI Service", icon: Brain, status: "warning", description: "Status unavailable — check configuration" },
    { name: "Storage", icon: Server, status: "warning", description: "Status unavailable — check configuration" },
  ], [isAllGood]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">System Analytics</h2>
            <p className="text-xs text-muted-foreground">Overview of platform metrics and performance</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Platform Overview */}
      <div>
        <SectionHead title="Platform Overview" desc="Key metrics across all colleges" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} sub={"sub" in s ? s.sub : undefined} icon={s.icon} color={s.color} />
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role Chart */}
        <Card>
          <SectionHead title="Users by Role" desc="Distribution of users across roles" />
          <div className="mt-4">
            {usersByRoleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={usersByRoleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {usersByRoleData.map((entry, idx) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <Users className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-sm font-medium">No user data available</p>
              </div>
            )}
          </div>
        </Card>

        {/* College Distribution Chart */}
        <Card>
          <SectionHead title="College Distribution" desc="Departments per college" />
          <div className="mt-4">
            {collegeDistData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={collegeDistData} layout="vertical" margin={{ left: 100, right: 20, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="departments" fill="#6366f1" radius={[0, 4, 4, 0]} name="Departments" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <Building className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-sm font-medium">No college data available</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* College Overview */}
      <div>
        <SectionHead title="College Overview" desc="Real-time counts for each college" />
        {analyticsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : analyticsError ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
            <AlertCircle className="w-8 h-8 text-amber-500" />
            <p className="text-sm font-medium">Unable to load college data</p>
            <p className="text-xs text-muted-foreground/60">{analyticsError}</p>
          </div>
        ) : collegeAnalytics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {collegeAnalytics.map((c) => (
              <Card key={c.id} p={true}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <School className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-foreground truncate">{c.name}</h4>
                      <Badge variant={c.isActive ? "success" : "danger"}>{c.isActive ? "Active" : "Inactive"}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Code: {c.code}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border/60">
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-[10px] text-muted-foreground">Departments</p>
                    <p className="text-sm font-bold text-foreground">{c.departmentCount}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-[10px] text-muted-foreground">Students</p>
                    <p className="text-sm font-bold text-foreground">{c.studentCount}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-[10px] text-muted-foreground">Guides</p>
                    <p className="text-sm font-bold text-foreground">{c.guideCount}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-[10px] text-muted-foreground">HODs</p>
                    <p className="text-sm font-bold text-foreground">{c.hodCount}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-[10px] text-muted-foreground">Admins</p>
                    <p className="text-sm font-bold text-foreground">{c.collegeAdminCount}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-[10px] text-muted-foreground">Research</p>
                    <p className="text-sm font-bold text-foreground">{c.researchCount}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/60">
                  <p className="text-[10px] text-muted-foreground">
                    Created: {new Date(c.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                  <button
                    onClick={() => setScreen("university-mgmt")}
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    View
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
            <School className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-sm font-medium">No colleges registered</p>
            <p className="text-xs text-muted-foreground/60">Add a college to get started</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <SectionHead title="Quick Actions" desc="Common administrative tasks" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-2">
          <button onClick={() => setScreen("university-mgmt")}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-all text-sm font-semibold">
            <Plus className="w-4 h-4" /> Add College
          </button>
          <button onClick={() => setScreen("user-management")}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-all text-sm font-semibold">
            <UserPlus className="w-4 h-4" /> Add User
          </button>
          <button onClick={() => setScreen("department-mgmt")}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-950/40 transition-all text-sm font-semibold">
            <Building className="w-4 h-4" /> Add Department
          </button>
          <button onClick={() => setScreen("audit-logs")}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 transition-all text-sm font-semibold">
            <FileText className="w-4 h-4" /> View Reports
          </button>
          <button onClick={() => setScreen("system-settings")}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all text-sm font-semibold">
            <Settings className="w-4 h-4" /> System Settings
          </button>
        </div>
      </Card>

      {/* System Health */}
      <div>
        <SectionHead title="System Health" desc="Service status overview" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-4">
          {healthServices.map((svc) => {
            const borderMap: Record<HealthStatus, string> = {
              good: "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/10",
              warning: "border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/10",
              error: "border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/10",
              unknown: "border-slate-200 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-800/20",
            };
            return (
              <div key={svc.name} className={`flex items-start gap-3 p-4 rounded-xl border ${borderMap[svc.status]}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  svc.status === "good" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                  svc.status === "warning" ? "bg-amber-100 dark:bg-amber-900/30" :
                  svc.status === "error" ? "bg-red-100 dark:bg-red-900/30" :
                  "bg-slate-100 dark:bg-slate-700/30"
                }`}>
                  <svc.icon className={`w-4 h-4 ${
                    svc.status === "good" ? "text-emerald-600" :
                    svc.status === "warning" ? "text-amber-600" :
                    svc.status === "error" ? "text-red-600" :
                    "text-slate-400"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">{svc.name}</span>
                    <HealthDot status={svc.status} />
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5 line-clamp-2">{svc.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground/50 mt-2 text-right italic">
          Health checks are based on API availability. Detailed service monitoring coming soon.
        </p>
      </div>

      {/* System Information Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 rounded-xl bg-muted/30 border border-border/40">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Last Sync: ~1 min ago</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Server Time: {serverTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Application Version: 1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
