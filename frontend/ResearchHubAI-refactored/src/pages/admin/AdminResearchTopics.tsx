import { useState, useEffect } from "react";
import { Building, Plus, Telescope, TrendingUp, Users, Edit, Trash2, Loader2 } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { adminService } from "../../services/AdminService";
import type { ResearchTopicResponse } from "../../types/Admin";
import type { ResearchCategory } from "../../types/Hod";
import type { DepartmentResponse } from "../../types/Admin";

export default function AdminResearchTopics() {
  const [topics, setTopics] = useState<ResearchTopicResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [categories, setCategories] = useState<ResearchCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ResearchTopicResponse | null>(null);
  const [filterDept, setFilterDept] = useState<string>("");
  const [form, setForm] = useState({ title: "", description: "", categoryId: "", departmentId: "" });

  const fetchData = async () => {
    try {
      const [depts, cats] = await Promise.all([
        adminService.getAllDepartments().catch(() => [] as DepartmentResponse[]),
        adminService.getResearchCategories().catch(() => [] as ResearchCategory[]),
      ]);
      setDepartments(depts);
      setCategories(cats);
      const tops = await adminService.getResearchTopics(filterDept || undefined);
      setTopics(tops);
    } catch (e) { if (e instanceof Error) setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filterDept]);

  const resetForm = () => {
    setForm({ title: "", description: "", categoryId: "", departmentId: "" });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (t: ResearchTopicResponse) => {
    setEditing(t);
    setForm({ title: t.title, description: t.description, categoryId: t.categoryId, departmentId: t.departmentId || "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.categoryId) { setError("Title and category are required"); return; }
    try {
      if (editing) {
        await adminService.updateResearchTopic(editing.id, {
          title: form.title,
          description: form.description,
          categoryId: form.categoryId,
          isActive: editing.isActive,
        });
      } else {
        await adminService.createResearchTopic({
          title: form.title,
          description: form.description,
          categoryId: form.categoryId,
          departmentId: form.departmentId || null,
        });
      }
      resetForm();
      const tops = await adminService.getResearchTopics(filterDept || undefined);
      setTopics(tops);
    } catch (e) { if (e instanceof Error) setError(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this research topic?")) return;
    try {
      await adminService.deleteResearchTopic(id);
      setTopics(prev => prev.filter(t => t.id !== id));
    } catch (e) { if (e instanceof Error) setError(e.message); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalDepts = departments.length;

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 mb-4">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Research Topics" value={`${topics.length}`} icon={Telescope} color="bg-blue-500"/>
        <StatCard label="Departments" value={`${totalDepts}`} icon={Building} color="bg-indigo-500"/>
        <StatCard label="Categories" value={`${categories.length}`} icon={TrendingUp} color="bg-green-500"/>
        <StatCard label="Active Topics" value={`${topics.filter(t => t.isActive).length}`} icon={Users} color="bg-amber-500"/>
      </div>

      <Card>
        <SectionHead title="Research Topics"
          action={
            <button onClick={() => { resetForm(); setShowForm(true); }}
              className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5"/> Add Topic
            </button>
          }
        />

        <div className="flex items-center gap-3 mb-4">
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
            className="bg-input-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
          </select>
        </div>

        {showForm && (
          <div className="border border-border rounded-xl p-4 mb-4 bg-muted/20">
            <SectionHead title={editing ? "Edit Topic" : "New Topic"} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Topic title"
                className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary col-span-2" />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" rows={2}
                className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary col-span-2 resize-none" />
              <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}
                className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary">
                <option value="">Select category</option>
                {categories.filter(c => c.isActive).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {!editing && (
                <select value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})}
                  className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary">
                  <option value="">No department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
                </select>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={handleSave} className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-700">
                {editing ? "Update" : "Create"}
              </button>
              <button onClick={resetForm} className="border border-border text-sm font-medium px-4 py-2 rounded-xl hover:bg-muted">Cancel</button>
            </div>
          </div>
        )}

        {topics.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No research topics found{filterDept ? " for this department" : ""}.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {topics.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/30">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">{t.title}</p>
                    <Badge variant={t.isActive ? "success" : "outline"}>{t.isActive ? "Active" : "Archived"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t.categoryName}
                    {t.departmentName && <span> · {t.departmentName}</span>}
                    <span> · by {t.createdByName}</span>
                  </p>
                </div>
                <div className="flex gap-1 ml-3 shrink-0">
                  <button onClick={() => openEdit(t)} className="p-1.5 border border-border rounded-lg hover:bg-muted">
                    <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 border border-border rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
