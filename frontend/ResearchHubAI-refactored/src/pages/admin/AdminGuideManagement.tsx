import { useState, useEffect } from "react";
import {
  AlertCircle, Clock, Eye, GraduationCap, Trash2, UserCheck, X
} from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import { adminService } from "../../services/AdminService";
import type { UserResponse } from "../../types/Admin";

export default function AdminGuideManagement() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<UserResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminService.getUsers()
      .then(all => setUsers((all ?? []).filter(u => u.roleName === "Guide")))
      .catch((e) => { if (e instanceof Error) setError(e.message); })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) { if (e instanceof Error) setError(e.message); } finally { setDeleteId(null); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 mb-4">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Guides" value={`${users.length}`} icon={UserCheck} color="bg-indigo-500"/>
        <StatCard label="Active" value={`${users.filter(u => u.isActive).length}`} icon={Clock} color="bg-green-500"/>
        <StatCard label="Inactive" value={`${users.filter(u => !u.isActive).length}`} icon={AlertCircle} color="bg-amber-500"/>
      </div>
      <Card p={false}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border"><h3 className="font-bold text-foreground">Guide Directory</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>{["Guide","Email","Status","Created","Actions"].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>
              {users.map(g => (
                <tr key={g.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3.5"><div className="flex items-center gap-3"><Avatar name={g.fullName} size="sm"/><span className="text-xs font-bold text-foreground">{g.fullName}</span></div></td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{g.email}</td>
                  <td className="px-4 py-3.5"><Badge variant={g.isActive ? "success" : "danger"}>{g.isActive ? "Active" : "Inactive"}</Badge></td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{new Date(g.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3.5"><div className="flex gap-1">
                    <button onClick={() => setViewUser(g)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center" title="View"><Eye className="w-3.5 h-3.5 text-muted-foreground"/></button>
                    <button onClick={() => { setDeleteId(g.id); }} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center" title="Delete"><Trash2 className="w-3.5 h-3.5 text-red-500"/></button>
                  </div></td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-sm text-muted-foreground">No guides found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={() => setDeleteId(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-foreground mb-2">Confirm Delete</h3>
            <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this guide? This action cannot be undone.</p>
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
              <h3 className="font-bold text-foreground">Guide Details</h3>
              <button onClick={() => setViewUser(null)} className="p-1 hover:bg-muted rounded-lg"><X className="w-4 h-4"/></button>
            </div>
            <div className="flex items-center gap-3 mb-4"><Avatar name={viewUser.fullName} size="md"/><div><p className="font-bold text-foreground text-sm">{viewUser.fullName}</p><p className="text-xs text-muted-foreground">{viewUser.email}</p></div></div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span className="font-medium">{viewUser.roleName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant={viewUser.isActive ? "success" : "danger"}>{viewUser.isActive ? "Active" : "Inactive"}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{new Date(viewUser.createdAt).toLocaleDateString()}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
