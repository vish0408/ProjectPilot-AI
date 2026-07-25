import { useEffect, useState } from "react";
import { Megaphone, Plus, Send, XCircle } from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { hodService } from "../../services/HodService";
import { DepartmentAnnouncement } from "../../types/Hod";

export default function HodAnnouncements() {
  const [announcements, setAnnouncements] = useState<DepartmentAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", priority: "Normal" });
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    try {
      const data = await hodService.getAnnouncements();
      setAnnouncements(data);
    } catch (e) { if (e instanceof Error) setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    try {
      await hodService.createAnnouncement(form);
      setShowForm(false);
      setForm({ title: "", content: "", priority: "Normal" });
      fetch();
    } catch (e) { if (e instanceof Error) setError(e.message); }
  };

  const handlePublish = async (id: string) => {
    try {
      await hodService.publishAnnouncement(id);
      fetch();
    } catch (e) { if (e instanceof Error) setError(e.message); }
  };

  const handleExpire = async (id: string) => {
    try {
      await hodService.expireAnnouncement(id);
      fetch();
    } catch (e) { if (e instanceof Error) setError(e.message); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const priorityVariant = (p: string) => p === "Urgent" ? "danger" : p === "High" ? "warning" : "outline";

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 mb-4">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Announcements</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-700">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {showForm && (
        <Card>
          <SectionHead title="Create Announcement" />
          <div className="flex flex-col gap-3 mt-3">
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title"
              className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Content" rows={4}
              className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
              className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="Low">Low</option><option value="Normal">Normal</option><option value="High">High</option><option value="Urgent">Urgent</option>
            </select>
            <button onClick={handleCreate} className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl w-fit hover:bg-blue-700">Create</button>
          </div>
        </Card>
      )}

      <Card p={false}>
        <div className="flex flex-col">
          {announcements.map((a) => (
            <div key={a.id} className="px-5 py-4 border-b border-border last:border-0 hover:bg-muted/40">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-bold text-foreground">{a.title}</p>
                  <Badge variant={priorityVariant(a.priority)}>{a.priority}</Badge>
                  <Badge variant={a.status === "Published" ? "success" : a.status === "Draft" ? "outline" : a.status === "Scheduled" ? "warning" : "danger"}>{a.status}</Badge>
                </div>
                <div className="flex gap-1">
                  {a.status !== "Published" && a.status !== "Expired" && (
                    <button onClick={() => handlePublish(a.id)} className="text-green-600 p-1 hover:bg-green-50 rounded" title="Publish">
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                  {a.status !== "Expired" && (
                    <button onClick={() => handleExpire(a.id)} className="text-red-500 p-1 hover:bg-red-50 rounded" title="Expire">
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{a.content}</p>
              <p className="text-xs text-muted-foreground mt-1">by {a.createdByName} · {new Date(a.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
          {!announcements.length && <p className="text-sm text-muted-foreground text-center py-8">No announcements</p>}
        </div>
      </Card>
    </div>
  );
}
