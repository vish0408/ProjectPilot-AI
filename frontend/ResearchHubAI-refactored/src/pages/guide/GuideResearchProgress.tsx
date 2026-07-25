import { useState, useEffect } from "react";
import { guideService } from "../../services/GuideService";
import type { GuideDashboardData } from "../../types/Guide";

const PIE_COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#8b5cf6","#06b6d4"];

export default function GuideResearchProgress() {
  const [data, setData] = useState<GuideDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    guideService.getDashboard()
      .then(setData)
      .catch((e) => { if (e instanceof Error) setError(e.message); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  const students = data?.assignedStudents ?? [];

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 mb-4">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold text-foreground mb-4">Student Progress Overview</h3>
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No students assigned yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {students.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-xs text-foreground flex-1 truncate">{s.fullName}</span>
                  <span className="text-xs font-bold text-foreground">{s.completionPercentage}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold text-foreground mb-4">Completion Distribution</h3>
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data available.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {[{label:"Completed (>90%)",range:[90,100]},{label:"Advanced (70-89%)",range:[70,89]},{label:"Mid (40-69%)",range:[40,69]},{label:"Early (1-39%)",range:[1,39]},{label:"Not Started",range:[0,0]}].map(b => {
                const count = b.range[0] === 0 && b.range[1] === 0
                  ? students.filter((s: any) => s.completionPercentage === 0).length
                  : students.filter((s: any) => s.completionPercentage >= b.range[0] && s.completionPercentage <= b.range[1]).length;
                const pct = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
                return (
                  <div key={b.label} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-28">{b.label}</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-foreground w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}