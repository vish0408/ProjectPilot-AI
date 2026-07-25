import { useState, useEffect } from "react";
import { Plus, Check, Trash2, Edit, Calendar, X, Save } from "lucide-react";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import Badge from "../../components/common/Badge";
import { adminService } from "../../services/AdminService";
import type { AcademicYearResponse, CreateAcademicYearRequest, UpdateAcademicYearRequest } from "../../types/Admin";

export default function AdminAcademicYears() {
  const [items, setItems] = useState<AcademicYearResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AcademicYearResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "" });

  const fetchData = async () => {
    try {
      const data = await adminService.getAcademicYears();
      setItems(data);
    } catch (e) { if (e instanceof Error) setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ name: "", startDate: "", endDate: "" });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (item: AcademicYearResponse) => {
    setEditing(item);
    setForm({
      name: item.name,
      startDate: item.startDate.slice(0, 10),
      endDate: item.endDate.slice(0, 10),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.startDate || !form.endDate) {
      setError("All fields are required");
      return;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError("End date must be after start date");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const data: UpdateAcademicYearRequest = {
          name: form.name.trim(),
          startDate: form.startDate,
          endDate: form.endDate,
          isCurrent: editing.isCurrent,
          isActive: true,
        };
        await adminService.updateAcademicYear(editing.id, data);
      } else {
        const data: CreateAcademicYearRequest = {
          name: form.name.trim(),
          startDate: form.startDate,
          endDate: form.endDate,
        };
        await adminService.createAcademicYear(data);
      }
      resetForm();
      fetchData();
    } catch (e) { if (e instanceof Error) setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this academic year?")) return;
    try { await adminService.deleteAcademicYear(id); fetchData(); }
    catch (e) { if (e instanceof Error) setError(e.message); }
  };

  const handleSetCurrent = async (id: string) => {
    try { await adminService.setCurrentAcademicYear(id); fetchData(); }
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
      <SectionHead title="Academic Years" desc="Manage academic years"
        action={
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Year
          </button>
        }
      />

      {showForm && (
        <Card>
          <SectionHead title={editing ? "Edit Academic Year" : "Add Academic Year"} action={
            <button onClick={resetForm} className="text-xs text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          } />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. 2024-2025"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Start Date *</label>
              <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">End Date *</label>
              <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
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
            <div key={item.id} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                </p>
              </div>
              {item.isCurrent && <Badge variant="success">Current</Badge>}
              <div className="flex items-center gap-2">
                {!item.isCurrent && (
                  <button onClick={() => handleSetCurrent(item.id)} className="p-1.5 text-muted-foreground hover:text-green-600 transition-colors" title="Set as current">
                    <Check className="w-4 h-4" />
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
          {!items.length && <p className="text-sm text-muted-foreground text-center py-8">No academic years found</p>}
        </div>
      </Card>
    </div>
  );
}
