import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Send, Megaphone, X, Save } from "lucide-react";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import Badge from "../../components/common/Badge";
import { adminService } from "../../services/AdminService";
import type { GlobalAnnouncementResponse, CreateGlobalAnnouncementRequest, UpdateGlobalAnnouncementRequest } from "../../types/Admin";

export default function AdminGlobalAnnouncements() {
  const [items, setItems] = useState<GlobalAnnouncementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GlobalAnnouncementResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", priority: "Normal" });

  const fetchData = async () => {
    try {
      const data = await adminService.getAnnouncements();
      setItems(data);
    } catch (e) { if (e instanceof Error) setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ title: "", content: "", priority: "Normal" });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (item: GlobalAnnouncementResponse) => {
    setEditing(item);
    setForm({ title: item.title, content: item.content, priority: item.priority });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const data: UpdateGlobalAnnouncementRequest = {
          title: form.title.trim(),
          content: form.content.trim(),
          priority: form.priority,
          status: editing.status,
        };
        await adminService.updateAnnouncement(editing.id, data);
      } else {
        const data: CreateGlobalAnnouncementRequest = {
          title: form.title.trim(),
          content: form.content.trim(),
          priority: form.priority,
        };
        await adminService.createAnnouncement(data);
      }
      resetForm();
      fetchData();
    } catch (e) { if (e instanceof Error) setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try { await adminService.deleteAnnouncement(id); fetchData(); }
    catch (e) { if (e instanceof Error) setError(e.message); }
  };

  const handlePublish = async (id: string) => {
    try { await adminService.publishAnnouncement(id); fetchData(); }
    catch (e) { if (e instanceof Error) setError(e.message); }
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
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-center justify-between">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          <button onClick={() => setError(null)}><X className="w-4 h-4 text-red-500" /></button>
        </div>
      )}
      <SectionHead title="Global Announcements" desc="Send announcements to all users"
        action={
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> New Announcement
          </button>
        }
      />

      {showForm && (
        <Card>
          <SectionHead title={editing ? "Edit Announcement" : "New Announcement"} action={
            <button onClick={resetForm} className="text-xs text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          } />
          <div className="flex flex-col gap-3 mt-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Announcement title"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Content *</label>
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} placeholder="Announcement content..."
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary">
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
            <button onClick={resetForm} className="border border-border text-sm font-medium px-4 py-2 rounded-xl hover:bg-muted">Cancel</button>
          </div>
        </Card>
      )}

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
                <button onClick={() => openEdit(item)} className="p-1.5 text-muted-foreground hover:text-blue-600 transition-colors" title="Edit">
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
