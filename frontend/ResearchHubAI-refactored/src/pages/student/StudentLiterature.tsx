import { useState, useEffect } from "react";
import { Bookmark, Brain, Link, Sparkles } from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { literatureService } from "../../services/LiteratureService";
import type { UploadedDocumentResponse } from "../../types/Literature";

export default function StudentLiterature() {
  const [documents, setDocuments] = useState<UploadedDocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    literatureService.getHistory()
      .then(reviews => {
        const docs = reviews.flatMap(r => r.documents);
        setDocuments(docs);
      })
      .catch((e) => { if (e instanceof Error) setError(e.message); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 mb-4">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-white mb-3">My Literature</h2>
        <p className="text-white/70 text-sm">Documents uploaded via the AI Literature Review module</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <Card><p className="text-sm text-muted-foreground text-center py-8">No documents found. Upload papers in the AI Literature Review module to see them here.</p></Card>
          ) : (
            documents.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-foreground mb-1">{p.title || p.fileName}</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {p.authors ? `${p.authors} · ` : ""}{p.publicationYear ? `${p.publicationYear} · ` : ""}{p.fileType}
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {p.doi && <Badge variant="outline">DOI: {p.doi}</Badge>}
                      {p.journal && <Badge variant="outline">{p.journal}</Badge>}
                    </div>
                  </div>
                  <button onClick={() => setSaved(s => s.includes(p.id) ? s.filter(x => x !== p.id) : [...s, p.id])}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${saved.includes(p.id) ? "bg-amber-100 text-amber-600" : "hover:bg-muted text-muted-foreground"}`}>
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-4 mt-3 pt-3 border-t border-border/50">
                  <button className="text-xs text-blue-600 font-medium flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5" />AI Summary
                  </button>
                  <button className="text-xs text-muted-foreground flex items-center gap-1">
                    <Link className="w-3.5 h-3.5" />Cite
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
        <div className="flex flex-col gap-4">
          <Card>
            <SectionHead title="Saved Papers" action={<Badge variant="warning">{saved.length}</Badge>} />
            {saved.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No saved papers</p>
            ) : (
              documents.filter(d => saved.includes(d.id)).map(p => (
                <div key={p.id} className="flex items-start gap-2 py-2 border-b border-border/50 last:border-0 first:pt-0">
                  <Bookmark className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground leading-snug">{p.title || p.fileName}</p>
                    <p className="text-xs text-muted-foreground">{p.publicationYear || ""}</p>
                  </div>
                </div>
              ))
            )}
          </Card>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" /><span className="font-semibold text-sm">AI Literature Review</span>
            </div>
            <p className="text-xs text-blue-100">Use the AI Literature Review module to analyze papers, find gaps, and generate related work.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
