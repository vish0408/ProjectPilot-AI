import { useEffect, useState } from "react";
import { AlertCircle, Bell, CheckCircle, MessageCircle } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { studentService } from "../../services/StudentService";
import type { Project } from "../../types/Student";
import type { Chapter, ChapterComment } from "../../types/Guide";

export default function StudentGuideComments() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyTo, setReplyTo] = useState<{ chapterId: string; commentId: string } | null>(null);
  const [replyText, setReplyText] = useState("");

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

  const loadChapters = async (pid: string) => {
    try {
      const chs = await studentService.getProjectChapters(pid);
      setChapters(chs);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError("");
    loadChapters(projectId);
  }, [projectId]);

  const comments: { chapter: Chapter; comment: ChapterComment }[] = chapters.flatMap((c) =>
    (c.comments || []).map((comment) => ({ chapter: c, comment }))
  );

  const totalComments = comments.length;
  const unread = 0;
  const resolved = comments.filter(({ comment }) => comment.content.toLowerCase().includes("approved")).length;
  const actionRequired = comments.filter(({ comment }) => !comment.content.toLowerCase().includes("approved")).length;

  const handleReply = async (chapterId: string, commentId: string) => {
    if (!replyText.trim()) return;
    try {
      await studentService.addChapterComment(chapterId, { content: replyText.trim() });
      setReplyText("");
      setReplyTo(null);
      await loadChapters(projectId);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send reply");
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
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Comments" value={`${totalComments}`} icon={MessageCircle} color="bg-blue-500"/>
        <StatCard label="Resolved" value={`${resolved}`} icon={CheckCircle} color="bg-green-500"/>
        <StatCard label="Action Required" value={`${actionRequired}`} icon={AlertCircle} color="bg-red-500"/>
        <StatCard label="Unread" value={`${unread}`} icon={Bell} color="bg-amber-500"/>
      </div>

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
        <SectionHead title="Guide Feedback" desc="Comments and feedback from your guide" />
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No comments yet</p>
        ) : (
          comments.map(({ chapter, comment }) => (
            <div key={comment.id} className={`border-2 rounded-xl p-4 border-border ${comments[0] && comments[0].comment.id === comment.id ? "" : "mt-3"}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <Avatar name={comment.userName || "Guide"}/>
                  <div>
                    <p className="font-bold text-sm text-foreground">{comment.userName || "Guide"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <Badge variant="outline">{chapter.title || `Chapter ${chapter.order}`}</Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{comment.content}</p>
              {replyTo?.commentId === comment.id ? (
                <div className="flex gap-2">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleReply(chapter.id, comment.id); }}
                    className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="Type reply..."
                    autoFocus
                  />
                  <button onClick={() => handleReply(chapter.id, comment.id)} className="bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-xl">Send</button>
                  <button onClick={() => setReplyTo(null)} className="border border-border text-xs text-muted-foreground px-3 py-2 rounded-xl hover:bg-muted">Cancel</button>
                </div>
              ) : (
                <button onClick={() => { setReplyTo({ chapterId: chapter.id, commentId: comment.id }); setReplyText(""); }} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5"/>Reply
                </button>
              )}
            </div>
          ))
        )}
      </Card>
    </div>
  );
}