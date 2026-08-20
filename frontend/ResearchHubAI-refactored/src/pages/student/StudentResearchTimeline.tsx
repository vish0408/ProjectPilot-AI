import { useEffect, useState } from "react";
import { Calendar, CheckCircle, Clock, RefreshCw, TrendingUp } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { studentService } from "../../services/StudentService";
import type { Milestone } from "../../types/Student";

export default function StudentResearchTimeline() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const paged = await studentService.getMyProjects();
        const project = paged.items[0];
        if (project) {
          const ms = await studentService.getMilestones(project.id);
          setMilestones(ms);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load timeline");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const done = milestones.filter((m) => m.isCompleted).length;
  const pending = milestones.filter((m) => !m.isCompleted).length;
  const total = milestones.length;
  const overall = total > 0 ? Math.round((done / total) * 100) : 0;

  const sorted = milestones.slice().sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Done" value={`${done} / ${total}`} icon={CheckCircle} color="bg-green-500"/>
        <StatCard label="In Progress" value={`${pending}`} icon={RefreshCw} color="bg-blue-500"/>
        <StatCard label="Pending" value={`${pending}`} icon={Clock} color="bg-amber-500"/>
        <StatCard label="Overall" value={`${overall}%`} icon={TrendingUp} color="bg-indigo-500"/>
      </div>

      <Card>
        <SectionHead title="Research Milestones"/>
        {milestones.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No milestones yet</p>
        ) : (
          <div className="flex flex-col">
            {sorted.map((m, i) => (
              <div key={m.id} className="flex gap-4 pb-5 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 ${m.isCompleted ? "border-green-500 bg-green-50 dark:bg-green-900/30" : "border-border bg-muted"}`}>
                    {m.isCompleted ? <CheckCircle className="w-4 h-4 text-green-600"/> : <Clock className="w-4 h-4 text-muted-foreground"/>}
                  </div>
                  {i < sorted.length - 1 && <div className={`w-0.5 flex-1 mt-1 ${m.isCompleted ? "bg-green-200 dark:bg-green-900/50" : "bg-border"}`}/>}
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-bold text-sm text-foreground">{m.title}</span>
                    <Badge variant={m.isCompleted ? "success" : "outline"}>{m.isCompleted ? "Completed" : "Pending"}</Badge>
                  </div>
                  {m.description && <p className="text-xs text-muted-foreground">{m.description}</p>}
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3"/>{new Date(m.targetDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}