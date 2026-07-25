import { useState, useEffect, useCallback } from "react";
import { UserCheck, Edit2, Plus, Trash2, Search, X, Check, GraduationCap, Shield } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import Pagination from "../../components/common/Pagination";
import { adminService } from "../../services/AdminService";
import type { HodResponse, CollegeResponse, DepartmentResponse, CreateHodRequest, UpdateHodRequest } from "../../types/Admin";

export default function AdminHodManagement() {
  const [response, setResponse] = useState<{ items: HodResponse[]; pageNumber: number; pageSize: number; totalCount: number }>({ items: [], pageNumber: 1, pageSize: 10, totalCount: 0 });
  const [colleges, setColleges] = useState<CollegeResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<HodResponse | null>(null);
  const [search, setSearch] = useState("");
  const [filterCollege, setFilterCollege] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [sortField, setSortField] = useState("fullname");
  const [sortDirection, setSortDirection] = useState("asc");
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", employeeId: "", designation: "",
    password: "", departmentId: "", qualification: "", yearsOfExperience: 0,
    profilePhoto: "", status: "Active"
  });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async (page?: number) => {
    setLoading(true);
    try {
      const [hodRes, colls] = await Promise.all([
        adminService.getHodsPaged(
          {
            pageNumber: page ?? response.pageNumber,
            pageSize: response.pageSize,
            searchTerm: search || undefined,
            sortField,
            sortDirection,
            statusFilter: undefined,
          },
          filterCollege || undefined,
          filterDepartment || undefined
        ),
        adminService.getColleges(),
      ]);
      setResponse(hodRes);
      setColleges(colls);
    } catch (e) { if (e instanceof Error) setError(e.message); }
    finally { setLoading(false); }
  }, [search, filterCollege, filterDepartment, sortField, sortDirection, response.pageNumber, response.pageSize]);

  useEffect(() => { fetchData(1); }, []);

  const loadDepartments = useCallback(async (collegeId: string) => {
    try {
      const depts = collegeId ? await adminService.getAllDepartments(collegeId) : [];
      setDepartments(depts);
    } catch { setDepartments([]); }
  }, []);

  const resetForm = () => {
    setForm({ fullName: "", email: "", phone: "", employeeId: "", designation: "", password: "", departmentId: "", qualification: "", yearsOfExperience: 0, profilePhoto: "", status: "Active" });
    setEditing(null);
    setShowForm(false);
    setDepartments([]);
  };

  const openEdit = (h: HodResponse) => {
    setEditing(h);
    setForm({
      fullName: h.fullName,
      email: h.email,
      phone: h.phone || "",
      employeeId: h.employeeId || "",
      designation: h.designation || "",
      password: "",
      departmentId: h.departmentId,
      qualification: h.qualification || "",
      yearsOfExperience: h.yearsOfExperience,
      profilePhoto: h.profilePhoto || "",
      status: h.status
    });
    setShowForm(true);
    if (h.collegeId) loadDepartments(h.collegeId);
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) { setError("Full name is required"); return; }
    if (!form.email.trim()) { setError("Email is required"); return; }
    if (!form.departmentId) { setError("Please select a department"); return; }
    if (!editing && !form.password.trim()) { setError("Password is required"); return; }
    setSaving(true);
    try {
      if (editing) {
        const updated = await adminService.updateHod(editing.id, {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone || undefined,
          employeeId: form.employeeId || undefined,
          designation: form.designation || undefined,
          departmentId: form.departmentId,
          qualification: form.qualification,
          yearsOfExperience: form.yearsOfExperience,
          profilePhoto: form.profilePhoto || undefined,
          status: form.status,
          isActive: editing.isActive
        });
        setResponse(prev => ({ ...prev, items: prev.items.map(h => h.id === editing.id ? updated : h) }));
      } else {
        await adminService.createHod({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone || undefined,
          employeeId: form.employeeId || undefined,
          designation: form.designation || undefined,
          password: form.password,
          departmentId: form.departmentId,
          qualification: form.qualification,
          yearsOfExperience: form.yearsOfExperience,
          profilePhoto: form.profilePhoto || undefined,
          status: form.status
        });
        await fetchData(1);
      }
      resetForm();
    } catch (e) { if (e instanceof Error) setError(e.message); }
    finally { setSaving(false); }
  };

  const handleToggleActive = async (h: HodResponse) => {
    try {
      await adminService.updateHod(h.id, {
        fullName: h.fullName,
        email: h.email,
        phone: h.phone || undefined,
        employeeId: h.employeeId || undefined,
        designation: h.designation || undefined,
        departmentId: h.departmentId,
        qualification: h.qualification,
        yearsOfExperience: h.yearsOfExperience,
        profilePhoto: h.profilePhoto || undefined,
        status: h.status,
        isActive: !h.isActive
      });
      setResponse(prev => ({
        ...prev,
        items: prev.items.map(item => item.id === h.id ? { ...item, isActive: !item.isActive } : item)
      }));
    } catch (e) { if (e instanceof Error) setError(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this HOD?")) return;
    try {
      await adminService.deleteHod(id);
      setResponse(prev => ({ ...prev, items: prev.items.filter(h => h.id !== id), totalCount: prev.totalCount - 1 }));
    } catch (e) { if (e instanceof Error) setError(e.message); }
  };

  const totalPages = Math.ceil(response.totalCount / response.pageSize);

  const handleSearch = () => { fetchData(1); };

  if (loading && !response.items.length) {
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total HODs" value={`${response.totalCount}`} icon={GraduationCap} color="bg-purple-500"/>
        <StatCard label="Active HODs" value={`${response.items.filter(h => h.isActive).length}`} sub="Active" icon={Shield} color="bg-green-500"/>
      </div>
      <SectionHead title="HOD Management" desc="Manage Heads of Departments across colleges"
        action={
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add HOD
          </button>
        }
      />

      {showForm && (
        <Card>
          <SectionHead title={editing ? "Edit HOD" : "Add HOD"} action={
            <button onClick={resetForm} className="text-xs text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          } />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Full Name *</label>
              <input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} placeholder="e.g. Dr. John Smith"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Email *</label>
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="hod@college.edu"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Employee ID</label>
              <input value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} placeholder="e.g. EMP001"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">College *</label>
              <select value={form.departmentId ? departments.find(d => d.id === form.departmentId)?.collegeId || "" : ""}
                onChange={e => { setForm({...form, departmentId: "" }); loadDepartments(e.target.value); }}
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary">
                <option value="">Select a college</option>
                {colleges.filter(c => c.isActive).map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Department *</label>
              <select value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})}
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" disabled={departments.length === 0}>
                <option value="">{departments.length ? "Select department" : "Select a college first"}</option>
                {departments.filter(d => d.isActive).map(d => <option key={d.id} value={d.id}>{d.departmentName} ({d.departmentCode})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Designation</label>
              <input value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} placeholder="e.g. Professor & Head"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Qualification</label>
              <input value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} placeholder="e.g. Ph.D. Computer Science"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Years of Experience</label>
              <input type="number" min={0} max={50} value={form.yearsOfExperience} onChange={e => setForm({...form, yearsOfExperience: parseInt(e.target.value) || 0})}
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            {!editing && (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Password *</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min 6 characters"
                  className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
            )}
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
        <div className="flex items-center gap-3 px-1 pb-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} placeholder="Search HODs by name, email, department..."
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground" />
            {search && <button onClick={() => { setSearch(""); fetchData(1); }}><X className="w-4 h-4 text-muted-foreground" /></button>}
          </div>
          <select value={filterCollege} onChange={e => { setFilterCollege(e.target.value); setFilterDepartment(""); fetchData(1); }}
            className="bg-input-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary">
            <option value="">All Colleges</option>
            {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={sortField} onChange={e => setSortField(e.target.value)}
            className="bg-input-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary">
            <option value="fullname">Name</option>
            <option value="email">Email</option>
            <option value="employeeid">Employee ID</option>
            <option value="departmentname">Department</option>
            <option value="collegename">College</option>
            <option value="isactive">Status</option>
          </select>
          <button onClick={() => { setSortDirection(d => d === "asc" ? "desc" : "asc"); fetchData(1); }}
            className="border border-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted">
            {sortDirection === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">Employee ID</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">Name</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">Email</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">College</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">Department</th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {response.items.map((h) => (
                <tr key={h.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3 text-xs font-mono text-muted-foreground">{h.employeeId || "—"}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {h.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{h.fullName}</p>
                        <p className="text-[11px] text-muted-foreground">{h.designation || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">{h.email}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">{h.collegeName}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">{h.departmentName}</td>
                  <td className="py-3 px-3 text-center">
                    <Badge variant={h.isActive ? "success" : "outline"}>{h.isActive ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(h)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleToggleActive(h)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title={h.isActive ? "Deactivate" : "Activate"}>
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(h.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!response.items.length && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    {search || filterCollege ? "No HODs match your filters" : "No HODs found. Add the first HOD above."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          pageNumber={response.pageNumber}
          totalPages={totalPages}
          totalCount={response.totalCount}
          hasNextPage={response.pageNumber < totalPages}
          hasPreviousPage={response.pageNumber > 1}
          onPageChange={p => fetchData(p)}
          pageSize={response.pageSize}
          onPageSizeChange={size => setResponse(prev => ({ ...prev, pageSize: size }))}
        />
      </Card>
    </div>
  );
}
