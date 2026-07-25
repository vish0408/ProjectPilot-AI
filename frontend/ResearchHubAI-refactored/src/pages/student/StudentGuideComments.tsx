import { useState, useEffect } from "react";
import { Bell, CheckCircle, MessageCircle, Loader2 } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { studentService } from "../../services/StudentService";
import { guideService } from "../../services/GuideService";
import type { Chapter, ChapterComment } from "../../types/Guide";

interface CommentItem {
  id: string;
  chapterTitle: string;
  text: string;
  date: string;
  isUnread: boolean;
}

export default function StudentGuideComments() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const projects = await studentService.getMyProjects();
        if (projects.items.length > 0) {
          const chapters: Chapter[] = await guideService.getProjectChapters(projects.items[0].id);
          const all: CommentItem[] = [];
          for (const ch of chapters) {
            try {
              const chapterComments: ChapterComment[] = await guideService.getChapterComments(ch.id);
              all.push(...chapterComments.map((c: ChapterComment) => ({
                id: c.id,
                chapterTitle: ch.title || "Chapter",
                text: c.content || "",
                date: new Date(c.createdAt).toLocaleDateString(),
                isUnread: false,
              })));
            } catch { /* skip chapter */ }
          }
          setComments(all);
        }
      } catch {
        setError("Failed to load comments");
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const unread = comments.filter(c => c.isUnread).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Total Comments" value={`${comments.length}`} icon={MessageCircle} color="bg-blue-500"/>
        <StatCard label="Unread" value={`${unread}`} icon={Bell} color="bg-amber-500"/>
        <StatCard label="Resolved" value={`${comments.length - unread}`} icon={CheckCircle} color="bg-green-500"/>
      </div>
      <Card>
        <SectionHead title="Guide Feedback"/>
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
        ) : error ? (
          <p className="text-sm text-red-600 text-center py-8">{error}</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No guide comments yet. Comments from your guide will appear here once they review your chapters.</p>
        ) : (
          comments.map((c, idx) => (
            <div key={c.id} className={`border-2 rounded-xl p-4 border-border ${idx > 0 ? "mt-3" : ""}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div><p className="font-bold text-sm text-foreground">Guide</p><p className="text-xs text-muted-foreground">{c.date}</p></div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{c.text}</p>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}