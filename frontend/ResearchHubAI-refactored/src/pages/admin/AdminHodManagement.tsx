import { useState, useEffect, useCallback, useRef } from "react";
import { Edit2, Plus, Trash2, Search, X, Check, GraduationCap, Shield, Mail, RefreshCw, Lock, AlertTriangle, Eye, User } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import Pagination from "../../components/common/Pagination";
import { adminService } from "../../services/AdminService";
import { authService } from "../../services/AuthService";
import type { HodResponse, CollegeResponse, DepartmentResponse } from "../../types/Admin";

function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); } catch { return d; }
}

function fmtDateTime(d: string) {
  try { return new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); } catch { return d; }
}

const INIT_FORM = {
  fullName: "", email: "", phone: "", employeeId: "", designation: "",
  password: "", departmentId: "", qualification: "", yearsOfExperience: 0,
  profilePhoto: "", status: "Active"
};

export default function AdminHodManagement() {
  const [response, setResponse] = useState<{ items: HodResponse[]; pageNumber: number; pageSize: number; totalCount: number }>({ items: [], pageNumber: 1, pageSize: 10, totalCount: 0 });
  const [colleges, setColleges] = useState<CollegeResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [allDepartments, setAllDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<HodResponse | null>(null);
  const [viewing, setViewing] = useState<HodResponse | null>(null);
  const [search, setSearch] = useState("");
  const [filterCollege, setFilterCollege] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState("fullname");
  const [sortDirection, setSortDirection] = useState("asc");
  const [form, setForm] = useState(INIT_FORM);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<HodResponse | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); };
  const showError = (msg: string) => { setError(msg); setTimeout(() => setError(null), 5000); };

  const fetchData = useCallback(async (page?: number, size?: number, searchTerm?: string) => {
    setLoading(true);
    const p = page ?? pageNumber;
    const s = size ?? pageSize;
    const term = searchTerm ?? search;
    try {
      const [hodRes, colls] = await Promise.all([
        adminService.getHodsPaged(
          {
            pageNumber: p,
            pageSize: s,
            searchTerm: term || undefined,
            sortField,
            sortDirection,
            statusFilter: filterStatus || undefined,
          },
          filterCollege || undefined,
          filterDepartment || undefined
        ),
        adminService.getColleges(),
      ]);
      setResponse(hodRes);
      setColleges(colls);
      setPageNumber(p);
      setPageSize(s);
    } catch (e) { if (e instanceof Error) showError(e.message); }
    finally { setLoading(false); }
  }, [search, filterCollege, filterDepartment, filterStatus, sortField, sortDirection, pageNumber, pageSize]);

  useEffect(() => { fetchData(1); }, []);

  const loadAllDepartments = useCallback(async () => {
    try {
      const depts = await adminService.getAllDepartments();
      setAllDepartments(depts);
    } catch { setAllDepartments([]); }
  }, []);

  useEffect(() => { loadAllDepartments(); }, []);

  const loadDepartments = useCallback(async (collegeId: string) => {
    try {
      const depts = collegeId ? await adminService.getAllDepartments(collegeId) : [];
      setDepartments(depts);
    } catch { setDepartments([]); }
  }, []);

  const handleSearch = useCallback((term: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(term);
      setPageNumber(1);
      fetchData(1, undefined, term);
    }, 300);
  }, [fetchData]);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const resetForm = () => {
    setForm(INIT_FORM);
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
    if (!form.fullName.trim()) { showError("Full name is required"); return; }
    if (!form.email.trim()) { showError("Email is required"); return; }
    if (!form.departmentId) { showError("Please select a department"); return; }
    if (!editing && !form.password.trim()) { showError("Password is required"); return; }
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
        showSuccess("HOD updated successfully.");
        resetForm();
      } else {
        const created = await adminService.createHod({
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
        showSuccess(`HOD created successfully.${created.employeeId ? ` (ID: ${created.employeeId})` : ""}`);
        resetForm();
      }
    } catch (e) { if (e instanceof Error) showError(e.message); }
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
      showSuccess(`HOD ${h.isActive ? "deactivated" : "activated"} successfully.`);
    } catch (e) { if (e instanceof Error) showError(e.message); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setActionLoading(confirmDelete.id);
    try {
      await adminService.deleteHod(confirmDelete.id);
      await fetchData(pageNumber > 1 && response.items.length <= 1 ? pageNumber - 1 : pageNumber);
      showSuccess("HOD deleted successfully.");
      setConfirmDelete(null);
    } catch (e) { if (e instanceof Error) showError(e.message); }
    finally { setActionLoading(null); }
  };

  const handleSendInvitation = async (h: HodResponse) => {
    setActionLoading(`invite-${h.id}`);
    try {
      await adminService.sendInvitation(h.userId);
      showSuccess("Invitation sent successfully.");
    } catch (e) { if (e instanceof Error) showError(e.message); }
    finally { setActionLoading(null); }
  };

  const handleResendInvitation = async (h: HodResponse) => {
    setActionLoading(`resend-${h.id}`);
    try {
      await adminService.resendInvitation(h.userId);
      showSuccess("Invitation resent successfully.");
    } catch (e) { if (e instanceof Error) showError(e.message); }
    finally { setActionLoading(null); }
  };

  const handleResetPassword = async (h: HodResponse) => {
    setActionLoading(`reset-${h.id}`);
    try {
      await authService.forgotPassword(h.email);
      showSuccess("Password reset email sent to " + h.email);
    } catch (e) { if (e instanceof Error) showError(e.message); }
    finally { setActionLoading(null); }
  };

  const totalPages = Math.ceil(response.totalCount / pageSize);

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
      {success && (
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <p className="text-xs text-green-700 dark:text-green-300">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)}><X className="w-4 h-4 text-green-500" /></button>
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
              <input value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} placeholder="e.g. EMP001 (auto-generated if empty)"
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
            <input onChange={e => handleSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchData(1)} placeholder="Search by Employee ID, Name, Email, Phone, Department, College..."
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground" />
            {search && <button onClick={() => { setSearch(""); setPageNumber(1); }}><X className="w-4 h-4 text-muted-foreground" /></button>}
          </div>
          <select value={filterCollege} onChange={e => { setFilterCollege(e.target.value); setFilterDepartment(""); setPageNumber(1); loadDepartments(e.target.value); }}
            className="bg-input-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary">
            <option value="">All Colleges</option>
            {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterDepartment} onChange={e => { setFilterDepartment(e.target.value); setPageNumber(1); }}
            className="bg-input-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary">
            <option value="">All Departments</option>
            {(filterCollege ? departments : allDepartments).filter(d => d.isActive).map(d => (
              <option key={d.id} value={d.id}>{d.departmentName}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPageNumber(1); }}
            className="bg-input-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary">
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <select value={sortField} onChange={e => setSortField(e.target.value)}
            className="bg-input-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary">
            <option value="fullname">Name</option>
            <option value="employeeid">Employee ID</option>
            <option value="email">Email</option>
            <option value="departmentname">Department</option>
            <option value="collegename">College</option>
            <option value="isactive">Status</option>
            <option value="createdat">Created Date</option>
          </select>
          <button onClick={() => { setSortDirection(d => d === "asc" ? "desc" : "asc"); }}
            className="border border-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted">
            {sortDirection === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Employee ID</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Name</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Email</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap hidden md:table-cell">Phone</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap hidden lg:table-cell">College</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Department</th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Status</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap hidden lg:table-cell">Created</th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {response.items.map((h) => (
                <tr key={h.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3 text-xs font-mono text-foreground font-semibold whitespace-nowrap">{h.employeeId || "—"}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {h.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground whitespace-nowrap">{h.fullName}</p>
                        <p className="text-[11px] text-muted-foreground">{h.designation || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">{h.email}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap hidden md:table-cell">{h.phone || "—"}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap hidden lg:table-cell">{h.collegeName}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">{h.departmentName}</td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <Badge variant={h.isActive ? "success" : "outline"}>{h.isActive ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap hidden lg:table-cell">{fmtDate(h.createdAt)}</td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewing(h)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="View">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(h)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleToggleActive(h)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title={h.isActive ? "Deactivate" : "Activate"}>
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                      <div className="relative group">
                        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="More actions">
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 z-50 hidden group-hover:block group-focus-within:block min-w-[180px] bg-card border border-border rounded-xl shadow-xl py-1">
                          <button onClick={() => handleSendInvitation(h)} disabled={actionLoading === `invite-${h.id}`}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors disabled:opacity-50">
                            {actionLoading === `invite-${h.id}` ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                            Send Invitation
                          </button>
                          <button onClick={() => handleResendInvitation(h)} disabled={actionLoading === `resend-${h.id}`}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors disabled:opacity-50">
                            {actionLoading === `resend-${h.id}` ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            Resend Invitation
                          </button>
                          <button onClick={() => handleResetPassword(h)} disabled={actionLoading === `reset-${h.id}`}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors disabled:opacity-50">
                            {actionLoading === `reset-${h.id}` ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                            Reset Password
                          </button>
                        </div>
                      </div>
                      <button onClick={() => setConfirmDelete(h)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={9} className="py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Loading...
                    </div>
                  </td>
                </tr>
              )}
              {!loading && !response.items.length && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                    {search || filterCollege || filterDepartment || filterStatus ? "No HODs match your filters" : "No HODs found. Add the first HOD above."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          totalCount={response.totalCount}
          hasNextPage={pageNumber < totalPages}
          hasPreviousPage={pageNumber > 1}
          onPageChange={p => fetchData(p)}
          pageSize={pageSize}
          onPageSizeChange={size => fetchData(1, size)}
        />
      </Card>

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Delete HOD</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Are you sure you want to delete <span className="font-semibold text-foreground">{confirmDelete.fullName}</span>?
              The user account will also be permanently removed.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={actionLoading === confirmDelete.id}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-colors">
                {actionLoading === confirmDelete.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View HOD Dialog */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setViewing(null)}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">HOD Details</h3>
                  <p className="text-xs text-muted-foreground">{viewing.fullName}</p>
                </div>
              </div>
              <button onClick={() => setViewing(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="col-span-2">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Employee ID</p>
                <p className="text-sm font-bold text-foreground font-mono mt-0.5">{viewing.employeeId || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Full Name</p>
                <p className="text-sm text-foreground mt-0.5">{viewing.fullName}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Email</p>
                <p className="text-sm text-foreground mt-0.5">{viewing.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Phone</p>
                <p className="text-sm text-foreground mt-0.5">{viewing.phone || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Designation</p>
                <p className="text-sm text-foreground mt-0.5">{viewing.designation || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">College</p>
                <p className="text-sm text-foreground mt-0.5">{viewing.collegeName}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Department</p>
                <p className="text-sm text-foreground mt-0.5">{viewing.departmentName}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Qualification</p>
                <p className="text-sm text-foreground mt-0.5">{viewing.qualification || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Experience</p>
                <p className="text-sm text-foreground mt-0.5">{viewing.yearsOfExperience} years</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Status</p>
                <div className="mt-0.5">
                  <Badge variant={viewing.isActive ? "success" : "outline"}>{viewing.isActive ? "Active" : "Inactive"}</Badge>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Status (Workflow)</p>
                <p className="text-sm text-foreground mt-0.5">{viewing.status}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Created</p>
                <p className="text-sm text-foreground mt-0.5">{fmtDateTime(viewing.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Last Updated</p>
                <p className="text-sm text-foreground mt-0.5">{viewing.updatedAt ? fmtDateTime(viewing.updatedAt) : "—"}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-5 pt-4 border-t border-border justify-end">
              <button onClick={() => { setViewing(null); openEdit(viewing); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => setViewing(null)}
                className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
