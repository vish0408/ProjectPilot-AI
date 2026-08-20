import { useState, useEffect, useCallback } from "react";
import { Building, Check, Loader2, Plus, RefreshCw, Search, Telescope, Trash2, X, XCircle } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { adminService } from "../../services/AdminService";
import type { ResearchTopicResponse } from "../../types/Admin";
import type { ResearchCategory } from "../../types/Hod";
import type { DepartmentResponse } from "../../types/Admin";

function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); } catch { return d; }
}

export default function AdminResearchTopics() {
  const [topics, setTopics] = useState<ResearchTopicResponse[]>([]);
  const [categories, setCategories] = useState<ResearchCategory[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ResearchTopicResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", categoryId: "", departmentId: "" });

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); };
  const showError = (msg: string) => { setError(msg); setTimeout(() => setError(null), 5000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, c, d] = await Promise.all([
        adminService.getResearchTopics(),
        adminService.getResearchCategories(),
        adminService.getAllDepartments(),
      ]);
      setTopics(t ?? []);
      setCategories(c ?? []);
      setDepartments(d ?? []);
    } catch (e) { if (e instanceof Error) showError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm({ title: "", description: "", categoryId: categories[0]?.id ?? "", departmentId: "" }); setModalOpen(true); };
  const openEdit = (t: ResearchTopicResponse) => {
    setEditing(t);
    setForm({ title: t.title, description: t.description || "", categoryId: t.categoryId, departmentId: t.departmentId || "" });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { showError("Topic title is required."); return; }
    if (!form.categoryId) { showError("Please select a category."); return; }
    setSaving(true);
    try {
      if (editing) {
        await adminService.updateResearchTopic(editing.id, { title: form.title.trim(), description: form.description.trim(), categoryId: form.categoryId, isActive: editing.isActive });
        showSuccess("Topic updated successfully.");
      } else {
        await adminService.createResearchTopic({ title: form.title.trim(), description: form.description.trim(), categoryId: form.categoryId, departmentId: form.departmentId || undefined });
        showSuccess("Topic created successfully.");
      }
      setModalOpen(false);
      await load();
    } catch (e) { if (e instanceof Error) showError(e.message); }
    finally { setSaving(false); }
  };

  const handleToggleActive = async (t: ResearchTopicResponse) => {
    setActionLoading(`toggle-${t.id}`);
    try {
      await adminService.updateResearchTopic(t.id, { title: t.title, description: t.description || "", categoryId: t.categoryId, isActive: !t.isActive });
      setTopics(prev => prev.map(i => i.id === t.id ? { ...i, isActive: !i.isActive } : i));
      showSuccess(`Topic ${t.isActive ? "deactivated" : "activated"}.`);
    } catch (e) { if (e instanceof Error) showError(e.message); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (t: ResearchTopicResponse) => {
    if (!confirm(`Delete topic "${t.title}"?`)) return;
    setActionLoading(`delete-${t.id}`);
    try {
      await adminService.deleteResearchTopic(t.id);
      await load();
      showSuccess("Topic deleted.");
    } catch (e) { if (e instanceof Error) showError(e.message); }
    finally { setActionLoading(null); }
  };

  const filtered = topics.filter(t => {
    if (search && !`${t.title} ${t.categoryName} ${t.departmentName || ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory && t.categoryId !== filterCategory) return false;
    return true;
  });

  const currentYear = new Date().getFullYear();
  const activeCount = topics.filter(t => t.isActive).length;
  const newThisYear = topics.filter(t => { try { return new Date(t.createdAt).getFullYear() === currentYear; } catch { return false; } }).length;
  const involvedDepts = new Set(topics.map(t => t.departmentName || "Unassigned")).size;

  const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all";

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-center justify-between">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          <button onClick={() => setError(null)}><X className="w-4 h-4 text-red-500" /></button>
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 flex items-center justify-between">
          <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><p className="text-xs text-green-700 dark:text-green-300">{success}</p></div>
          <button onClick={() => setSuccess(null)}><X className="w-4 h-4 text-green-500" /></button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Active Topics" value={`${activeCount}`} icon={Telescope} color="bg-blue-500" />
        <StatCard label="Categories" value={`${categories.length}`} icon={Building} color="bg-indigo-500" />
        <StatCard label="Departments" value={`${involvedDepts}`} icon={Telescope} color="bg-green-500" />
        <StatCard label="New This Year" value={`${newThisYear}`} icon={Plus} color="bg-amber-500" />
      </div>

      <SectionHead
        title="Research Topics"
        desc="Curate research topics available to scholars across all colleges"
        action={
          <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Topic
          </button>
        }
      />

      <Card>
        <div className="flex items-center gap-3 px-1 pb-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search topics..."
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="bg-input-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading topics...
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            {search || filterCategory ? "No topics match your filters" : "No research topics found. Add the first one above."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <div key={t.id} className="border border-border rounded-xl p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{t.categoryName}</Badge>
                  {t.departmentName && <span className="text-[11px] text-muted-foreground">{t.departmentName}</span>}
                </div>
                <p className="font-bold text-sm text-foreground mb-1 line-clamp-2">{t.title}</p>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{t.description || "No description"}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={t.isActive ? "success" : "danger"}>{t.isActive ? "Active" : "Inactive"}</Badge>
                    <span className="text-[10px] text-muted-foreground">{fmtDate(t.createdAt)}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" title="Edit">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleToggleActive(t)} disabled={actionLoading === `toggle-${t.id}`}
                      className="p-1.5 rounded-lg hover:bg-muted text-blue-600 disabled:opacity-50" title={t.isActive ? "Deactivate" : "Activate"}>
                      {actionLoading === `toggle-${t.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => handleDelete(t)} disabled={actionLoading === `delete-${t.id}`}
                      className="p-1.5 rounded-lg hover:bg-muted text-red-500 disabled:opacity-50" title="Delete">
                      {actionLoading === `delete-${t.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editing ? "Edit Topic" : "Add Topic"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Title <span className="text-red-500">*</span></label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="e.g. Deep Learning for Medical Imaging" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category <span className="text-red-500">*</span></label>
                <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className={inputCls}>
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Department</label>
                <select value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })} className={inputCls}>
                  <option value="">All departments</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                  className={inputCls} placeholder="Brief description of the topic" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="px-6 py-2.5 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Saving..." : editing ? "Update Topic" : "Create Topic"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}