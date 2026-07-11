import { useEffect, useState } from "react";
import { Bell, Building, CheckCircle, FileText, GraduationCap, ListChecks, TrendingUp, Users } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { useApp } from "../../context/AppContext";
import { hodService } from "../../services/HodService";
import { HodDashboardData } from "../../types/Hod";

export default function HodDashboard() {
  const { user } = useApp();
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

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="relative">
          <p className="text-cyan-100 text-sm mb-1">HOD Dashboard</p>
          <h2 className="text-xl font-bold mb-1">Welcome, {user?.name}</h2>
          <p className="text-cyan-100 text-sm mb-4">{user?.dept} · {user?.institution}</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white/15 rounded-xl px-4 py-3"><p className="text-2xl font-bold">{data?.totalStudents || 0}</p><p className="text-cyan-100 text-xs">Students</p></div>
            <div className="bg-white/15 rounded-xl px-4 py-3"><p className="text-2xl font-bold">{data?.totalGuides || 0}</p><p className="text-cyan-100 text-xs">Guides</p></div>
            <div className="bg-white/15 rounded-xl px-4 py-3"><p className="text-2xl font-bold">{data?.activeProjects || 0}</p><p className="text-cyan-100 text-xs">Active Projects</p></div>
            <div className="bg-white/15 rounded-xl px-4 py-3"><p className="text-2xl font-bold">{data?.completedProjects || 0}</p><p className="text-cyan-100 text-xs">Completed</p></div>
            <div className="bg-white/15 rounded-xl px-4 py-3"><p className="text-2xl font-bold">{data?.pendingReviews || 0}</p><p className="text-cyan-100 text-xs">Pending Reviews</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={`${data?.totalStudents || 0}`} icon={GraduationCap} color="bg-blue-500" />
        <StatCard label="Total Guides" value={`${data?.totalGuides || 0}`} icon={Users} color="bg-green-500" />
        <StatCard label="Active Projects" value={`${data?.activeProjects || 0}`} icon={TrendingUp} color="bg-amber-500" />
        <StatCard label="Completed" value={`${data?.completedProjects || 0}`} icon={CheckCircle} color="bg-indigo-500" />
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
    </div>
  );
}
