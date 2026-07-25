import { useEffect, useState, useMemo } from "react";
import { AlertTriangle, CheckCircle2, FolderOpen, ListTodo, Trophy } from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import ProgressBar from "../../components/common/ProgressBar";
import SectionHead from "../../components/common/SectionHead";
import StatCard from "../../components/cards/StatCard";
import { hodService } from "../../services/HodService";
import { HodProgressData, StudentProgressItem } from "../../types/Hod";

function fmtDate(d: string | null): string {
  if (!d) return "\u2014";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function statusVariant(status: string): "success" | "warning" | "danger" | "default" | "outline" {
  switch (status) {
    case "Completed": return "success";
    case "InProgress": return "warning";
    case "Delayed": return "danger";
    case "NotStarted": return "default";
    default: return "outline";
  }
}

function progressColor(v: number): string {
  if (v >= 100) return "bg-green-500";
  if (v >= 75) return "bg-blue-500";
  if (v >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function deadlineVariant(days: number): "success" | "warning" | "danger" {
  if (days > 14) return "success";
  if (days > 7) return "warning";
  return "danger";
}

type SortField = "completion" | "status" | "targetEndDate";
type SortDir = "asc" | "desc";

export default function HodProgress() {
  const [data, setData] = useState<HodProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("completion");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const d = await hodService.getProgress();
        setData(d);
      } catch (e) {
        if (e instanceof Error) setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sortedStudents = useMemo(() => {
    if (!data) return [];
    const list = [...data.students];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "completion") cmp = a.completionPercentage - b.completionPercentage;
      else if (sortField === "status") cmp = a.status.localeCompare(b.status);
      else if (sortField === "targetEndDate") {
        const da = a.targetEndDate ? new Date(a.targetEndDate).getTime() : 0;
        const db = b.targetEndDate ? new Date(b.targetEndDate).getTime() : 0;
        cmp = da - db;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [data, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return "";
    return sortDir === "asc" ? " \u2191" : " \u2193";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!data ? (
        <Card>
          <p className="text-sm text-muted-foreground text-center py-8">No progress data available</p>
        </Card>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard label="Total Projects" value={`${data.statistics.totalProjects}`} icon={FolderOpen} color="bg-blue-500" />
            <StatCard label="On Track" value={`${data.statistics.onTrack}`} icon={CheckCircle2} color="bg-green-500" />
            <StatCard label="Delayed" value={`${data.statistics.delayed}`} icon={AlertTriangle} color="bg-red-500" />
            <StatCard label="Completed" value={`${data.statistics.completed}`} icon={Trophy} color="bg-indigo-500" />
            <StatCard label="Avg Completion" value={`${data.statistics.averageCompletion}%`} icon={ListTodo} color="bg-amber-500" />
          </div>

          {/* Students progress table */}
          <Card p={false}>
            <div className="px-5 py-4 border-b border-border">
              <SectionHead title="Students Progress" desc="Overview of all students and their project progress" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="text-left px-5 py-3 font-semibold whitespace-nowrap">Student</th>
                    <th className="text-left px-5 py-3 font-semibold whitespace-nowrap">Project</th>
                    <th className="text-left px-5 py-3 font-semibold whitespace-nowrap">Guide</th>
                    <th className="text-left px-5 py-3 font-semibold whitespace-nowrap cursor-pointer select-none" onClick={() => toggleSort("completion")}>
                      Completion{sortIcon("completion")}
                    </th>
                    <th className="text-left px-5 py-3 font-semibold whitespace-nowrap cursor-pointer select-none" onClick={() => toggleSort("status")}>
                      Status{sortIcon("status")}
                    </th>
                    <th className="text-left px-5 py-3 font-semibold whitespace-nowrap">Milestones</th>
                    <th className="text-left px-5 py-3 font-semibold whitespace-nowrap cursor-pointer select-none" onClick={() => toggleSort("targetEndDate")}>
                      Target End{sortIcon("targetEndDate")}
                    </th>
                    <th className="text-left px-5 py-3 font-semibold whitespace-nowrap">Delayed</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map((s) => (
                    <tr key={s.userId} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-bold text-foreground truncate max-w-[160px]">{s.fullName}</p>
                        <p className="text-xs text-muted-foreground">{s.enrollment}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-foreground truncate max-w-[180px]">{s.projectTitle || "\u2014"}</p>
                      </td>
                      <td className="px-5 py-3 text-foreground">{s.guideName || "\u2014"}</td>
                      <td className="px-5 py-3 min-w-[150px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <ProgressBar value={s.completionPercentage} color={progressColor(s.completionPercentage)} />
                          </div>
                          <span className="text-xs font-bold text-foreground w-9 text-right">{s.completionPercentage}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-foreground whitespace-nowrap">
                        {s.milestonesCompleted}/{s.totalMilestones}
                      </td>
                      <td className="px-5 py-3 text-foreground whitespace-nowrap">{fmtDate(s.targetEndDate)}</td>
                      <td className="px-5 py-3">
                        {s.isDelayed ? (
                          <Badge variant="danger">
                            <AlertTriangle className="w-3 h-3" />
                            Delayed
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">\u2014</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!sortedStudents.length && (
                    <tr><td colSpan={8} className="text-center py-8 text-sm text-muted-foreground">No students found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Delayed projects */}
          <SectionHead title="Delayed Projects" desc="Projects that are past their target end date" />
          {delayedProjects.length === 0 ? (
            <Card>
              <p className="text-sm text-muted-foreground text-center py-4">No delayed projects</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {delayedProjects.map((p) => {
                const urgent = p.daysOverdue > 30;
                return (
                  <Card key={p.projectId} className={`border-l-4 ${urgent ? "border-l-red-500" : "border-l-amber-500"}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-bold text-foreground text-sm truncate flex-1">{p.title}</p>
                      <Badge variant={urgent ? "danger" : "warning"}>{p.daysOverdue}d overdue</Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground mb-3">
                      <p>Student: <span className="text-foreground font-medium">{p.studentName}</span></p>
                      <p>Guide: <span className="text-foreground font-medium">{p.guideName}</span></p>
                      <p>Target: <span className="text-foreground font-medium">{fmtDate(p.targetEndDate)}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <ProgressBar value={p.completionPercentage} color={progressColor(p.completionPercentage)} h="h-1.5" />
                      </div>
                      <span className="text-xs font-bold text-foreground">{p.completionPercentage}%</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Upcoming deadlines */}
          <SectionHead title="Upcoming Deadlines" desc="Deadlines approaching in the coming days" />
          {upcomingDeadlines.length === 0 ? (
            <Card>
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingDeadlines.map((d) => {
                const v = deadlineVariant(d.daysRemaining);
                const borderMap: Record<string, string> = { danger: "border-l-red-500", warning: "border-l-amber-500", success: "border-l-green-500" };
                const badgeMap: Record<string, "danger" | "warning" | "success"> = { danger: "danger", warning: "warning", success: "success" };
                return (
                  <Card key={d.projectId} className={`border-l-4 ${borderMap[v]}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-bold text-foreground text-sm truncate flex-1">{d.title}</p>
                      <Badge variant={badgeMap[v]}>{d.daysRemaining}d left</Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Student: <span className="text-foreground font-medium">{d.studentName}</span></p>
                      <p>Type: <span className="text-foreground font-medium">{d.deadlineType}</span></p>
                      <p>Due: <span className="text-foreground font-medium">{fmtDate(d.deadline)}</span></p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
