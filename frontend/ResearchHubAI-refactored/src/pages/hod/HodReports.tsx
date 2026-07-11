import { useEffect, useState } from "react";
import { BarChart2, Download } from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { hodService } from "../../services/HodService";
import { DepartmentReport } from "../../types/Hod";

export default function HodReports() {
  const [reports, setReports] = useState<DepartmentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetch = async () => {
    try {
      const data = await hodService.getReports();
      setReports(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleGenerate = async (reportType: string) => {
    setGenerating(true);
    const titles: Record<string, string> = {
      "student-progress": "Student Progress Report",
      "guide-performance": "Guide Performance Report",
      "department-analytics": "Department Analytics Report",
      "project-completion": "Project Completion Report",
    };
    try {
      await hodService.generateReport(reportType, titles[reportType] || reportType);
      fetch();
    } finally { setGenerating(false); }
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
      <h2 className="text-lg font-bold text-foreground">Department Reports</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { type: "student-progress", label: "Student Progress", color: "bg-blue-500" },
          { type: "guide-performance", label: "Guide Performance", color: "bg-green-500" },
          { type: "department-analytics", label: "Analytics", color: "bg-indigo-500" },
          { type: "project-completion", label: "Project Completion", color: "bg-amber-500" },
        ].map((r) => (
          <button key={r.type} onClick={() => handleGenerate(r.type)} disabled={generating}
            className={`${r.color} text-white rounded-xl p-4 text-left hover:opacity-90 transition-opacity disabled:opacity-50`}>
            <BarChart2 className="w-6 h-6 mb-2" />
            <p className="text-sm font-bold">{r.label}</p>
            <p className="text-xs text-white/80">Click to generate</p>
          </button>
        ))}
      </div>

      <Card p={false}>
        <div className="px-5 py-4 border-b border-border">
          <SectionHead title="Generated Reports" />
        </div>
        <div className="flex flex-col">
          {reports.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-5 py-4 border-b border-border last:border-0 hover:bg-muted/40">
              <div>
                <p className="text-sm font-bold text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {r.reportType} · Generated {new Date(r.generatedAt).toLocaleDateString()} by {r.generatedByName}
                </p>
              </div>
              <Badge variant="outline">{r.reportType.replace("-", " ")}</Badge>
            </div>
          ))}
          {!reports.length && <p className="text-sm text-muted-foreground text-center py-8">No reports generated yet. Click a report type above to generate.</p>}
        </div>
      </Card>
    </div>
  );
}
