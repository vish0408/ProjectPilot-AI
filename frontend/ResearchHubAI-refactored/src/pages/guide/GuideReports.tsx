import { useState, useEffect } from "react";
import { BarChart3, Download, FileText, Loader2, PieChart, Printer, TrendingUp, Users } from "lucide-react";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { guideService } from "../../services/GuideService";
import type { GuideDashboardData } from "../../types/Guide";

export default function GuideReports() {
  const [data, setData] = useState<GuideDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    guideService.getDashboard()
      .then(setData)
      .catch((e) => { if (e instanceof Error) setError(e.message); })
      .finally(() => setLoading(false));
  }, []);

  const exportCSV = (type: string) => {
    if (!data) return;
    let csv = "";
    if (type === "students") {
      csv = "Name,Email,Department,Project,Status,Completion\n";
      data.assignedStudents?.forEach((s: any) => { csv += `${s.fullName},${s.email},${s.department},${s.projectTitle || ""},${s.projectStatus || ""},${s.completionPercentage}%\n`; });
    } else if (type === "reviews") {
      csv = "Project,Student,Status,Submitted\n";
      data.pendingReviewList?.forEach((r: any) => { csv += `${r.projectTitle},${r.studentName},${r.type},${r.submittedAt || ""}\n`; });
    } else {
      csv = `Metric,Value\nAssigned Students,${data.totalAssignedStudents}\nPending Reviews,${data.pendingReviews}\nUpcoming Meetings,${data.upcomingMeetings}`;
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${type}-report.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const reportCards = [
    { type: "students", icon: Users, label: "Student Progress Report", desc: "Detailed progress of all assigned students", color: "bg-blue-500" },
    { type: "reviews", icon: FileText, label: "Review Summary Report", desc: "Summary of all chapter reviews and approvals", color: "bg-green-500" },
    { type: "meetings", icon: TrendingUp, label: "Meeting Analytics Report", desc: "Meeting frequency, attendance, and trends", color: "bg-purple-500" },
    { type: "completion", icon: PieChart, label: "Completion Report", desc: "Project completion statistics across students", color: "bg-amber-500" },
    { type: "activity", icon: BarChart3, label: "Activity Report", desc: "Overall guide activity and student engagement", color: "bg-indigo-500" },
    { type: "full", icon: Printer, label: "Full Summary Report", desc: "Comprehensive report with all metrics combined", color: "bg-rose-500" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 mb-4">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><div className="text-center p-4"><p className="text-2xl font-bold text-foreground">{data?.totalAssignedStudents ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Assigned Students</p></div></Card>
        <Card><div className="text-center p-4"><p className="text-2xl font-bold text-foreground">{data?.pendingReviews ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Pending Reviews</p></div></Card>
        <Card><div className="text-center p-4"><p className="text-2xl font-bold text-foreground">{data?.upcomingMeetings ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Upcoming Meetings</p></div></Card>
        <Card><div className="text-center p-4"><p className="text-2xl font-bold text-foreground">{data?.projectsUnderReview ?? 0}</p><p className="text-xs text-muted-foreground mt-1">Projects Under Review</p></div></Card>
      </div>

      <Card>
        <SectionHead title="Generate Reports" desc="Export student progress, review summaries, and activity reports" />
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportCards.map((r) => (
              <div key={r.type} className="border border-border rounded-xl p-4 hover:border-blue-300 transition-colors">
                <div className={`w-10 h-10 ${r.color} rounded-xl flex items-center justify-center mb-3`}>
                  <r.icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-sm text-foreground mb-1">{r.label}</h4>
                <p className="text-xs text-muted-foreground mb-3">{r.desc}</p>
                <div className="flex gap-2">
                  <button onClick={() => exportCSV(r.type)}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                    <Download className="w-3 h-3" /> CSV
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}