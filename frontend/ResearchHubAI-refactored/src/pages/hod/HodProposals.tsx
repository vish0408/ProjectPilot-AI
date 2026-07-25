import { useEffect, useState } from "react";
import { FileText, CheckCircle, XCircle, Clock, Send, ChevronRight, MessageSquare } from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import Avatar from "../../components/common/Avatar";
import { hodService } from "../../services/HodService";
import { HodProposal } from "../../types/Hod";

const TABS = ["All", "Pending", "Approved", "Rejected"] as const;
type Tab = (typeof TABS)[number];

const statusVariant: Record<string, "warning" | "success" | "danger" | "purple"> = {
  Pending: "warning",
  Approved: "success",
  Rejected: "danger",
  "Revision Requested": "purple",
};

export default function HodProposals() {
  const [proposals, setProposals] = useState<HodProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [selected, setSelected] = useState<HodProposal | null>(null);
  const [remarks, setRemarks] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchProposals = async (tab: Tab) => {
    setLoading(true);
    setError(null);
    try {
      const status = tab === "All" ? undefined : tab;
      setProposals(await hodService.getProposals(status));
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProposals(activeTab); }, [activeTab]);

  const openDetail = async (id: string) => {
    try {
      setSelected(await hodService.getProposalDetail(id));
      setRemarks("");
      setNewComment("");
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    }
  };

  const handleReview = async (action: string) => {
    if (!selected) return;
    setReviewLoading(true);
    try {
      const updated = await hodService.reviewProposal(selected.id, { action, remarks: remarks || undefined });
      setSelected(updated);
      setRemarks("");
      fetchProposals(activeTab);
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!selected || !newComment.trim()) return;
    setCommentLoading(true);
    try {
      await hodService.addProposalComment(selected.id, { comment: newComment });
      setSelected(await hodService.getProposalDetail(selected.id));
      setNewComment("");
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setCommentLoading(false);
    }
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

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Research Proposals</h2>
      </div>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${
              activeTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card p={false}>
        <div className="flex flex-col">
          {proposals.map((p) => (
            <button
              key={p.id}
              onClick={() => openDetail(p.id)}
              className="px-5 py-4 border-b border-border last:border-0 hover:bg-muted/40 text-left w-full flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <p className="text-sm font-bold text-foreground truncate">{p.title}</p>
                  <Badge variant={statusVariant[p.status] || "outline"}>{p.status}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{p.studentName}</span>
                  <span>{p.department}</span>
                  <span>{new Date(p.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ))}
          {!proposals.length && (
            <p className="text-sm text-muted-foreground text-center py-8">No proposals found</p>
          )}
        </div>
      </Card>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 pb-12">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-full overflow-y-auto p-6 z-10 mx-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant[selected.status] || "outline"}>{selected.status}</Badge>
                <span className="text-xs text-muted-foreground">v{selected.version}</span>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground p-1">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-base font-bold text-foreground mb-1">{selected.title}</h3>
            <p className="text-xs text-muted-foreground mb-4">
              {selected.studentName} · {selected.department} · Submitted {new Date(selected.submittedAt).toLocaleDateString()}
              {selected.guideName && ` · Guide: ${selected.guideName}`}
              {selected.reviewedByName && ` · Reviewed by ${selected.reviewedByName}`}
            </p>

            <SectionHead title="Abstract" />
            <p className="text-sm text-foreground/80 mb-5 leading-relaxed">{selected.abstract}</p>

            {selected.status !== "Pending" && selected.remarks && (
              <>
                <SectionHead title="Review Remarks" />
                <div className="text-sm text-foreground/80 bg-muted/30 rounded-xl p-3 mb-5">{selected.remarks}</div>
              </>
            )}

            {selected.status === "Pending" && (
              <Card className="mb-5">
                <SectionHead title="Review Proposal" />
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Remarks (optional)"
                  rows={3}
                  className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary mt-3"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleReview("Approved")}
                    disabled={reviewLoading}
                    className="flex items-center gap-1.5 bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleReview("Rejected")}
                    disabled={reviewLoading}
                    className="flex items-center gap-1.5 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button
                    onClick={() => handleReview("Revision Requested")}
                    disabled={reviewLoading}
                    className="flex items-center gap-1.5 bg-amber-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-colors"
                  >
                    <Clock className="w-4 h-4" /> Request Revision
                  </button>
                </div>
              </Card>
            )}

            <Card>
              <SectionHead title={`Comments (${selected.comments.length})`} />
              <div className="flex flex-col gap-3 mb-3 max-h-48 overflow-y-auto">
                {selected.comments.map((c) => (
                  <div key={c.id} className="flex gap-2">
                    <Avatar name={c.userName} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{c.userName}</span>
                        <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-foreground/80 mt-0.5">{c.comment}</p>
                    </div>
                  </div>
                ))}
                {!selected.comments.length && (
                  <p className="text-xs text-muted-foreground text-center py-4">No comments yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={handleAddComment}
                  disabled={commentLoading || !newComment.trim()}
                  className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
