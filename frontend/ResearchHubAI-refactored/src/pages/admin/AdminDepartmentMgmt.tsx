import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Building, Edit2, UserCheck, Plus, Trash2, Search, X, Check } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import Pagination from "../../components/common/Pagination";
import { adminService } from "../../services/AdminService";
import type { DepartmentResponse, CollegeResponse, CreateDepartmentRequest, UpdateDepartmentRequest } from "../../types/Admin";

export default function AdminDepartmentMgmt() {
  const [items, setItems] = useState<DepartmentResponse[]>([]);
  const [colleges, setColleges] = useState<CollegeResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DepartmentResponse | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCollege, setFilterCollege] = useState("");
  const [sortField, setSortField] = useState("departmentname");
  const [sortDirection, setSortDirection] = useState("asc");
  const [form, setForm] = useState({ departmentName: "", departmentCode: "", shortName: "", description: "", collegeId: "" });
  const [saving, setSaving] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async (p: number, sz: number, term: string, collegeId: string, sortF: string, sortD: string) => {
    setLoading(true);
    try {
      const [deptRes, colls] = await Promise.all([
        adminService.getDepartmentsPaged(
          {
            pageNumber: p,
            pageSize: sz,
            searchTerm: term || undefined,
            sortField: sortF,
            sortDirection: sortD,
            statusFilter: undefined,
          },
          collegeId || undefined
        ),
        adminService.getColleges(),
      ]);
      setItems(deptRes.items);
      setTotalCount(deptRes.totalCount);
      setColleges(colls);
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterCollege, sortField, sortDirection]);

  useEffect(() => {
    fetchData(page, pageSize, debouncedSearch, filterCollege, sortField, sortDirection);
  }, [page, pageSize, debouncedSearch, filterCollege, sortField, sortDirection, fetchData]);

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  };

  const clearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize]);

  const resetForm = () => {
    setForm({ departmentName: "", departmentCode: "", shortName: "", description: "", collegeId: "" });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (d: DepartmentResponse) => {
    setEditing(d);
    setForm({
      departmentName: d.departmentName,
      departmentCode: d.departmentCode,
      shortName: d.shortName || "",
      description: d.description,
      collegeId: d.collegeId
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.departmentName.trim()) { setError("Department name is required"); return; }
    if (!form.departmentCode.trim()) { setError("Department code is required"); return; }
    if (!form.collegeId) { setError("Please select a college"); return; }
    setSaving(true);
    try {
      if (editing) {
        const updated = await adminService.updateDepartment(editing.id, form as UpdateDepartmentRequest);
        setItems(prev => prev.map(d => d.id === editing.id ? updated : d));
      } else {
        await adminService.createDepartment(form as CreateDepartmentRequest);
        setPage(1);
      }
      resetForm();
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this department?")) return;
    try {
      await adminService.deleteDepartment(id);
      setItems(prev => prev.filter(d => d.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    }
  };

  const hasFilters = debouncedSearch || filterCollege;

  if (loading && !items.length) {
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
        <StatCard label="Departments" value={`${totalCount}`} icon={Building} color="bg-blue-500"/>
        <StatCard label="Total Faculty" value={`${items.reduce((s, d) => s + d.facultyCount, 0)}`} icon={UserCheck} color="bg-indigo-500"/>
      </div>
      <SectionHead title="Departments" desc="Manage departments across colleges"
        action={
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Department
          </button>
        }
      />

      {showForm && (
        <Card>
          <SectionHead title={editing ? "Edit Department" : "Add Department"} action={
            <button onClick={resetForm} className="text-xs text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          } />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Department Name *</label>
              <input value={form.departmentName} onChange={e => setForm({...form, departmentName: e.target.value})} placeholder="e.g. Computer Science"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Department Code *</label>
              <input value={form.departmentCode} onChange={e => setForm({...form, departmentCode: e.target.value})} placeholder="e.g. CS"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Short Name</label>
              <input value={form.shortName} onChange={e => setForm({...form, shortName: e.target.value})} placeholder="e.g. CSE"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">College *</label>
              <select value={form.collegeId} onChange={e => setForm({...form, collegeId: e.target.value})}
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary">
                <option value="">Select a college</option>
                {colleges.filter(c => c.isActive).map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Department description" rows={2}
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
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
        <div className="flex items-center gap-3 px-1 pb-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input value={search} onChange={e => handleSearchChange(e.target.value)} placeholder="Search by department name or code..."
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground" />
            {search && <button onClick={clearSearch}><X className="w-4 h-4 text-muted-foreground" /></button>}
          </div>
          <select value={filterCollege} onChange={e => setFilterCollege(e.target.value)}
            className="bg-input-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary">
            <option value="">All Colleges</option>
            {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={sortField} onChange={e => setSortField(e.target.value)}
            className="bg-input-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary">
            <option value="departmentname">Name</option>
            <option value="departmentcode">Code</option>
            <option value="collegename">College</option>
            <option value="isactive">Status</option>
            <option value="createdat">Created</option>
          </select>
          <button onClick={() => setSortDirection(d => d === "asc" ? "desc" : "asc")}
            className="border border-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted">
            {sortDirection === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">Department</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">Code</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">College</th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-muted-foreground">Faculty</th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {d.shortName || d.departmentCode?.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{d.departmentName}</p>
                        <p className="text-[11px] text-muted-foreground">{d.shortName || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">{d.departmentCode}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">{d.collegeName}</td>
                  <td className="py-3 px-3 text-center text-xs font-semibold">{d.facultyCount}</td>
                  <td className="py-3 px-3 text-center">
                    <Badge variant={d.isActive ? "success" : "outline"}>{d.isActive ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <p className="text-sm font-semibold text-foreground mb-1">No departments found.</p>
                    <p className="text-xs text-muted-foreground">
                      {hasFilters ? "Try changing your filters." : "Add your first department to get started."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 0 && (
          <Pagination
            pageNumber={page}
            totalPages={totalPages}
            totalCount={totalCount}
            hasNextPage={page < totalPages}
            hasPreviousPage={page > 1}
            onPageChange={p => setPage(p)}
            pageSize={pageSize}
            onPageSizeChange={sz => { setPageSize(sz); setPage(1); }}
          />
        )}
      </Card>
    </div>
  );
}
