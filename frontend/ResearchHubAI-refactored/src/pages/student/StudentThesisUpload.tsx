import { useState, useRef, useEffect } from "react";
import { Download, Eye, Upload, FileText, Trash2, Plus, MessageSquare } from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import { studentService } from "../../services/StudentService";
import type { Project, ProjectDocument, DocumentComment } from "../../types/Student";

export default function StudentThesisUpload() {
  const [dragging, setDragging] = useState(false);
  const [pct, setPct] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [docId: string]: DocumentComment[] }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadProjects(); }, []);

  useEffect(() => {
    if (selectedProjectId) loadDocuments(selectedProjectId);
    else setDocuments([]);
  }, [selectedProjectId]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projs = await studentService.getMyProjects();
      setProjects(projs.items);
      if (projs.items.length === 1) setSelectedProjectId(projs.items[0].id);
    } catch { setError("Failed to load projects"); }
    finally { setLoading(false); }
  };

  const loadDocuments = async (projectId: string) => {
    try {
      const docs = await studentService.getDocuments(projectId);
      setDocuments(docs);
    } catch { setDocuments([]); }
  };

  const loadComments = async (docId: string) => {
    try {
      const items = await studentService.getDocumentComments(docId);
      setComments(prev => ({ ...prev, [docId]: items }));
    } catch {
      setComments(prev => ({ ...prev, [docId]: [] }));
    }
  };

  const toggleDocExpand = (docId: string) => {
    if (expandedDoc === docId) {
      setExpandedDoc(null);
    } else {
      setExpandedDoc(docId);
      if (!comments[docId]) loadComments(docId);
    }
  };

  const handleFile = async (file: File) => {
    if (!selectedProjectId) { setUploadError("Select a project first"); return; }
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!allowed.includes(file.type) && !file.name.endsWith(".pdf") && !file.name.endsWith(".docx") && !file.name.endsWith(".txt")) {
      setUploadError("Only PDF, DOCX, and TXT files are supported");
      return;
    }
    if (file.size > 100 * 1024 * 1024) { setUploadError("File exceeds 100 MB limit"); return; }
    setUploading(true); setPct(0); setUploadError(null);
    const iv = setInterval(() => setPct(p => Math.min(p + 15, 85)), 200);
    try {
      const reader = new FileReader();
      const contentData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1] || "");
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await studentService.createDocument(selectedProjectId, {
        fileName: file.name,
        fileType: file.name.split(".").pop() || "pdf",
        fileSize: file.size,
        contentData,
      } as any);
      clearInterval(iv); setPct(100);
      setTimeout(() => { setUploading(false); setPct(0); loadDocuments(selectedProjectId); }, 500);
    } catch (err) {
      clearInterval(iv); setUploading(false); setPct(0);
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDelete = async (docId: string) => {
    try {
      await studentService.deleteDocument(selectedProjectId, docId);
      loadDocuments(selectedProjectId);
    } catch { setUploadError("Failed to delete document"); }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getStatusBadge = (status: string | undefined | null) => {
    if (!status) return <Badge variant="warning">Pending</Badge>;
    switch (status) {
      case "Approved": return <Badge variant="success">Approved</Badge>;
      case "Rejected": return <Badge variant="danger">Rejected</Badge>;
      case "RevisionRequested": return <Badge variant="warning">Revision Requested</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {!selectedProjectId && !loading && (
        <Card><div className="p-6 text-center"><p className="text-muted-foreground mb-4">No project found. Create a research project first to upload thesis chapters.</p>
          <button onClick={() => { const el = document.querySelector("[data-nav='my-research']") as HTMLElement; el?.click(); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"><Plus className="w-4 h-4"/>Go to My Research</button>
        </div></Card>
      )}

      {projects.length > 1 && (
        <div className="flex items-center gap-3"><label className="text-sm font-medium text-foreground">Project:</label>
          <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}
            className="bg-muted border border-border rounded-xl px-4 py-2 text-sm flex-1 max-w-xs">
            <option value="">Select a project...</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
      )}

      {selectedProjectId && (
        <>
          <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${dragging ? "border-blue-500 bg-blue-50" : "border-border hover:border-blue-400 hover:bg-muted/30"}`}>
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFileSelect} />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center"><Upload className="w-7 h-7 text-blue-600 animate-bounce" /></div>
                <p className="font-bold text-foreground">Uploading...</p>
                <div className="w-52 bg-muted rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
                <p className="text-sm text-muted-foreground">{pct}%</p>
              </div>
            ) : (
              <>
                <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${dragging ? "bg-blue-100" : "bg-muted"}`}>
                  <Upload className={`w-7 h-7 ${dragging ? "text-blue-600" : "text-muted-foreground"}`} />
                </div>
                <p className="font-bold text-foreground mb-1">Upload Thesis Chapter</p>
                <p className="text-sm text-muted-foreground">Drag & drop PDF or DOCX · Max 100 MB</p>
              </>
            )}
          </div>
          {uploadError && <p className="text-sm text-red-500 text-center">{uploadError}</p>}

          <Card p={false}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border"><h3 className="font-bold text-foreground">Uploaded Files</h3>
              <span className="text-xs text-muted-foreground">{documents.length} file{documents.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40"><tr>{["File", "Type", "Size", "Uploaded", "Status", "Actions"].map(h => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-sm text-muted-foreground">No files uploaded yet. Use the upload area above to upload your thesis chapters.</td></tr>
                  ) : documents.map(doc => (
                    <>
                      <tr key={doc.id} className="border-t border-border hover:bg-muted/30">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="font-medium text-foreground">{doc.fileName}</span>
                          </div>
                          {doc.reviewComment && (
                            <p className="text-xs text-muted-foreground mt-0.5 ml-6 italic">"{doc.reviewComment}"</p>
                          )}
                        </td>
                        <td className="px-5 py-3"><Badge variant="outline">{doc.fileType.toUpperCase()}</Badge></td>
                        <td className="px-5 py-3 text-muted-foreground">{formatSize(doc.fileSize)}</td>
                        <td className="px-5 py-3 text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3">{getStatusBadge(doc.status)}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => studentService.openDocument(selectedProjectId, doc.id)}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground inline-flex">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => studentService.downloadDocument(selectedProjectId, doc.id, doc.fileName)}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground inline-flex">
                              <Download className="w-4 h-4" />
                            </button>
                            <button onClick={() => toggleDocExpand(doc.id)}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            {doc.status !== "Approved" && (
                              <button onClick={() => handleDelete(doc.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedDoc === doc.id && (
                        <tr key={`${doc.id}-comments`}>
                          <td colSpan={6} className="px-5 py-3 bg-muted/20">
                            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                              <p className="text-xs font-bold text-muted-foreground mb-1">Guide Comments</p>
                              {!comments[doc.id] ? (
                                <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /><span className="text-xs text-muted-foreground">Loading comments...</span></div>
                              ) : comments[doc.id].length === 0 ? (
                                <p className="text-xs text-muted-foreground">No comments yet</p>
                              ) : (
                                comments[doc.id].map(c => (
                                  <div key={c.id}>
                                    <div className="flex gap-2 p-2 rounded-lg bg-muted/40 border border-border">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-foreground">{c.userName}</span>
                                          <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                                          {c.isEdited && <span className="text-[10px] text-muted-foreground italic">(edited)</span>}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">{c.content}</p>
                                      </div>
                                    </div>
                                    {c.replies.map(r => (
                                      <div key={r.id} className="flex gap-2 ml-6 mt-1 p-2 rounded-lg bg-muted/20 border border-border">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-foreground">{r.userName}</span>
                                            <span className="text-[10px] text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span>
                                          </div>
                                          <p className="text-xs text-muted-foreground mt-0.5">{r.content}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))
                              )}
                              {doc.reviewScore != null && (
                                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Score: {doc.reviewScore}/100</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
