import { useState, useEffect } from "react";
import { Calendar, CheckCircle, Clock, TrendingUp } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { studentService } from "../../services/StudentService";
import type { Milestone } from "../../types/Student";

export default function StudentResearchTimeline() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const projects = await studentService.getMyProjects();
        if (projects.items.length > 0) {
          const ms = await studentService.getMilestones(projects.items[0].id);
          setMilestones(ms);
        }
      } catch (e) { if (e instanceof Error) setError(e.message); } finally { setLoading(false); }
    };
    load();
  }, []);

  const completed = milestones.filter(m => m.isCompleted).length;

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 mb-4">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Status" value={milestones.length > 0 ? "In Progress" : "Not Started"} icon={CheckCircle} color="bg-green-500"/>
        <StatCard label="Milestones" value={`${completed}/${milestones.length}`} icon={Clock} color="bg-amber-500"/>
        <StatCard label="Completed" value={`${completed}`} icon={TrendingUp} color="bg-indigo-500"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionHead title="Research Timeline"/>
          {loading ? (
            <div className="flex items-center justify-center py-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No milestones yet. Create milestones in the My Research page to build your timeline.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {milestones.map((m, i) => (
                <div key={m.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full border-2 ${m.isCompleted ? "bg-green-500 border-green-500" : "border-muted-foreground"}`} />
                    {i < milestones.length - 1 && <div className="w-0.5 flex-1 bg-border" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-semibold text-foreground">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(m.targetDate || m.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <SectionHead title="Phase Progress"/>
          {loading ? (
            <div className="flex items-center justify-center py-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Progress data will appear here once milestones are defined.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {milestones.map(m => (
                <div key={m.id} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-24 truncate text-muted-foreground">{m.title}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className={`h-2 rounded-full ${m.isCompleted ? "bg-green-500" : "bg-blue-500"}`} style={{ width: m.isCompleted ? "100%" : "0%" }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{m.isCompleted ? "100%" : "0%"}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}