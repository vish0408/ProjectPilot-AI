import { useEffect, useState } from "react";
import { Download, Eye } from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { studentService } from "../../services/StudentService";
import type { Project, ProjectDocument } from "../../types/Student";
import type { Chapter } from "../../types/Guide";

const statusVariant = (status: string): "success" | "warning" | "default" | "outline" => {
  if (status === "Approved") return "success";
  if (status === "InReview" || status === "UnderReview" || status === "Review") return "warning";
  if (status === "Draft") return "default";
  return "outline";
};

export default function StudentChapterVersions() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    studentService.getMyProjects()
      .then((paged) => {
        const items = paged.items;
        setProjects(items);
        if (items.length > 0) setProjectId(items[0].id);
        else setLoading(false);
      })
      .catch((e: unknown) => { setError(e instanceof Error ? e.message : "Failed to load projects"); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError("");
    Promise.all([
      studentService.getProjectChapters(projectId),
      studentService.getDocuments(projectId),
    ])
      .then(([chs, docs]) => { setChapters(chs); setDocuments(docs); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load chapters"))
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleDownload = async (doc: ProjectDocument) => {
    try {
      const result = await studentService.downloadDocument(projectId, doc.id);
      const url = URL.createObjectURL(result.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.fileName || doc.fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Download failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No research projects yet.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {projects.length > 1 && (
        <Card p={false}>
          <div className="flex items-center gap-3 px-5 py-4">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="flex-1 bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </Card>
      )}

      <Card>
        <SectionHead
          title="Chapters"
          desc="Thesis chapters and their latest document uploads"
          action={<Badge variant="default">{chapters.length} chapters</Badge>}
        />
        {chapters.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No chapters yet</p>
        ) : (
          chapters
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((c) => (
              <div key={c.id} className={`border border-border rounded-xl overflow-hidden ${chapters[0]?.id === c.id ? "" : "mt-3"}`}>
                <div className="flex items-center justify-between px-4 py-3 bg-muted/40">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-xs font-bold text-red-600">DOC</div>
                    <span className="text-sm font-bold text-foreground">{c.title || `Chapter ${c.order}`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                  </div>
                </div>
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(c.createdAt).toLocaleDateString()} · {c.comments?.length || 0} comment(s)
                  </span>
                  <span className="text-xs text-muted-foreground">Version {c.order}</span>
                </div>
              </div>
            ))
        )}
      </Card>

      {documents.length > 0 && (
        <Card>
          <SectionHead title="Document Uploads" desc="Latest files uploaded to this project" />
          <div className="flex flex-col gap-2">
            {documents.map((d) => (
              <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-7 h-7 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-xs font-bold text-red-600">PDF</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{d.fileName}</p>
                  <p className="text-xs text-muted-foreground">{d.fileType} · {(d.fileSize / 1024).toFixed(1)} KB · {new Date(d.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleDownload(d)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center" title="Preview">
                    <Eye className="w-3.5 h-3.5 text-muted-foreground"/>
                  </button>
                  <button onClick={() => handleDownload(d)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center" title="Download">
                    <Download className="w-3.5 h-3.5 text-muted-foreground"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}