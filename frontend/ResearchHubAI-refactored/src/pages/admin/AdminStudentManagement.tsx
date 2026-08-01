import { useState, useEffect } from "react";
import {
  AlertCircle, Download, Eye, FlaskConical, GraduationCap, Search, Trash2, X
} from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import AccountStatusBadge from "../../components/common/AccountStatusBadge";
import Card from "../../components/common/Card";
import { adminService } from "../../services/AdminService";
import { useDebounce } from "../../hooks/useDebounce";
import type { UserResponse } from "../../types/Admin";

export default function AdminStudentManagement() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<UserResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminService.getUsers()
      .then(all => setUsers((all ?? []).filter(u => u.roleName === "Student")))
      .catch((e) => { if (e instanceof Error) setError(e.message); });
  }, []);

  const filtered = users.filter(u =>
    !debouncedSearch || u.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (u.enrollment || u.employeeId || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (u.academicYearName || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (u.semesterName || "").toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) { if (e instanceof Error) setError(e.message); } finally { setDeleteId(null); }
  };

  const exportCSV = () => {
    let csv = "Name,Email,Student ID,Role,Status,Created\n";
    users.forEach(u => { csv += `${u.fullName},${u.email},"${u.enrollment || u.employeeId || ""}",${u.roleName},${u.accountStatus || "Unknown"},${new Date(u.createdAt).toLocaleDateString()}\n`; });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "students.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 mb-4">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={`${users.length}`} icon={GraduationCap} color="bg-blue-500"/>
        <StatCard label="Active" value={`${users.filter(u => u.accountStatus === "Active").length}`} icon={FlaskConical} color="bg-indigo-500"/>
        <StatCard label="Pending" value={`${users.filter(u => u.accountStatus === "Pending Activation" || u.accountStatus === "Invitation Sent").length}`} icon={AlertCircle} color="bg-amber-500"/>
      </div>
      <Card p={false}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">Student Directory</h3>
          <div className="flex gap-2">
            <div className="relative hidden sm:block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"/><input value={search} onChange={e => setSearch(e.target.value)} className="bg-muted border border-border rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-primary w-44" placeholder="Search…"/></div>
            <button onClick={exportCSV} className="text-xs border border-border rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted flex items-center gap-1.5"><Download className="w-3.5 h-3.5"/>Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>{["Student","Student ID","Email","Role","Status","Created","Actions"].map(h=><th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5"><div className="flex items-center gap-3"><Avatar name={s.fullName} size="sm"/><div><p className="text-xs font-bold text-foreground">{s.fullName}</p></div></div></td>
                  <td className="px-5 py-3.5 text-xs font-mono font-semibold text-foreground whitespace-nowrap">{s.enrollment || s.employeeId || "—"}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{s.email}</td>
                  <td className="px-5 py-3.5"><Badge variant="outline">{s.roleName}</Badge></td>
                  <td className="px-5 py-3.5"><AccountStatusBadge status={s.accountStatus} /></td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5"><div className="flex gap-1">
                    <button onClick={() => setViewUser(s)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center" title="View"><Eye className="w-3.5 h-3.5 text-muted-foreground"/></button>
                    <button onClick={() => { setDeleteId(s.id); }} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center" title="Delete"><Trash2 className="w-3.5 h-3.5 text-red-500"/></button>
                  </div></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-sm text-muted-foreground">No students found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={() => setDeleteId(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-foreground mb-2">Confirm Delete</h3>
            <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this student? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 border border-border rounded-xl text-sm text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {viewUser && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={() => setViewUser(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Student Details</h3>
              <button onClick={() => setViewUser(null)} className="p-1 hover:bg-muted rounded-lg"><X className="w-4 h-4"/></button>
            </div>
            <div className="flex items-center gap-3 mb-4"><Avatar name={viewUser.fullName} size="md"/><div><p className="font-bold text-foreground text-sm">{viewUser.fullName}</p><p className="text-xs text-muted-foreground">{viewUser.email}</p></div></div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Student ID</span><span className="font-medium">{viewUser.enrollment || viewUser.employeeId || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span className="font-medium">{viewUser.roleName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><AccountStatusBadge status={viewUser.accountStatus} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{new Date(viewUser.createdAt).toLocaleDateString()}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
