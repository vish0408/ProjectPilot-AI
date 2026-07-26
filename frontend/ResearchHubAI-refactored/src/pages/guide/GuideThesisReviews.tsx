import { useEffect, useState, useCallback, useRef, useMemo } from "react";
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
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BookOpen,
  Calendar,
  User,
  Flag,
  HardDrive,
  Hash,
  Activity,
  XCircle,
  AlertTriangle,
  FileCheck,
  ArrowUp,
  ArrowDown,
  Circle,
} from "lucide-react";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import ProgressBar from "../../components/common/ProgressBar";
import SectionHead from "../../components/common/SectionHead";
import DocumentViewer from "../../components/document/DocumentViewer";
import { guideService } from "../../services/GuideService";
import { ThesisDocumentSummary, DocumentComment } from "../../types/Guide";

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-muted rounded-lg w-3/5 mb-1.5" />
          <div className="h-3 bg-muted rounded-lg w-2/5" />
        </div>
        <div className="w-20 h-6 bg-muted rounded-full" />
      </div>
      <div className="h-4 bg-muted rounded-lg w-full mb-2" />
      <div className="h-4 bg-muted rounded-lg w-4/5 mb-4" />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="h-12 bg-muted rounded-xl" />
        <div className="h-12 bg-muted rounded-xl" />
        <div className="h-12 bg-muted rounded-xl" />
        <div className="h-12 bg-muted rounded-xl" />
      </div>
      <div className="flex gap-2">
        <div className="h-11 bg-muted rounded-xl flex-1" />
        <div className="h-11 bg-muted rounded-xl flex-1" />
        <div className="h-11 bg-muted rounded-xl flex-1" />
      </div>
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className="flex-1 flex flex-col gap-4 animate-pulse">
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="h-5 bg-muted rounded-lg w-2/5 mb-2" />
        <div className="h-3 bg-muted rounded-lg w-3/5 mb-1" />
        <div className="h-3 bg-muted rounded-lg w-1/2" />
      </div>
      <div className="bg-card border border-border rounded-xl" style={{ height: "400px" }} />
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="h-4 bg-muted rounded-lg w-1/4 mb-4" />
        <div className="h-12 bg-muted rounded-xl w-full mb-2" />
        <div className="h-12 bg-muted rounded-xl w-full" />
      </div>
    </div>
  );
}

function getStatusIcon(status: string | null) {
  if (!status) return Clock;
  switch (status) {
    case "Approved": return CheckCircle;
    case "Rejected": return XCircle;
    case "RevisionRequested": return RefreshCw;
    default: return Clock;
  }
}

function getStatusColor(status: string | null) {
  if (!status) return { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800", dot: "bg-amber-500" };
  switch (status) {
    case "Approved": return { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800", dot: "bg-emerald-500" };
    case "Rejected": return { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800", dot: "bg-red-500" };
    case "RevisionRequested": return { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800", dot: "bg-blue-500" };
    default: return { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800", dot: "bg-amber-500" };
  }
}

function StatusBadge({ status }: { status: string | null }) {
  const Icon = getStatusIcon(status);
  const c = getStatusColor(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${c.bg} ${c.text} ${c.border} whitespace-nowrap`}>
      <Icon className="w-3 h-3" />
      {!status ? "Pending" : status === "RevisionRequested" ? "Revision" : status}
    </span>
  );
}

function getFileIcon(type: string) {
  const t = type?.toLowerCase() || "";
  if (["pdf"].includes(t)) return <FileText className="w-4 h-4 text-red-500" />;
  if (["doc", "docx"].includes(t)) return <FileText className="w-4 h-4 text-blue-500" />;
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(t)) return <FileText className="w-4 h-4 text-green-500" />;
  return <FileText className="w-4 h-4 text-muted-foreground" />;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getPriority(doc: ThesisDocumentSummary): { label: string; color: string; dot: string } {
  if (doc.reviewStatus === "Approved" || doc.reviewStatus === "Rejected") {
    return { label: "Low", color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" };
  }
  if (doc.reviewStatus === "RevisionRequested") {
    return { label: "High", color: "text-red-600 dark:text-red-400", dot: "bg-red-500" };
  }
  const daysSinceUpload = (Date.now() - new Date(doc.uploadedAt).getTime()) / 86400000;
  if (daysSinceUpload <= 7) return { label: "High", color: "text-red-600 dark:text-red-400", dot: "bg-red-500" };
  if (daysSinceUpload <= 14) return { label: "Medium", color: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" };
  return { label: "Low", color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" };
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/50">
      <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground font-medium leading-tight">{label}</p>
        <p className="text-xs font-semibold text-foreground truncate leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function GuideThesisReviews() {
  const [documents, setDocuments] = useState<ThesisDocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
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
  const [mobilePage, setMobilePage] = useState(1);
  const mobilePageSize = 10;
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

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

  const getFilePreviewLabel = (doc: ThesisDocumentSummary) => {
    const t = doc.fileType?.toLowerCase() || "";
    if (["pdf", "png", "jpg", "jpeg", "gif", "webp", "doc", "docx", "txt", "csv"].includes(t)) return "Preview";
    return "Open";
  };

  const filteredDocs = useMemo(() => documents.filter(d => {
    if (statusFilter !== "all" && d.reviewStatus !== statusFilter && !(statusFilter === "Pending" && !d.reviewStatus)) return false;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      return d.studentName.toLowerCase().includes(q) || d.fileName.toLowerCase().includes(q) || d.projectTitle.toLowerCase().includes(q);
    }
    return true;
  }), [documents, statusFilter, debouncedSearch]);

  const totalMobilePages = Math.max(1, Math.ceil(filteredDocs.length / mobilePageSize));
  const mobileDocs = filteredDocs.slice((mobilePage - 1) * mobilePageSize, mobilePage * mobilePageSize);

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full max-w-full">
        <div className="w-full lg:w-80 lg:flex-shrink-0 flex flex-col gap-3">
          <div className="lg:hidden flex flex-col gap-3">
            <div className="h-6 bg-muted rounded-lg w-1/3 animate-pulse" />
            <div className="h-3 bg-muted rounded-lg w-1/4 animate-pulse" />
            <div className="h-12 bg-muted rounded-full animate-pulse" />
            <div className="flex gap-2">
              <div className="h-9 bg-muted rounded-full w-16 animate-pulse" />
              <div className="h-9 bg-muted rounded-full w-20 animate-pulse" />
              <div className="h-9 bg-muted rounded-full w-24 animate-pulse" />
            </div>
          </div>
          <div className="hidden lg:block h-10 bg-muted rounded-xl animate-pulse" />
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="lg:hidden flex flex-col gap-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
        <div className="hidden lg:flex flex-1">
          <SkeletonDetail />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-full">
      {/* ========== DESKTOP HEADER ========== */}
      <div className="hidden lg:flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Thesis Reviews</h2>
          <p className="text-sm text-muted-foreground">{documents.length} document{documents.length !== 1 ? "s" : ""} submitted</p>
        </div>
        <div className="flex items-center gap-1.5">
          {["all", "Pending", "Approved", "RevisionRequested", "Rejected"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              aria-pressed={statusFilter === s}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-1 ${statusFilter === s ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 shadow-sm" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              {s === "all" ? "All" : s === "RevisionRequested" ? "Revision" : s}
            </button>
          ))}
        </div>
      </div>

      {/* ========== MOBILE HEADER ========== */}
      <div className="lg:hidden flex flex-col gap-3 sticky top-0 bg-background z-10 pt-1 pb-2 -mx-1 px-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Thesis Reviews</h2>
            <p className="text-xs text-muted-foreground">{documents.length} document{documents.length !== 1 ? "s" : ""} submitted</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-muted border border-border rounded-full pl-10 pr-10 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 touch-target"
            placeholder="Search students or files..."
            aria-label="Search thesis documents"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); searchRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-muted-foreground/10 transition-colors touch-target"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-0.5">
          {["all", "Pending", "Approved", "RevisionRequested", "Rejected"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              aria-pressed={statusFilter === s}
              className={`text-xs font-semibold px-3.5 py-2 rounded-full border transition-all duration-200 whitespace-nowrap touch-target focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${statusFilter === s ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 shadow-sm" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              {s === "all" ? "All" : s === "RevisionRequested" ? "Revision" : s}
            </button>
          ))}
        </div>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-4 lg:h-[calc(100vh-14rem)]">

        {/* ========== LEFT PANEL ========== */}
        <div className="w-full lg:w-80 lg:flex-shrink-0 flex flex-col gap-2 lg:overflow-y-auto lg:scrollbar-hide">
          {/* Desktop Search */}
          <div className="hidden lg:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-muted border border-border rounded-full pl-9 pr-9 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              placeholder="Search students or files..."
              aria-label="Search thesis documents"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted-foreground/10 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* ===== DESKTOP SIDEBAR ITEMS ===== */}
          <div className="hidden lg:flex flex-col gap-1.5 mt-1">
            {filteredDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                <FileCheck className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-foreground/60">No documents found</p>
                <p className="text-xs text-muted-foreground/50 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredDocs.map(doc => {
                const isSelected = selectedDoc?.documentId === doc.documentId;
                const p = getPriority(doc);
                return (
                  <button
                    key={doc.documentId}
                    onClick={() => handleSelectDocument(doc)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${isSelected ? "border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/30 shadow-sm" : "border-border/60 hover:border-border hover:bg-muted/50"}`}
                    aria-current={isSelected ? "true" : undefined}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar name={doc.studentName} size="sm" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{doc.studentName}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{doc.enrollment}</p>
                        </div>
                      </div>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.dot}`} title={`Priority: ${p.label}`} />
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      {getFileIcon(doc.fileType)}
                      <span className="text-xs text-muted-foreground truncate flex-1">{doc.fileName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className="font-mono">v{doc.version}</span>
                        <span className="text-border">·</span>
                        <span>{new Date(doc.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                      {getStatusBadge(doc.reviewStatus)}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* ===== MOBILE CARDS ===== */}
          <div className="lg:hidden flex flex-col gap-3 pb-4">
            {mobileDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-6">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                  <FileCheck className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-base font-semibold text-foreground/70">No thesis submissions yet</p>
                <p className="text-sm text-muted-foreground/60 mt-1 max-w-xs">
                  {search || statusFilter !== "all"
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "When students submit their thesis documents, they will appear here."}
                </p>
              </div>
            ) : (
              mobileDocs.map((doc, index) => {
                const isSelected = selectedDoc?.documentId === doc.documentId;
                const p = getPriority(doc);
                const sc = getStatusColor(doc.reviewStatus);
                return (
                  <div
                    key={doc.documentId}
                    className={`group bg-card border rounded-2xl p-4 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${isSelected ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/5" : "border-border/70 hover:border-border hover:shadow-md hover:shadow-black/5"}`}
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar name={doc.studentName} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-foreground truncate">{doc.studentName}</p>
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.dot}`} title={`Priority: ${p.label}`} />
                          </div>
                          <p className="text-xs text-muted-foreground/70 truncate">{doc.department || doc.enrollment}</p>
                        </div>
                      </div>
                      <StatusBadge status={doc.reviewStatus} />
                    </div>

                    {/* Research Title */}
                    <p className="text-base font-semibold text-foreground/90 line-clamp-2 mb-3 leading-snug">
                      {doc.researchTopic || doc.projectTitle}
                    </p>

                    {/* File Name */}
                    <div className="flex items-center gap-2 mb-3 px-2.5 py-2 rounded-xl bg-muted/30 border border-border/50">
                      {getFileIcon(doc.fileType)}
                      <span className="text-xs text-muted-foreground truncate flex-1">{doc.fileName}</span>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <InfoRow
                        icon={Calendar}
                        label="Submission Date"
                        value={new Date(doc.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      />
                      <InfoRow
                        icon={Hash}
                        label="Version"
                        value={`v${doc.version}`}
                      />
                      <InfoRow
                        icon={doc.fileType?.toLowerCase() === "pdf" ? FileText : FileText}
                        label="File Type"
                        value={(doc.fileType?.toUpperCase() || "FILE")}
                      />
                      <InfoRow
                        icon={HardDrive}
                        label="File Size"
                        value={formatFileSize(doc.fileSize)}
                      />
                      <InfoRow
                        icon={Activity}
                        label="Review Status"
                        value={doc.reviewStatus || "Pending"}
                      />
                      <InfoRow
                        icon={Flag}
                        label="Priority"
                        value={p.label}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleSelectDocument(doc)}
                        className="h-11 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-150 touch-target flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-1"
                        aria-label={`View ${doc.studentName}'s thesis`}
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">View</span>
                      </button>
                      {doc.reviewStatus !== "Approved" && (
                        <button
                          onClick={() => { handleSelectDocument(doc); openReviewDialog("Approved"); }}
                          className="h-11 border border-border/70 text-xs font-semibold text-foreground rounded-xl hover:bg-muted active:bg-muted/70 transition-all duration-150 touch-target flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                          aria-label={`Review ${doc.studentName}'s thesis`}
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span className="hidden sm:inline">Review</span>
                        </button>
                      )}
                      {doc.reviewStatus === "Approved" && (
                        <div className="h-11 border border-border/70 text-xs font-semibold text-muted-foreground rounded-xl bg-muted/20 flex items-center justify-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="hidden sm:inline">Approved</span>
                        </div>
                      )}
                      <button
                        onClick={async () => { try { await guideService.downloadDocument(doc.projectId, doc.documentId, doc.fileName); } catch (e) { console.error("Download failed", e); } }}
                        className="h-11 border border-border/70 text-xs font-semibold text-muted-foreground rounded-xl hover:bg-muted active:bg-muted/70 transition-all duration-150 touch-target flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        aria-label={`Download ${doc.studentName}'s thesis`}
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Mobile Pagination */}
            {filteredDocs.length > mobilePageSize && (
              <div className="flex items-center justify-center gap-4 pt-2 pb-4">
                <button
                  onClick={() => setMobilePage(p => Math.max(1, p - 1))}
                  disabled={mobilePage <= 1}
                  className="w-11 h-11 rounded-xl border border-border/70 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 touch-target focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalMobilePages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setMobilePage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-200 touch-target focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${mobilePage === p ? "bg-indigo-600 text-white shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
                      aria-label={`Page ${p}`}
                      aria-current={mobilePage === p ? "page" : undefined}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setMobilePage(p => Math.min(totalMobilePages, p + 1))}
                  disabled={mobilePage >= totalMobilePages}
                  className="w-11 h-11 rounded-xl border border-border/70 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 touch-target focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========== RIGHT PANEL ========== */}
        {selectedDoc ? (
          <div className="flex-1 flex flex-col gap-4 lg:overflow-y-auto lg:scrollbar-hide w-full min-w-0">
            {/* Back button (mobile) */}
            <div className="lg:hidden flex items-center justify-between">
              <button
                onClick={() => setSelectedDoc(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors touch-target py-1.5 px-1 -ml-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 rounded-lg"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back to documents
              </button>
              <StatusBadge status={selectedDoc.reviewStatus} />
            </div>

            {/* Document Info Bar */}
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 transition-all duration-200">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <h3 className="font-bold text-foreground text-sm sm:text-base truncate">{selectedDoc.fileName}</h3>
                    <div className="hidden lg:inline-flex"><StatusBadge status={selectedDoc.reviewStatus} /></div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/70">{selectedDoc.studentName}</span>
                    <span className="text-border">·</span>
                    <span>{selectedDoc.enrollment}</span>
                    <span className="text-border">·</span>
                    <span>{selectedDoc.department}</span>
                    <span className="text-border">·</span>
                    <span className="font-mono">v{selectedDoc.version}</span>
                  </div>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    {selectedDoc.projectTitle}
                    <span className="mx-1.5 text-border">·</span>
                    Uploaded {new Date(selectedDoc.uploadedAt).toLocaleString()}
                  </p>
                  {selectedDoc.reviewComment && (
                    <div className="mt-3 p-3 bg-muted/40 border border-border/70 rounded-xl">
                      <p className="text-[11px] font-bold text-muted-foreground mb-0.5 flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3" />
                        Latest Review Feedback
                      </p>
                      <p className="text-xs text-foreground/70">{selectedDoc.reviewComment}</p>
                    </div>
                  )}
                </div>
                {/* Desktop action buttons */}
                <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                  {selectedDoc.reviewStatus !== "Approved" && (
                    <>
                      <button onClick={() => openReviewDialog("Approved")} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all duration-150 flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                        <CheckCircle className="w-3.5 h-3.5" />Approve
                      </button>
                      <button onClick={() => openReviewDialog("RevisionRequested")} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all duration-150 flex items-center gap-1.5 shadow-sm shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                        <RefreshCw className="w-3.5 h-3.5" />Revise
                      </button>
                      <button onClick={() => openReviewDialog("Rejected")} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all duration-150 flex items-center gap-1.5 shadow-sm shadow-red-600/20 focus:outline-none focus:ring-2 focus:ring-red-500/50">
                        <X className="w-3.5 h-3.5" />Reject
                      </button>
                    </>
                  )}
                  <button onClick={handleDownload} className="border border-border/70 text-xs font-semibold text-muted-foreground px-3.5 py-2 rounded-xl hover:bg-muted hover:text-foreground transition-all duration-150 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                    <Download className="w-3.5 h-3.5" />Download
                  </button>
                  <button onClick={handleOpenInNewTab} className="border border-border/70 text-xs font-semibold text-muted-foreground px-3.5 py-2 rounded-xl hover:bg-muted hover:text-foreground transition-all duration-150 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                    <ExternalLink className="w-3.5 h-3.5" />Open
                  </button>
                </div>
              </div>
              {/* Mobile action buttons */}
              <div className="lg:hidden flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/70">
                {selectedDoc.reviewStatus !== "Approved" && (
                  <>
                    <button onClick={() => openReviewDialog("Approved")} className="flex-1 min-w-[72px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold py-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 touch-target shadow-sm shadow-emerald-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                      <CheckCircle className="w-4 h-4" />Approve
                    </button>
                    <button onClick={() => openReviewDialog("RevisionRequested")} className="flex-1 min-w-[72px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold py-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 touch-target shadow-sm shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                      <RefreshCw className="w-4 h-4" />Revise
                    </button>
                    <button onClick={() => openReviewDialog("Rejected")} className="flex-1 min-w-[72px] bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold py-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 touch-target shadow-sm shadow-red-600/20 focus:outline-none focus:ring-2 focus:ring-red-500/50">
                      <X className="w-4 h-4" />Reject
                    </button>
                  </>
                )}
                <button onClick={handleDownload} className="flex-1 min-w-[72px] border border-border/70 text-xs font-semibold text-foreground py-3 rounded-xl hover:bg-muted active:bg-muted/70 transition-all duration-150 flex items-center justify-center gap-1.5 touch-target focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                  <Download className="w-4 h-4" />Download
                </button>
                <button onClick={handleOpenInNewTab} className="flex-1 min-w-[72px] border border-border/70 text-xs font-semibold text-foreground py-3 rounded-xl hover:bg-muted active:bg-muted/70 transition-all duration-150 flex items-center justify-center gap-1.5 touch-target focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                  <ExternalLink className="w-4 h-4" />Open
                </button>
              </div>
            </div>

            {/* Document Preview */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-200" style={{ height: "400px" }}>
              {docFetching ? (
                <div className="flex items-center justify-center h-full gap-3">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-muted-foreground animate-pulse">Loading document...</span>
                </div>
              ) : docFetchError ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                  </div>
                  <p className="text-xs text-muted-foreground max-w-xs">{docFetchError}</p>
                  <button onClick={handleDownload} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all duration-150 flex items-center gap-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                    <Download className="w-3.5 h-3.5" />Download
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground/70 mb-1">Ready to preview</p>
                    <p className="text-xs text-muted-foreground/60">Click the button below to open the document viewer</p>
                  </div>
                  <div className="flex gap-2.5">
                    <button onClick={() => openDocument(selectedDoc!, "preview")} className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all duration-150 flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                      <Eye className="w-3.5 h-3.5" />{getFilePreviewLabel(selectedDoc!)}
                    </button>
                    <button onClick={handleDownload} className="border border-border/70 text-xs font-semibold text-muted-foreground px-5 py-2.5 rounded-xl hover:bg-muted hover:text-foreground transition-all duration-150 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                      <Download className="w-3.5 h-3.5" />Download
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Version History (timeline) */}
            <Card>
              <SectionHead
                title="Version History"
                action={
                  <button
                    onClick={() => setShowVersions(!showVersions)}
                    className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 rounded-lg px-2 py-1"
                  >
                    <History className="w-3.5 h-3.5" />
                    {showVersions ? "Hide" : "Show All"} ({versions.length})
                  </button>
                }
              />
              {showVersions && versions.length > 0 && (
                <div className="relative mt-3 pl-6 ml-1 border-l-2 border-border/60 space-y-4">
                  {versions.map((v, i) => {
                    const isCurrent = v.documentId === selectedDoc.documentId;
                    return (
                      <div key={v.documentId} className="relative">
                        <div className={`absolute -left-[25px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${isCurrent ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" : "border-border/60 bg-card"}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${isCurrent ? "bg-indigo-600" : "bg-muted-foreground/40"}`} />
                        </div>
                        <div className={`p-3 rounded-xl border transition-all duration-200 ${isCurrent ? "border-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/30 shadow-sm" : "border-border/60 bg-muted/20 hover:bg-muted/40"}`}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isCurrent ? "bg-indigo-600 text-white" : "bg-muted text-muted-foreground"}`}>
                                v{v.version}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-foreground truncate">{v.fileName}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  {new Date(v.uploadedAt).toLocaleString()}
                                  <span className="mx-1">·</span>
                                  {formatFileSize(v.fileSize)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 flex-shrink-0">
                              <StatusBadge status={v.reviewStatus} />
                              <button
                                onClick={() => handleSelectDocument(v)}
                                className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500/40 rounded-lg px-2 py-1"
                              >
                                Open
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {showVersions && versions.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">No version history available</p>
              )}
            </Card>

            {/* Comments Section (timeline) */}
            <Card>
              <SectionHead title={`Comments (${comments.length})`} />
              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto scrollbar-hide mt-2">
                {commentsLoading ? (
                  <div className="space-y-3 py-4">
                    {[1, 2].map(i => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
                        <div className="flex-1">
                          <div className="h-3 bg-muted rounded-lg w-1/3 mb-2" />
                          <div className="h-8 bg-muted rounded-xl w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-8">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/30 mb-2" />
                    <p className="text-xs font-medium text-muted-foreground/60">No comments yet</p>
                    <p className="text-[11px] text-muted-foreground/40 mt-0.5">Add feedback below to start the discussion</p>
                  </div>
                ) : (
                  <div className="relative pl-6 ml-1 border-l-2 border-border/50 space-y-4 py-1">
                    {comments.map(c => (
                      <div key={c.id} className="relative">
                        <div className="absolute -left-[25px] top-2">
                          <Avatar name={c.userName} size="xs" />
                        </div>
                        <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-bold text-foreground">{c.userName}</span>
                            <span className="text-[10px] text-muted-foreground/60">
                              {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                            </span>
                            {c.isEdited && <span className="text-[10px] text-muted-foreground/40 italic">(edited)</span>}
                          </div>
                          <p className="text-xs text-foreground/80 leading-relaxed">{c.content}</p>
                          <button
                            onClick={() => setReplyTo(c.id)}
                            className="text-[10px] text-indigo-600 font-semibold hover:text-indigo-700 transition-colors mt-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 rounded px-1.5 py-0.5"
                          >
                            Reply
                          </button>
                        </div>
                        {c.replies.map(r => (
                          <div key={r.id} className="relative ml-6 mt-2">
                            <div className="absolute -left-[19px] top-2">
                              <Avatar name={r.userName} size="xs" />
                            </div>
                            <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className="text-xs font-bold text-foreground">{r.userName}</span>
                                <span className="text-[10px] text-muted-foreground/60">
                                  {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                                </span>
                              </div>
                              <p className="text-xs text-foreground/70">{r.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {replyTo && (
                <div className="flex items-center gap-2 mt-3 p-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground flex-1">Replying to comment</span>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/40 rounded px-2 py-1"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <textarea
                  className="flex-1 bg-muted/50 border border-border/70 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 resize-none"
                  rows={2}
                  placeholder="Add review comments..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSendComment(); } }}
                  aria-label="Add a comment"
                />
                <button
                  disabled={sendingComment || !commentText.trim()}
                  onClick={handleSendComment}
                  className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-4 rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center self-stretch transition-all duration-150 touch-target focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  aria-label="Send comment"
                >
                  {sendingComment ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/50 mt-1.5 text-right">
                {navigator.platform?.includes("Mac") ? "⌘" : "Ctrl"}+Enter to send
              </p>
            </Card>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center text-muted-foreground border-2 border-dashed border-border/40 rounded-2xl bg-muted/10">
            <div className="text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <p className="text-sm font-semibold text-foreground/60 mb-1">Select a document to review</p>
              <p className="text-xs text-muted-foreground/50">Choose a thesis from the sidebar to view details, preview, and provide feedback</p>
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
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowReviewDialog(false)}
        >
          <div
            className="bg-card rounded-2xl p-5 sm:p-6 w-[95%] sm:w-full max-w-lg mx-auto shadow-2xl border border-border/70 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Review thesis dialog"
          >
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${reviewAction === "Approved" ? "bg-emerald-50 dark:bg-emerald-950/30" : reviewAction === "Rejected" ? "bg-red-50 dark:bg-red-950/30" : "bg-blue-50 dark:bg-blue-950/30"}`}>
                  {reviewAction === "Approved" ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : reviewAction === "Rejected" ? <ThumbsDown className="w-4 h-4 text-red-600" /> : <RefreshCw className="w-4 h-4 text-blue-600" />}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base">
                    {reviewAction === "Approved" ? "Approve Thesis" : reviewAction === "Rejected" ? "Reject Thesis" : "Request Revision"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">{selectedDoc?.fileName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowReviewDialog(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors touch-target focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 min-h-0 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/60">
                <Avatar name={selectedDoc?.studentName || ""} size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{selectedDoc?.studentName}</p>
                  <p className="text-[10px] text-muted-foreground">v{selectedDoc?.version} · {selectedDoc?.department}</p>
                </div>
                <div className="ml-auto">{selectedDoc && <StatusBadge status={selectedDoc.reviewStatus} />}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1.5 block">
                  {reviewAction === "Rejected" ? "Rejection Reason (required)" : reviewAction === "RevisionRequested" ? "Revision Instructions" : "Comment (optional)"}
                </label>
                <textarea
                  className="w-full bg-muted/50 border border-border/70 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 resize-none"
                  rows={4}
                  placeholder={reviewAction === "Approved" ? "Add approval notes..." : reviewAction === "Rejected" ? "Explain why this thesis is being rejected..." : "Describe what changes are needed..."}
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  aria-label="Review comment"
                />
                {reviewAction === "Rejected" && !reviewComment.trim() && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" />
                    Rejection reason is required
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1.5 block flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  Score (0-100, optional)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={reviewScore}
                    onChange={e => setReviewScore(Number(e.target.value))}
                    className="flex-1 accent-indigo-600"
                    aria-label="Review score"
                  />
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-xs font-bold text-foreground">
                    {reviewScore}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2.5 justify-end mt-4 pt-4 border-t border-border/70 flex-shrink-0">
              <button
                onClick={() => setShowReviewDialog(false)}
                className="w-full sm:w-auto border border-border/70 text-xs font-semibold text-muted-foreground px-5 py-3 sm:py-2.5 rounded-xl hover:bg-muted hover:text-foreground transition-all duration-150 touch-target focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                disabled={submittingReview || (reviewAction === "Rejected" && !reviewComment.trim())}
                className={`w-full sm:w-auto text-xs font-bold px-5 py-3 sm:py-2.5 rounded-xl text-white flex items-center justify-center gap-1.5 touch-target transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${reviewAction === "Approved" ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-600/20 focus:ring-emerald-500" : reviewAction === "Rejected" ? "bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-red-600/20 focus:ring-red-500" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-600/20 focus:ring-blue-500"}`}
              >
                {submittingReview ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                )}
                {reviewAction === "Approved" ? "Approve" : reviewAction === "Rejected" ? "Reject" : "Request Revision"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
