import { useEffect, useState } from "react";
import {
  Brain,
  Check,
  Clock,
  FileText,
  TrendingUp
} from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import ProgressBar from "../../components/common/ProgressBar";
import SectionHead from "../../components/common/SectionHead";
import { useApp } from "../../context/AppContext";
import { studentService } from "../../services/StudentService";
import { DashboardData } from "../../types/Student";

export default function StudentDashboard() {
  const { user } = useApp();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    studentService.getDashboard()
      .then(setData)
      .catch((e) => { if (e instanceof Error) setError(e.message); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const project = data?.currentProject;

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 mb-4">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-12 translate-x-12"/>
        <div className="relative">
          <p className="text-blue-100 text-sm mb-1">Welcome back, {user?.name?.split(" ")[0]}</p>
          <h2 className="text-xl font-bold mb-1">{project?.title || "No active project"}</h2>
          <p className="text-blue-100 text-sm mb-4">{user?.dept || "Department"} · {user?.institution || "Institution"}</p>
          {project && (
            <>
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-blue-100">Project Completion</span>
                  <span className="font-bold text-lg">{data?.completionPercentage || 0}%</span>
                </div>
                <div className="bg-white/20 rounded-full h-3">
                  <div className="bg-white h-3 rounded-full" style={{ width: `${data?.completionPercentage || 0}%` }} />
                </div>
              </div>
              <div className="flex gap-3 flex-wrap text-xs">
                <div className="bg-white/15 rounded-xl px-3 py-1.5">Status: {project.status}</div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Completion" value={`${data?.completionPercentage || 0}%`} icon={TrendingUp} color="bg-blue-500" />
        <StatCard label="Tasks Completed" value={`${data?.completedTasks || 0}`} sub={`${(data?.pendingTasks || 0) + (data?.completedTasks || 0)} total`} icon={Check} color="bg-green-500" />
        <StatCard label="Pending Tasks" value={`${data?.pendingTasks || 0}`} icon={Clock} color="bg-amber-500" />
        <StatCard label="Documents" value={`${data?.recentDocuments?.length || 0}`} icon={FileText} color="bg-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <SectionHead title="Upcoming Milestones" />
          {data?.upcomingMilestones?.length ? (
            <div className="flex flex-col gap-3">
              {data.upcomingMilestones.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${m.isCompleted ? "bg-green-100 text-green-600 dark:bg-green-900/30" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30"}`}>
                    {m.isCompleted ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(m.targetDate).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={m.isCompleted ? "success" : "outline"}>{m.isCompleted ? "Done" : "Pending"}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No milestones yet</p>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <SectionHead title="Recent Documents" />
            {data?.recentDocuments?.length ? (
              <div className="flex flex-col gap-2">
                {data.recentDocuments.map((d) => (
                  <div key={d.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">{d.fileName}</p>
                      <p className="text-xs text-muted-foreground">{d.uploaderName} · {new Date(d.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No documents yet</p>
            )}
          </Card>

          <Card>
            <SectionHead title="Notifications" />
            {data?.notifications?.length ? (
              <div className="flex flex-col gap-2">
                {data.notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className={`p-2 rounded-lg text-xs ${n.isRead ? "" : "bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30"}`}>
                    <p className="font-medium text-foreground">{n.title}</p>
                    <p className="text-muted-foreground mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No notifications</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
