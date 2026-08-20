import { useEffect, useState } from "react";
import {
  Bell, Building, CheckCircle, FileText, GraduationCap, ListChecks,
  TrendingUp, Users, BookOpen, ClipboardCheck
} from "lucide-react";
import { Bar, BarChart as RechartsBar, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie } from "recharts";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { hodService } from "../../services/HodService";
import { HodDashboardData } from "../../types/Hod";

export default function HodDashboard() {
  const [data, setData] = useState<HodDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hodService.getDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const progressData = (data?.studentProgressChart?.labels ?? []).map((label, i) => ({
    name: label,
    value: data?.studentProgressChart?.data?.[i] ?? 0,
  }));
  const statusData = (data?.researchStatusChart?.labels ?? []).map((label, i) => ({
    name: label,
    value: data?.researchStatusChart?.data?.[i] ?? 0,
    color: data?.researchStatusChart?.colors?.[i] ?? "#6366F1",
  }));
  const hasProgress = progressData.some(d => d.value > 0);
  const hasStatus = statusData.some(d => d.value > 0);

  const scholarshipFlow = [
    { label: "Coursework In Progress", value: data?.courseworkInProgress || 0 },
    { label: "Coursework Completed", value: data?.courseworkCompleted || 0 },
    { label: "Research In Progress", value: data?.researchInProgress || 0 },
    { label: "Thesis Submitted", value: data?.thesisSubmitted || 0 },
    { label: "Completed Scholars", value: data?.completedScholars || 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="relative">
          <p className="text-cyan-100 text-sm mb-1">HOD Dashboard</p>
          <h2 className="text-xl font-bold mb-1">Welcome, {data?.hodName || "HOD"}</h2>
          <p className="text-cyan-100 text-sm mb-4">{data?.departmentName || ""}{data?.collegeName ? ` · ${data.collegeName}` : ""}</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white/15 rounded-xl px-4 py-3"><p className="text-2xl font-bold">{data?.totalScholars || 0}</p><p className="text-cyan-100 text-xs">Scholars</p></div>
            <div className="bg-white/15 rounded-xl px-4 py-3"><p className="text-2xl font-bold">{data?.totalGuides || 0}</p><p className="text-cyan-100 text-xs">Guides</p></div>
            <div className="bg-white/15 rounded-xl px-4 py-3"><p className="text-2xl font-bold">{data?.activeResearchProjects || 0}</p><p className="text-cyan-100 text-xs">Active Projects</p></div>
            <div className="bg-white/15 rounded-xl px-4 py-3"><p className="text-2xl font-bold">{data?.completedResearch || 0}</p><p className="text-cyan-100 text-xs">Completed</p></div>
            <div className="bg-white/15 rounded-xl px-4 py-3"><p className="text-2xl font-bold">{data?.departmentsManaged || 0}</p><p className="text-cyan-100 text-xs">Departments</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Scholars" value={`${data?.totalScholars || 0}`} icon={GraduationCap} color="bg-blue-500" />
        <StatCard label="Total Guides" value={`${data?.totalGuides || 0}`} icon={Users} color="bg-green-500" />
        <StatCard label="Active Research" value={`${data?.activeResearchProjects || 0}`} icon={TrendingUp} color="bg-amber-500" />
        <StatCard label="Completed" value={`${data?.completedResearch || 0}`} icon={CheckCircle} color="bg-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <SectionHead title="Scholar Progress Distribution" />
          {hasProgress ? (
            <ResponsiveContainer width="100%" height={200}>
              <RechartsBar data={progressData} barSize={26}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: 12 }} />
                <Bar dataKey="value" name="Scholars" radius={[6, 6, 0, 0]}>
                  {progressData.map((d, i) => <Cell key={i} fill={data?.studentProgressChart?.colors?.[i] ?? "#06B6D4"} />)}
                </Bar>
              </RechartsBar>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground mt-3">No scholar progress data yet</p>
          )}
        </Card>

        <Card>
          <SectionHead title="Research Status" />
          {hasStatus ? (
            <div className="flex flex-col items-center gap-4">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center">
                {statusData.map((d, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    {d.name} ({d.value})
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-3">No research status data yet</p>
          )}
        </Card>

        <Card>
          <SectionHead title="PhD Scholarship Flow" />
          <div className="flex flex-col gap-2 mt-3">
            {scholarshipFlow.map((item) => (
              <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-sm font-bold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <SectionHead title="Research Statistics" />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{data?.researchStats?.totalResearchTopics || 0}</p>
              <p className="text-xs text-muted-foreground">Total Topics</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{data?.researchStats?.activeTopics || 0}</p>
              <p className="text-xs text-muted-foreground">Active Topics</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{data?.researchStats?.totalCategories || 0}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{data?.researchStats?.allocatedProjects || 0}</p>
              <p className="text-xs text-muted-foreground">Allocated</p>
            </div>
          </div>
          {data?.pendingTopicApprovals != null && (data.pendingTopicApprovals > 0 || data.pendingProposalApprovals > 0) && (
            <div className="flex flex-col gap-2 mt-3">
              {data.pendingTopicApprovals > 0 && (
                <div className="flex items-center gap-2 text-xs"><ClipboardCheck className="w-4 h-4 text-amber-500" /> {data.pendingTopicApprovals} topic approvals pending</div>
              )}
              {data.pendingProposalApprovals > 0 && (
                <div className="flex items-center gap-2 text-xs"><FileText className="w-4 h-4 text-blue-500" /> {data.pendingProposalApprovals} proposal approvals pending</div>
              )}
            </div>
          )}
        </Card>

        <Card>
          <SectionHead title="Recent Announcements" />
          {data?.announcements?.length ? (
            <div className="flex flex-col gap-2 mt-3">
              {data.announcements.map((a) => (
                <div key={a.id} className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-foreground">{a.title}</p>
                    <Badge variant={a.priority === "Urgent" ? "danger" : a.priority === "High" ? "warning" : "outline"}>
                      {a.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{a.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-3">No announcements yet</p>
          )}
        </Card>

        <Card>
          <SectionHead title="Notifications" />
          {data?.recentNotifications?.length ? (
            <div className="flex flex-col gap-2 mt-3">
              {data.recentNotifications.slice(0, 5).map((n) => (
                <div key={n.id} className={`p-2.5 rounded-lg text-xs ${n.isRead ? "" : "bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30"}`}>
                  <p className="font-medium text-foreground">{n.title}</p>
                  <p className="text-muted-foreground mt-0.5">{n.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-3">No notifications</p>
          )}
        </Card>
      </div>

      {data?.recentActivity?.length ? (
        <Card>
          <SectionHead title="Recent Activity" />
          <div className="flex flex-col gap-3 mt-3">
            {data.recentActivity.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <ListChecks className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">{item.userName} · {new Date(item.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
