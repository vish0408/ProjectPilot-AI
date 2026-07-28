import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Edit, GraduationCap, X, Save } from "lucide-react";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import Badge from "../../components/common/Badge";
import Avatar from "../../components/common/Avatar";
import StatCard from "../../components/cards/StatCard";
import Pagination from "../../components/common/Pagination";
import { adminService } from "../../services/AdminService";
import { useDebounce } from "../../hooks/useDebounce";
import type { FacultyResponse, CreateFacultyRequest, UpdateFacultyRequest, UserResponse, DepartmentResponse } from "../../types/Admin";

export default function AdminFaculties() {
  const [items, setItems] = useState<FacultyResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FacultyResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ userId: "", departmentId: "", designation: "", specialization: "", joiningDate: "" });
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [pageSize, setPageSize] = useState(20);

  const fetchData = async (page: number, size: number) => {
    try {
      const data = await adminService.getFaculties();
      setItems(data);
      setTotalCount(data.length);
      setTotalPages(Math.max(1, Math.ceil(data.length / size)));
      setHasNextPage(page < Math.ceil(data.length / size));
      setHasPreviousPage(page > 1);
    } catch (e) { if (e instanceof Error) setError(e.message); }
  };

  const fetchFormData = async () => {
    try {
      const [u, d] = await Promise.all([
        adminService.getUsers(),
        adminService.getAllDepartments(),
      ]);
      setUsers(u);
      setDepartments(d);
    } catch (e) { /* silent */ }
  };

  useEffect(() => { fetchData(pageNumber, pageSize); }, []);

  const resetForm = () => {
    setForm({ userId: "", departmentId: "", designation: "", specialization: "", joiningDate: "" });
    setEditing(null);
    setShowForm(false);
  };

  const openAdd = () => {
    resetForm();
    fetchFormData();
    setShowForm(true);
  };

  const openEdit = (item: FacultyResponse) => {
    setEditing(item);
    setForm({
      userId: item.userId,
      departmentId: item.departmentId,
      designation: item.designation,
      specialization: item.specialization,
      joiningDate: item.joiningDate.slice(0, 10),
    });
    fetchFormData();
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.departmentId || !form.designation.trim()) {
      setError("Department and designation are required");
      return;
    }
    if (!editing && !form.userId) {
      setError("Please select a user");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const data: UpdateFacultyRequest = {
          departmentId: form.departmentId,
          designation: form.designation.trim(),
          specialization: form.specialization.trim(),
          joiningDate: form.joiningDate,
          isActive: true,
        };
        await adminService.updateFaculty(editing.id, data);
      } else {
        const data: CreateFacultyRequest = {
          userId: form.userId,
          departmentId: form.departmentId,
          designation: form.designation.trim(),
          specialization: form.specialization.trim(),
          joiningDate: form.joiningDate,
        };
        await adminService.createFaculty(data);
      }
      resetForm();
      fetchData(pageNumber, pageSize);
    } catch (e) { if (e instanceof Error) setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this faculty member?")) return;
    try { await adminService.deleteFaculty(id); fetchData(pageNumber, pageSize); }
    catch (e) { if (e instanceof Error) setError(e.message); }
  };

  const handlePageChange = (page: number) => {
    setPageNumber(page);
    fetchData(page, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNumber(1);
    fetchData(1, size);
  };

  const filtered = (Array.isArray(items) ? items : []).filter(i =>
    !debouncedSearch || i.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    i.departmentName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    i.designation.toLowerCase().includes(debouncedSearch.toLowerCase())
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
        <StatCard label="Total Faculty" value={`${totalCount}`} icon={GraduationCap} color="bg-purple-500" />
      </div>
      <SectionHead title="Faculty Members" desc="Manage faculty"
        action={
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Faculty
          </button>
        }
      />

      {showForm && (
        <Card>
          <SectionHead title={editing ? "Edit Faculty" : "Add Faculty"} action={
            <button onClick={resetForm} className="text-xs text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          } />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {!editing && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-foreground mb-1">User *</label>
                <select value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary">
                  <option value="">Select user...</option>
                  {(Array.isArray(users) ? users : []).filter(u => u.roleName === "Guide" || u.roleName === "HOD").map(u => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Department *</label>
              <select value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })}
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary">
                <option value="">Select department...</option>
                {(Array.isArray(departments) ? departments : []).map(d => (
                  <option key={d.id} value={d.id}>{d.departmentName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Designation *</label>
              <input value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Professor"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Specialization</label>
              <input value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. AI & ML"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Joining Date</label>
              <input type="date" value={form.joiningDate} onChange={e => setForm({ ...form, joiningDate: e.target.value })}
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

      <Card p={false}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search faculty..."
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground" />
        </div>
        <div className="flex flex-col">
          {filtered.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
              <Avatar name={item.fullName} />
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-1">
                <p className="text-sm font-bold text-foreground truncate">{item.fullName}</p>
                <p className="text-xs text-muted-foreground">{item.designation}</p>
                <p className="text-xs text-muted-foreground">{item.departmentName}</p>
                <p className="text-xs text-muted-foreground">{item.email}</p>
              </div>
              <Badge variant={item.isActive ? "success" : "outline"}>{item.isActive ? "Active" : "Inactive"}</Badge>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(item)} className="p-1.5 text-muted-foreground hover:text-blue-600 transition-colors" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {!filtered.length && <p className="text-sm text-muted-foreground text-center py-8">No faculty members found</p>}
        </div>
        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          totalCount={totalCount}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      </Card>
    </div>
  );
}
