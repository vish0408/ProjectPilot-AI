import { useEffect, useRef, useState } from "react";
import {
  Brain,
  CheckCircle,
  FileText,
  RefreshCw,
  X
} from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import StatCard from "../../components/cards/StatCard";
import { guideService } from "../../services/GuideService";
import { GuideDashboardData, GuideProfileDto, ThesisDocumentSummary } from "../../types/Guide";

type ActionKey = string;

export default function GuideAIReview() {
  const [profile, setProfile] = useState<GuideProfileDto | null>(null);
  const [dashboard, setDashboard] = useState<GuideDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<ActionKey | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [comment, setComment] = useState<Record<string, string>>({});
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [p, d] = await Promise.all([
          guideService.getProfile(),
          guideService.getDashboard(),
        ]);
        if (!cancelled) {
          setProfile(p);
          setDashboard(d);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Unable to load review data. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const reloadDashboard = async () => {
    try {
      const d = await guideService.getDashboard();
      setDashboard(d);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to refresh review queue.");
    }
  };

  const reviewThesis = async (doc: ThesisDocumentSummary, status: string) => {
    const key = `thesis:${doc.documentId}:${status}`;
    if (busyKey) return;
    setBusyKey(key);
    setActionError(null);
    try {
      await guideService.reviewThesisDocument(doc.documentId, {
        status,
        comment: comment[doc.documentId]?.trim() || undefined,
        score: undefined,
      });
      setComment(prev => ({ ...prev, [doc.documentId]: "" }));
      await reloadDashboard();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to submit thesis review. Please try again.");
    } finally {
      setBusyKey(null);
    }
  };

  const reviewProject = async (projectId: string, status: string) => {
    const key = `project:${projectId}:${status}`;
    if (busyKey) return;
    setBusyKey(key);
    setActionError(null);
    try {
      await guideService.createReview(projectId, {
        status,
        notes: comment[projectId]?.trim() || "",
      });
      setComment(prev => ({ ...prev, [projectId]: "" }));
      await reloadDashboard();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to submit review. Please try again.");
    } finally {
      setBusyKey(null);
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [busyKey]);

  const firstName = (profile?.fullName || "").split(" ")[0] || "Guide";
  const thesisDocs = dashboard?.pendingThesisReviews ?? [];
  const pendingReviews = dashboard?.pendingReviewList ?? [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError || !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <p className="text-sm text-muted-foreground">{loadError || "Unable to load AI review. Please try again."}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  const hasQueue = thesisDocs.length > 0 || pendingReviews.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm text-foreground">AI Review Assistance</p>
          <p className="text-xs text-muted-foreground">
            {firstName}, here is your live review workload for your assigned students.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Assigned Students" value={dashboard.totalAssignedStudents.toString()} icon={FileText} color="bg-indigo-500" />
        <StatCard label="Pending Reviews" value={dashboard.pendingReviews.toString()} icon={RefreshCw} color="bg-amber-500" />
        <StatCard label="Thesis Docs Pending" value={thesisDocs.length.toString()} icon={FileText} color="bg-blue-500" />
        <StatCard label="Upcoming Meetings" value={dashboard.upcomingMeetings.toString()} icon={CheckCircle} color="bg-green-500" />
      </div>

      {actionError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-xs text-red-700 dark:text-red-300">
          {actionError}
        </div>
      )}

      {!hasQueue ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
            <Brain className="w-10 h-10 text-muted-foreground/40" />
            <p className="font-bold text-sm text-foreground">No review available</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              You have no pending thesis documents or reviews for your assigned students right now.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {thesisDocs.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-sm text-foreground">Pending Thesis Documents</p>
                <Badge variant="warning">{thesisDocs.length} pending</Badge>
              </div>
              <div className="flex flex-col gap-3">
                {thesisDocs.map(doc => (
                  <div key={doc.documentId} className="border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">{doc.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.studentName} · {doc.enrollment || doc.department || "No enrollment"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{doc.researchTopic || doc.projectTitle}</p>
                        </div>
                      </div>
                      <Badge variant={doc.reviewStatus === "Approved" ? "success" : doc.reviewStatus ? "warning" : "default"}>
                        {doc.reviewStatus || "Not reviewed"}
                      </Badge>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Add review comments..."
                      value={comment[doc.documentId] || ""}
                      onChange={e => setComment(prev => ({ ...prev, [doc.documentId]: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary resize-none mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        disabled={busyKey !== null}
                        onClick={() => reviewThesis(doc, "Approved")}
                        className="bg-green-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        disabled={busyKey !== null}
                        onClick={() => reviewThesis(doc, "RevisionRequested")}
                        className="bg-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Request Revision
                      </button>
                      <button
                        disabled={busyKey !== null}
                        onClick={() => reviewThesis(doc, "Rejected")}
                        className="bg-red-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                      {busyKey?.startsWith(`thesis:${doc.documentId}`) && (
                        <span className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> Submitting…
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {pendingReviews.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-sm text-foreground">Pending Project Reviews</p>
                <Badge variant="warning">{pendingReviews.length} pending</Badge>
              </div>
              <div className="flex flex-col gap-3">
                {pendingReviews.map(item => (
                  <div key={item.reviewId} className="border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold text-red-600">
                          REV
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">{item.projectTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.studentName} · {item.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Submitted {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : ""}
                          </p>
                        </div>
                      </div>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Add review notes..."
                      value={comment[item.projectId] || ""}
                      onChange={e => setComment(prev => ({ ...prev, [item.projectId]: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary resize-none mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        disabled={busyKey !== null}
                        onClick={() => reviewProject(item.projectId, "Approved")}
                        className="bg-green-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        disabled={busyKey !== null}
                        onClick={() => reviewProject(item.projectId, "ChangesRequested")}
                        className="bg-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Request Revision
                      </button>
                      <button
                        disabled={busyKey !== null}
                        onClick={() => reviewProject(item.projectId, "Rejected")}
                        className="bg-red-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                      {busyKey?.startsWith(`project:${item.projectId}`) && (
                        <span className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> Submitting…
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
      <div ref={endRef} />
    </div>
  );
}
