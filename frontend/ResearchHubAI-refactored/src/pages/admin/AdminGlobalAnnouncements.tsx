import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Send, Megaphone } from "lucide-react";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import Badge from "../../components/common/Badge";
import { adminService } from "../../services/AdminService";
import type { GlobalAnnouncementResponse } from "../../types/Admin";

export default function AdminGlobalAnnouncements() {
  const [items, setItems] = useState<GlobalAnnouncementResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const data = await adminService.getAnnouncements();
      setItems(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try { await adminService.deleteAnnouncement(id); fetchData(); }
    catch {}
  };

  const handlePublish = async (id: string) => {
    try { await adminService.publishAnnouncement(id); fetchData(); }
    catch {}
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
      <SectionHead title="Global Announcements" desc="Send announcements to all users"
        action={
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> New Announcement
          </button>
        }
      />
      <Card>
        <div className="flex flex-col">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Megaphone className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-foreground">{item.title}</p>
                  {item.priority === "Urgent" && <Badge variant="danger">Urgent</Badge>}
                  <Badge variant={item.status === "Published" ? "success" : "warning"}>
                    {item.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{item.content}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{item.createdByName}</span>
                  <span>·</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  {item.publishedAt && (
                    <>
                      <span>·</span>
                      <span>Published: {new Date(item.publishedAt).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.status !== "Published" && (
                  <button onClick={() => handlePublish(item.id)} className="p-1.5 text-muted-foreground hover:text-green-600 transition-colors" title="Publish">
                    <Send className="w-4 h-4" />
                  </button>
                )}
                <button className="p-1.5 text-muted-foreground hover:text-blue-600 transition-colors" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {!items.length && <p className="text-sm text-muted-foreground text-center py-8">No announcements found</p>}
        </div>
      </Card>
    </div>
  );
}
