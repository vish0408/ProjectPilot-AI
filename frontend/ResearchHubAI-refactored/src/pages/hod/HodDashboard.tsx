import { Component, useEffect, useState } from "react";
import {
  Users, Beaker, FileText, ClipboardList, UserCheck,
  Calendar, CheckCircle, Building2, Bell, Clock, RefreshCw, AlertTriangle
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { format, parseISO } from "date-fns";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { useApp } from "../../context/AppContext";
import { hodService } from "../../services/HodService";
import { HodDashboardData, ChartData } from "../../types/Hod";

/* ---------- error boundary ---------- */

interface EBProps { children: React.ReactNode; title?: string; }
interface EBState { hasError: boolean; }
class ChartErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <SectionHead title={this.props.title ?? "Chart"} />
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <p className="text-sm">Unable to load chart</p>
          </div>
        </Card>
      );
    }
    return this.props.children;
  }
}

/* ---------- helpers ---------- */

const statusBadge: Record<string, "success" | "warning" | "danger" | "info" | "purple" | "default" | "outline"> = {
  completed: "success", approved: "success", active: "info", scheduled: "info",
  pending: "warning", "in-progress": "purple", submitted: "info",
  rejected: "danger", cancelled: "danger", "on-hold": "outline",
};

function badgeVariant(s: string) {
  return statusBadge[s.toLowerCase()] ?? "default";
}

function fmtDate(d: string) {
  try { return format(parseISO(d), "MMM d, yyyy"); } catch { return d; }
}

function fmtDateTime(d: string) {
  try { return format(parseISO(d), "MMM d, h:mm a"); } catch { return d; }
}

/* ---------- skeleton ---------- */

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`} />;
}

/* ---------- chart renderer ---------- */

interface ChartBoxProps {
  data?: ChartData;
  type: "bar" | "pie" | "donut" | "hbar" | "line";
  title: string;
  spanFull?: boolean;
}

function ChartBox({ data, type, title }: ChartBoxProps) {
  const empty = !data || !data.labels?.length || !data.data?.length;

  if (empty) {
    return (
      <Card>
        <SectionHead title={title} />
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No data available</div>
      </Card>
    );
  }

  const items = data!.labels.map((l, i) => ({
    name: l,
    value: data!.data[i] ?? 0,
    fill: data!.colors?.[i] ?? "#94a3b8",
  }));

  /* pie / donut */
  if (type === "pie" || type === "donut") {
    return (
      <Card>
        <SectionHead title={title} />
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={items}
              dataKey="value"
              nameKey="name"
              cx="50%" cy="50%"
              outerRadius={85}
              innerRadius={type === "donut" ? 55 : 0}
              label={({ name, percent }: { name: string; percent: number }) =>
                `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {items.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    );
  }

  /* horizontal bar */
  if (type === "hbar") {
    return (
      <Card>
        <SectionHead title={title} />
        <ResponsiveContainer width="100%" height={Math.max(200, items.length * 32)}>
          <BarChart data={items} layout="vertical" margin={{ left: 100, right: 20, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
            <Tooltip />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {items.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    );
  }

  /* vertical bar / line */
  const Chart = type === "line" ? LineChart : BarChart;
  return (
    <Card>
      <SectionHead title={title} />
      <ResponsiveContainer width="100%" height={250}>
        <Chart data={items} margin={{ left: 0, right: 20, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          {type === "line" ? (
            <Line type="monotone" dataKey="value" stroke="#0e7490" strokeWidth={2} dot={{ fill: "#0e7490" }} />
          ) : (
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {items.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Bar>
          )}
        </Chart>
      </ResponsiveContainer>
    </Card>
  );
}

/* ---------- page component ---------- */

export default function HodDashboard() {
  const { user } = useApp();
  const [data, setData] = useState<HodDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    hodService.getDashboard()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load dashboard"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  /* ---- loading skeleton ---- */
  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-36 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start gap-4">
                <Skeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-7 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-48 w-full" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <Skeleton className="h-4 w-32 mb-4" />
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex gap-3 mb-3">
                  <Skeleton className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-3/4 mb-1" />
                    <Skeleton className="h-2 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---- error state ---- */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 max-w-md text-center">
          <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-1">Failed to load dashboard</p>
          <p className="text-xs text-red-500 dark:text-red-400/80">{error}</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium transition-colors">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  /* ---- empty / no data ---- */
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm">No dashboard data available</p>
      </div>
    );
  }

  /* ---- stat card config ---- */
  const stats = [
    { label: "Total Students",              value: String(data.totalStudents ?? 0),              icon: Users,        color: "bg-blue-500" },
    { label: "Active Research Projects",     value: String(data.activeResearchProjects ?? 0),     icon: Beaker,       color: "bg-cyan-500" },
    { label: "Pending Topic Approvals",      value: String(data.pendingTopicApprovals ?? 0),      icon: FileText,     color: "bg-amber-500" },
    { label: "Pending Proposal Approvals",   value: String(data.pendingProposalApprovals ?? 0),   icon: ClipboardList,color: "bg-orange-500" },
    { label: "Assigned Guides",              value: String(data.assignedGuides ?? 0),             icon: UserCheck,    color: "bg-green-500" },
    { label: "Meetings Scheduled",           value: String(data.meetingsScheduled ?? 0),           icon: Calendar,     color: "bg-violet-500" },
    { label: "Completed Research",           value: String(data.completedResearch ?? 0),            icon: CheckCircle,  color: "bg-emerald-500" },
    { label: "Departments Managed",          value: String(data.departmentsManaged ?? 0),          icon: Building2,    color: "bg-indigo-500" },
    { label: "Notifications",                value: String(data.notifications ?? 0),                icon: Bell,         color: "bg-rose-500" },
    { label: "Upcoming Deadlines",           value: String(data.upcomingDeadlines ?? 0),           icon: Clock,        color: "bg-red-500" },
  ];

  const pendingReviews = (data.pendingTopicApprovals ?? 0) + (data.pendingProposalApprovals ?? 0);

  return (
    <div className="flex flex-col gap-6">
      {/* ---------- gradient header ---------- */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-12 w-32 h-32 bg-white/5 rounded-full translate-y-10" />
        <div className="relative">
          <p className="text-cyan-100 text-sm mb-1">HOD Dashboard</p>
          <h2 className="text-xl font-bold mb-1">Welcome, {user?.name}</h2>
          <p className="text-cyan-100 text-sm mb-4">{user?.dept} · {user?.institution}</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white/15 rounded-xl px-4 py-3">
              <p className="text-2xl font-bold">{data.totalStudents ?? 0}</p>
              <p className="text-cyan-100 text-xs">Students</p>
            </div>
            <div className="bg-white/15 rounded-xl px-4 py-3">
              <p className="text-2xl font-bold">{data.assignedGuides ?? 0}</p>
              <p className="text-cyan-100 text-xs">Guides</p>
            </div>
            <div className="bg-white/15 rounded-xl px-4 py-3">
              <p className="text-2xl font-bold">{data.activeResearchProjects ?? 0}</p>
              <p className="text-cyan-100 text-xs">Active Projects</p>
            </div>
            <div className="bg-white/15 rounded-xl px-4 py-3">
              <p className="text-2xl font-bold">{data.completedResearch ?? 0}</p>
              <p className="text-cyan-100 text-xs">Completed</p>
            </div>
            <div className="bg-white/15 rounded-xl px-4 py-3">
              <p className="text-2xl font-bold">{pendingReviews}</p>
              <p className="text-cyan-100 text-xs">Pending Reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- stat cards (hide zeros) ---------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {stats.filter((s) => s.value !== "0").map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ---------- 5 charts ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartErrorBoundary title="Student Progress"><ChartBox data={data.studentProgressChart}    type="bar"   title="Student Progress" /></ChartErrorBoundary>
        <ChartErrorBoundary title="Research Status"><ChartBox data={data.researchStatusChart}     type="donut" title="Research Status" /></ChartErrorBoundary>
        <ChartErrorBoundary title="Guide Workload"><ChartBox data={data.guideWorkloadChart}      type="hbar"  title="Guide Workload" /></ChartErrorBoundary>
        <ChartErrorBoundary title="Monthly Activity"><ChartBox data={data.monthlyActivityChart}    type="bar"   title="Monthly Activity" /></ChartErrorBoundary>
        <div className="lg:col-span-2">
          <ChartErrorBoundary title="Approval Statistics"><ChartBox data={data.approvalStatisticsChart} type="pie" title="Approval Statistics" /></ChartErrorBoundary>
        </div>
      </div>

      {/* ---------- 3-column bottom ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* recent activity */}
        <Card>
          <SectionHead title="Recent Activity" />
          {data.recentActivity?.length ? (
            <div className="flex flex-col gap-0">
              {data.recentActivity.slice(0, 8).map((item, idx) => (
                <div key={item.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      item.type === "approval"  ? "bg-green-500" :
                      item.type === "submission"? "bg-blue-500" :
                      item.type === "meeting"   ? "bg-violet-500" :
                      "bg-amber-500"
                    }`} />
                    {idx < Math.min(data.recentActivity.length, 8) - 1 && <div className="w-px flex-1 bg-border" />}
                  </div>
                  <div className="flex-1 min-w-0 pb-3">
                    <p className="text-xs font-medium text-foreground">{item.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground">{item.userName}</span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground">{fmtDateTime(item.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          )}
        </Card>

        {/* upcoming meetings */}
        <Card>
          <SectionHead title="Upcoming Meetings" />
          {data.upcomingMeetings?.length ? (
            <div className="flex flex-col gap-3">
              {data.upcomingMeetings.slice(0, 6).map((m) => (
                <div key={m.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <Calendar className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{m.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {fmtDateTime(m.scheduledAt)} · {m.durationMinutes} min
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={badgeVariant(m.status)}>{m.status}</Badge>
                      <span className="text-[10px] text-muted-foreground">{m.guideName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming meetings</p>
          )}
        </Card>

        {/* recent submissions */}
        <Card>
          <SectionHead title="Recent Submissions" />
          {data.recentSubmissions?.length ? (
            <div className="flex flex-col gap-3">
              {data.recentSubmissions.slice(0, 6).map((s) => (
                <div key={s.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <FileText className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground line-clamp-1">{s.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {s.studentName} · {s.submissionType}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={badgeVariant(s.status)}>{s.status}</Badge>
                      <span className="text-[10px] text-muted-foreground">{fmtDate(s.submittedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent submissions</p>
          )}
        </Card>
      </div>
    </div>
  );
}
