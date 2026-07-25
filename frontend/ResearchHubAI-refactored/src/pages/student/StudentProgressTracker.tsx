import { useState, useEffect } from "react";
import { CheckCircle, Clock, FileText, TrendingUp } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { studentService } from "../../services/StudentService";
import type { DashboardData } from "../../types/Student";

export default function StudentProgressTracker() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    studentService.getDashboard()
      .then(setData)
      .catch((e) => { if (e instanceof Error) setError(e.message); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 mb-4">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Completion" value={`${data?.completionPercentage || 0}%`} icon={TrendingUp} color="bg-blue-500"/>
        <StatCard label="Tasks Done" value={`${data?.completedTasks || 0}`} icon={CheckCircle} color="bg-green-500"/>
        <StatCard label="Pending" value={`${data?.pendingTasks || 0}`} icon={Clock} color="bg-amber-500"/>
        <StatCard label="Documents" value={`${data?.recentDocuments?.length || 0}`} icon={FileText} color="bg-indigo-500"/>
      </div>
      <Card>
        <SectionHead title="Progress Overview"/>
        {data?.upcomingMilestones?.length ? (
          <div className="flex flex-col gap-2">
            {data.upcomingMilestones.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${m.isCompleted ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                  {m.isCompleted ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1"><p className="text-sm font-semibold text-foreground">{m.title}</p><p className="text-xs text-muted-foreground">{new Date(m.targetDate).toLocaleDateString()}</p></div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Your research progress data will appear here once you have tasks and milestones defined in your project.</p>
        )}
      </Card>
    </div>
  );
}