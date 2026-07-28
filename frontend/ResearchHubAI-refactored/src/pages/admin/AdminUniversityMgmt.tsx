import { useState, useEffect } from "react";
import { Building, Layers, Plus, Edit, Trash2, Globe, Search, X, Check } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { adminService } from "../../services/AdminService";
import { useDebounce } from "../../hooks/useDebounce";
import type { CollegeResponse, CreateCollegeRequest, UpdateCollegeRequest } from "../../types/Admin";

export default function AdminUniversityMgmt() {
  const [colleges, setColleges] = useState<CollegeResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CollegeResponse | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200);
  const [form, setForm] = useState({ name: "", code: "", address: "", phone: "", email: "", website: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const data = await adminService.getColleges();
      setColleges(data);
    } catch (e) { if (e instanceof Error) setError(e.message); }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ name: "", code: "", address: "", phone: "", email: "", website: "" });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (c: CollegeResponse) => {
    setEditing(c);
    setForm({ name: c.name, code: c.code, address: c.address, phone: c.phone, email: c.email, website: c.website });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("College name is required"); return; }
    if (!form.code.trim()) { setError("College code is required"); return; }
    const safe = Array.isArray(colleges) ? colleges : [];
    const duplicate = editing
      ? safe.some(c => (c.name.toLowerCase() === form.name.trim().toLowerCase() || c.code.toLowerCase() === form.code.trim().toLowerCase()) && c.id !== editing.id)
      : safe.some(c => c.name.toLowerCase() === form.name.trim().toLowerCase() || c.code.toLowerCase() === form.code.trim().toLowerCase());
    if (duplicate) { setError("A college with this name or code already exists"); return; }
    setSaving(true);
    try {
      if (editing) {
        const updated = await adminService.updateCollege(editing.id, form as UpdateCollegeRequest);
        setColleges(prev => prev.map(c => c.id === editing.id ? updated : c));
      } else {
        const created = await adminService.createCollege(form as CreateCollegeRequest);
        setColleges(prev => [...prev, created]);
      }
      resetForm();
    } catch (e) { if (e instanceof Error) setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this college? All associated departments will be affected.")) return;
    try { await adminService.deleteCollege(id); setColleges(prev => prev.filter(c => c.id !== id)); }
    catch (e) { if (e instanceof Error) setError(e.message); }
  };

  const safeColleges = Array.isArray(colleges) ? colleges : [];
  const filtered = safeColleges.filter(c =>
    !debouncedSearch || c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    c.code.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (c.address ?? "").toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-center justify-between">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          <button onClick={() => setError(null)}><X className="w-4 h-4 text-red-500" /></button>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Colleges" value={`${safeColleges.length}`} icon={Building} color="bg-blue-600"/>
        <StatCard label="Total Departments" value={`${safeColleges.reduce((s, c) => s + c.departmentCount, 0)}`} icon={Layers} color="bg-indigo-500"/>
        <StatCard label="Active" value={`${safeColleges.filter(c => c.isActive).length}`} icon={Globe} color="bg-green-500"/>
      </div>
      <SectionHead title="Colleges" desc="Manage colleges and institutions"
        action={
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add College
          </button>
        }
      />

      {showForm && (
        <Card>
          <SectionHead title={editing ? "Edit College" : "Add College"} action={
            <button onClick={resetForm} className="text-xs text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          } />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">College Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. College of Engineering"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Code *</label>
              <input value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="e.g. CE"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1">Address</label>
              <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Address"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone number"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Email</label>
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email address"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1">Website</label>
              <input value={form.website} onChange={e => setForm({...form, website: e.target.value})} placeholder="Website URL"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving..." : <><Check className="w-4 h-4" /> {editing ? "Update" : "Create"}</>}
            </button>
            <button onClick={resetForm} className="border border-border text-sm font-medium px-4 py-2 rounded-xl hover:bg-muted">Cancel</button>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-3 px-1 pb-4">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search colleges..."
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground" />
          {search && <button onClick={() => setSearch("")}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Card key={c.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.code}</p>
                  </div>
                </div>
                <Badge variant={c.isActive ? "success" : "outline"}>{c.isActive ? "Active" : "Inactive"}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{c.address}</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-muted/60 rounded-xl p-2 text-center">
                  <p className="text-sm font-bold text-foreground">{c.departmentCount}</p>
                  <p className="text-xs text-muted-foreground">Departments</p>
                </div>
                <div className="bg-muted/60 rounded-xl p-2 text-center">
                  <p className="text-sm font-bold text-foreground truncate">{c.email}</p>
                  <p className="text-xs text-muted-foreground">Email</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(c)} className="flex-1 border border-border text-xs font-medium text-muted-foreground py-1.5 rounded-lg hover:bg-muted flex items-center justify-center gap-1">
                  <Edit className="w-3.5 h-3.5" />Edit
                </button>
                <button onClick={() => handleDelete(c.id)} className="flex-1 border border-border text-xs font-medium text-red-500 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" />Delete
                </button>
              </div>
            </Card>
          ))}
          {!filtered.length && (
            <Card className="sm:col-span-2 lg:col-span-3"><p className="text-sm text-muted-foreground text-center py-8">{search ? "No colleges match your search" : "No colleges found. Add your first college above."}</p></Card>
          )}
        </div>
      </Card>
    </div>
  );
}
