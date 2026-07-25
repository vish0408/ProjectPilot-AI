import { useState, useEffect } from "react";
import { Download, Eye, History } from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { studentService } from "../../services/StudentService";

interface ChapterVersion {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
}

export default function StudentChapterVersions() {
  const [versions, setVersions] = useState<ChapterVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const projects = await studentService.getMyProjects();
        if (projects.items.length > 0) {
          const docs = await studentService.getDocuments(projects.items[0].id);
          setVersions(docs.map(d => ({
            id: d.id,
            title: d.fileName,
            status: d.status || "uploaded",
            updatedAt: d.uploadedAt,
          })));
        }
      } catch (e) { if (e instanceof Error) setError(e.message); } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 mb-4">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <Card>
        <SectionHead title="Version History" desc="Your submitted chapters and documents" />
        {loading ? (
          <div className="flex items-center justify-center py-8"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : versions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No chapter versions yet. Upload your thesis chapters to see versions here.</p>
        ) : (
          versions.map((c, i) => (
            <div key={c.id} className={`border border-border rounded-xl overflow-hidden ${i > 0 ? "mt-3" : ""}`}>
              <div className="flex items-center justify-between px-4 py-3 bg-muted/40">
                <span className="text-sm font-bold text-foreground">{c.title}</span>
                <Badge variant={c.status === "approved" ? "success" : c.status === "review" ? "warning" : "outline"}>{c.status}</Badge>
              </div>
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{new Date(c.updatedAt).toLocaleDateString()}</span>
                <div className="flex gap-1">{[Eye, Download, History].map((Icon, j) => (
                  <button key={j} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center"><Icon className="w-3.5 h-3.5 text-muted-foreground" /></button>
                ))}</div>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}