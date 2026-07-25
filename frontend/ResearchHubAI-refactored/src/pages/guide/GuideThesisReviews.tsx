import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileText,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Star,
  ThumbsDown,
  X,
  ChevronDown,
  ChevronUp,
  History,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import ProgressBar from "../../components/common/ProgressBar";
import SectionHead from "../../components/common/SectionHead";
import DocumentViewer from "../../components/document/DocumentViewer";
import { guideService } from "../../services/GuideService";
import { ThesisDocumentSummary, DocumentComment } from "../../types/Guide";

export default function GuideThesisReviews() {
  const [documents, setDocuments] = useState<ThesisDocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<ThesisDocumentSummary | null>(null);
  const [viewerBlobUrl, setViewerBlobUrl] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [docFetching, setDocFetching] = useState(false);
  const [docFetchError, setDocFetchError] = useState<string | null>(null);
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [sendingComment, setSendingComment] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<"Approved" | "Rejected" | "RevisionRequested">("Approved");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewScore, setReviewScore] = useState<number>(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [versions, setVersions] = useState<ThesisDocumentSummary[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const items = await guideService.getThesisReviews();
      setDocuments(items);
    } catch (e) {
      console.error("Failed to load thesis reviews", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const fetchComments = useCallback(async (docId: string) => {
    setCommentsLoading(true);
    try {
      const items = await guideService.getDocumentComments(docId);
      setComments(items);
    } catch (e) {
      console.error("Failed to load comments", e);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const fetchVersions = useCallback(async (projectId: string, docId: string) => {
    try {
      const items = await guideService.getDocumentVersions(projectId, docId);
      setVersions(items);
    } catch (e) {
      console.error("Failed to load versions", e);
    }
  }, []);

  const openDocument = async (doc: ThesisDocumentSummary, mode: "preview" | "download" = "preview") => {
    if (docFetching) return;
    setDocFetching(true);
    setDocFetchError(null);
    setViewerBlobUrl(null);
    try {
      const { url } = await guideService.fetchDocumentBlob(doc.projectId, doc.documentId, mode);
      setViewerBlobUrl(url);
      setViewerOpen(true);
    } catch (e: any) {
      setDocFetchError(e.message || "Failed to load document");
    } finally {
      setDocFetching(false);
    }
  };

  const handleSelectDocument = async (doc: ThesisDocumentSummary) => {
    setSelectedDoc(doc);
    setExpandedDoc(doc.documentId);
    setViewerBlobUrl(null);
    setViewerOpen(false);
    setDocFetchError(null);
    setShowVersions(false);

    fetchComments(doc.documentId);
    fetchVersions(doc.projectId, doc.documentId);
  };

  const handleCloseViewer = () => {
    if (viewerBlobUrl) URL.revokeObjectURL(viewerBlobUrl);
    setViewerOpen(false);
    setViewerBlobUrl(null);
  };

  const handleDownload = async () => {
    if (!selectedDoc) return;
    try {
      await guideService.downloadDocument(selectedDoc.projectId, selectedDoc.documentId, selectedDoc.fileName);
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  const handleOpenInNewTab = () => {
    if (!selectedDoc) return;
    openDocument(selectedDoc, "preview");
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !selectedDoc) return;
    setSendingComment(true);
    try {
      await guideService.addDocumentComment(selectedDoc.documentId, {
        content: commentText.trim(),
        parentCommentId: replyTo || undefined,
      });
      setCommentText("");
      setReplyTo(null);
      fetchComments(selectedDoc.documentId);
    } catch (e) {
      console.error("Failed to add comment", e);
    } finally {
      setSendingComment(false);
    }
  };

  const handleReview = async () => {
    if (!selectedDoc) return;
    if (reviewAction === "Rejected" && !reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      await guideService.reviewDocument(selectedDoc.documentId, {
        status: reviewAction,
        comment: reviewComment.trim(),
        score: reviewScore > 0 ? reviewScore : undefined,
      });
      setShowReviewDialog(false);
      setReviewComment("");
      setReviewScore(0);
      fetchDocuments();
      if (selectedDoc) fetchComments(selectedDoc.documentId);
    } catch (e) {
      console.error("Failed to submit review", e);
    } finally {
      setSubmittingReview(false);
    }
  };

  const openReviewDialog = (action: "Approved" | "Rejected" | "RevisionRequested") => {
    setReviewAction(action);
    setReviewComment("");
    setReviewScore(0);
    setShowReviewDialog(true);
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="warning">Pending</Badge>;
    switch (status) {
      case "Approved": return <Badge variant="success">Approved</Badge>;
      case "Rejected": return <Badge variant="danger">Rejected</Badge>;
      case "RevisionRequested": return <Badge variant="warning">Revision Requested</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  const getFileIcon = (type: string) => {
    const t = type?.toLowerCase() || "";
    if (["pdf"].includes(t)) return <FileText className="w-4 h-4 text-red-500" />;
    if (["doc", "docx"].includes(t)) return <FileText className="w-4 h-4 text-blue-500" />;
    if (["png", "jpg", "jpeg", "gif"].includes(t)) return <FileText className="w-4 h-4 text-green-500" />;
    return <FileText className="w-4 h-4 text-muted-foreground" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const filteredDocs = documents.filter(d => {
    if (statusFilter !== "all" && d.reviewStatus !== statusFilter && !(statusFilter === "Pending" && !d.reviewStatus)) return false;
    if (search) {
      const q = search.toLowerCase();
      return d.studentName.toLowerCase().includes(q) || d.fileName.toLowerCase().includes(q) || d.projectTitle.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const getFilePreviewLabel = (doc: ThesisDocumentSummary) => {
    const t = doc.fileType?.toLowerCase() || "";
    if (["pdf", "png", "jpg", "jpeg", "gif", "webp", "doc", "docx", "txt", "csv"].includes(t)) return "Preview";
    return "Open";
  };

  const canPreviewInline = (doc: ThesisDocumentSummary) => {
    const t = doc.fileType?.toLowerCase() || "";
    return ["pdf", "png", "jpg", "jpeg", "gif", "webp"].includes(t);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header + Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Thesis Reviews</h2>
          <p className="text-sm text-muted-foreground">{documents.length} document{documents.length !== 1 ? "s" : ""} submitted</p>
        </div>
        <div className="flex items-center gap-2">
          {["all", "Pending", "Approved", "RevisionRequested", "Rejected"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${statusFilter === s ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300" : "border-border text-muted-foreground hover:bg-muted"}`}>
              {s === "all" ? "All" : s === "RevisionRequested" ? "Revision" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-14rem)]">
        {/* Left Panel - Document List */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-2 overflow-y-auto scrollbar-hide">
          <div className="relative mb-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input className="w-full bg-muted border border-border rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-primary" placeholder="Search students or files..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {filteredDocs.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">No documents found</div>
          )}
          {filteredDocs.map(doc => (
            <button key={doc.documentId} onClick={() => handleSelectDocument(doc)} className={`w-full text-left p-3 rounded-xl border transition-all ${selectedDoc?.documentId === doc.documentId ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" : "border-border hover:bg-muted"}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Avatar name={doc.studentName} size="sm" />
                  <div>
                    <p className="text-xs font-bold text-foreground">{doc.studentName}</p>
                    <p className="text-[10px] text-muted-foreground">{doc.enrollment}</p>
                  </div>
                </div>
                {getStatusBadge(doc.reviewStatus)}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {getFileIcon(doc.fileType)}
                <span className="text-xs text-muted-foreground truncate flex-1">{doc.fileName}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                <span>v{doc.version}</span>
                <span>·</span>
                <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                <span>·</span>
                <span>{formatFileSize(doc.fileSize)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 truncate">{doc.researchTopic}</p>
            </button>
          ))}
        </div>

        {/* Center/Right Panel - Document Preview + Actions */}
        {selectedDoc ? (
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto scrollbar-hide">
            {/* Document Info Bar */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground">{selectedDoc.fileName}</h3>
                    {getStatusBadge(selectedDoc.reviewStatus)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedDoc.studentName} · {selectedDoc.enrollment} · {selectedDoc.department} · v{selectedDoc.version}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedDoc.projectTitle} · Uploaded {new Date(selectedDoc.uploadedAt).toLocaleString()}</p>
                  {selectedDoc.reviewComment && (
                    <div className="mt-2 p-2 bg-muted/50 rounded-lg border border-border">
                      <p className="text-xs font-bold text-muted-foreground">Latest Review Feedback:</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{selectedDoc.reviewComment}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedDoc.reviewStatus !== "Approved" && (
                    <>
                      <button onClick={() => openReviewDialog("Approved")} className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-700 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" />Approve</button>
                      <button onClick={() => openReviewDialog("RevisionRequested")} className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-amber-600 flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" />Revise</button>
                      <button onClick={() => openReviewDialog("Rejected")} className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-700 flex items-center gap-1.5"><X className="w-3.5 h-3.5" />Reject</button>
                    </>
                  )}
                  <button onClick={handleDownload} className="border border-border text-xs font-medium text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-muted flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />Download</button>
                  <button onClick={handleOpenInNewTab} className="border border-border text-xs font-medium text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-muted flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" />Open</button>
                </div>
              </div>
            </div>

            {/* Document Preview */}
            <div className="bg-card border border-border rounded-xl overflow-hidden" style={{ height: "400px" }}>
              {docFetching ? (
                <div className="flex items-center justify-center h-full gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                  <span className="text-xs text-muted-foreground">Loading document...</span>
                </div>
              ) : docFetchError ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                  <p className="text-xs text-muted-foreground">{docFetchError}</p>
                  <button onClick={handleDownload} className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-700 flex items-center gap-1">
                    <Download className="w-3 h-3" />Download
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                  <FileText className="w-16 h-16 text-muted-foreground opacity-30" />
                  <p className="text-sm text-muted-foreground">Click below to preview this document</p>
                  <div className="flex gap-2">
                    <button onClick={() => openDocument(selectedDoc!, "preview")} className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />{getFilePreviewLabel(selectedDoc!)}
                    </button>
                    <button onClick={handleDownload} className="border border-border text-xs font-medium text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" />Download
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Version History */}
            <Card>
              <SectionHead
                title="Version History"
                action={
                  <button onClick={() => setShowVersions(!showVersions)} className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
                    <History className="w-3 h-3" />{showVersions ? "Hide" : "Show All"} ({versions.length})
                  </button>
                }
              />
              {showVersions && (
                <div className="flex flex-col gap-2 mt-2">
                  {versions.map((v, i) => (
                    <div key={v.documentId} className={`flex items-center justify-between p-2.5 rounded-xl border ${v.documentId === selectedDoc.documentId ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30" : "border-border"}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${v.documentId === selectedDoc.documentId ? "bg-indigo-600 text-white" : "bg-muted text-muted-foreground"}`}>v{v.version}</div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{v.fileName}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(v.uploadedAt).toLocaleString()} · {formatFileSize(v.fileSize)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(v.reviewStatus)}
                        <button onClick={() => handleSelectDocument(v)} className="text-xs text-blue-600 font-semibold hover:underline">Open</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Comments Section */}
            <Card>
              <SectionHead title={`Comments (${comments.length})`} />
              <div className="flex flex-col gap-3 max-h-64 overflow-y-auto scrollbar-hide mt-2">
                {commentsLoading ? (
                  <div className="flex items-center justify-center py-4"><div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No comments yet. Add feedback below.</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id}>
                      <div className="flex gap-2 p-2.5 rounded-xl bg-muted/30 border border-border">
                        <Avatar name={c.userName} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">{c.userName}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                            {c.isEdited && <span className="text-[10px] text-muted-foreground italic">(edited)</span>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{c.content}</p>
                          <button onClick={() => setReplyTo(c.id)} className="text-[10px] text-blue-600 font-semibold hover:underline mt-1">Reply</button>
                        </div>
                      </div>
                      {c.replies.map(r => (
                        <div key={r.id} className="flex gap-2 ml-8 mt-1.5 p-2 rounded-xl bg-muted/20 border border-border">
                          <Avatar name={r.userName} size="sm" />
                          <div className="flex-1 min-w-0">
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
              </div>
              {replyTo && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-muted/30 rounded-lg border border-border">
                  <span className="text-xs text-muted-foreground">Replying to comment</span>
                  <button onClick={() => setReplyTo(null)} className="text-xs text-red-500 font-semibold hover:underline">Cancel</button>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <textarea
                  className="flex-1 bg-muted border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
                  rows={2}
                  placeholder="Add review comments..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <button
                  disabled={sendingComment || !commentText.trim()}
                  onClick={handleSendComment}
                  className="bg-indigo-600 text-white px-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center self-stretch"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border rounded-2xl">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p>Select a document from the left panel to review</p>
            </div>
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {viewerOpen && viewerBlobUrl && selectedDoc && (
        <DocumentViewer
          blobUrl={viewerBlobUrl}
          fileName={selectedDoc.fileName}
          fileType={selectedDoc.fileType}
          onClose={handleCloseViewer}
          onDownload={handleDownload}
        />
      )}

      {/* Review Dialog */}
      {showReviewDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowReviewDialog(false)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {reviewAction === "Approved" ? <CheckCircle className="w-5 h-5 text-green-600" /> : reviewAction === "Rejected" ? <ThumbsDown className="w-5 h-5 text-red-600" /> : <RefreshCw className="w-5 h-5 text-amber-500" />}
                <h3 className="font-bold text-foreground">
                  {reviewAction === "Approved" ? "Approve Thesis" : reviewAction === "Rejected" ? "Reject Thesis" : "Request Revision"}
                </h3>
              </div>
              <button onClick={() => setShowReviewDialog(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="mb-4 p-3 bg-muted/30 rounded-xl border border-border">
              <p className="text-xs font-bold text-foreground">{selectedDoc?.fileName}</p>
              <p className="text-xs text-muted-foreground">{selectedDoc?.studentName} · v{selectedDoc?.version}</p>
            </div>
            <div className="mb-4">
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">
                {reviewAction === "Rejected" ? "Rejection Reason (required)" : reviewAction === "RevisionRequested" ? "Revision Instructions" : "Comment (optional)"}
              </label>
              <textarea
                className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
                rows={4}
                placeholder={reviewAction === "Approved" ? "Add approval notes..." : reviewAction === "Rejected" ? "Explain why this thesis is being rejected..." : "Describe what changes are needed..."}
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
              />
              {reviewAction === "Rejected" && !reviewComment.trim() && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Rejection reason is required</p>
              )}
            </div>
            <div className="mb-4">
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Score (0-100, optional)</label>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={reviewScore}
                  onChange={e => setReviewScore(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs font-bold text-foreground w-8 text-right">{reviewScore}</span>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowReviewDialog(false)} className="border border-border text-xs font-medium text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted">Cancel</button>
              <button
                onClick={handleReview}
                disabled={submittingReview || (reviewAction === "Rejected" && !reviewComment.trim())}
                className={`text-xs font-bold px-4 py-2 rounded-lg text-white flex items-center gap-1.5 ${reviewAction === "Approved" ? "bg-green-600 hover:bg-green-700" : reviewAction === "Rejected" ? "bg-red-600 hover:bg-red-700" : "bg-amber-500 hover:bg-amber-600"} disabled:opacity-50`}
              >
                {submittingReview ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                {reviewAction === "Approved" ? "Approve" : reviewAction === "Rejected" ? "Reject" : "Request Revision"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
