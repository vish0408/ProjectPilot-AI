import { useState, useEffect } from "react";
import { Clock, Edit2, Filter, GraduationCap, Key, Plus, Search, Trash2, UserCheck, Users } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import { adminService } from "../../services/AdminService";
import type { UserResponse } from "../../types/Admin";

export default function AdminUserManagement() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = users.filter(u =>
    !search || u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.roleName.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try { await adminService.deleteUser(id); fetchData(); }
    catch {}
  };

  const studentCount = users.filter(u => u.roleName === "student").length;
  const guideCount = users.filter(u => u.roleName === "guide").length;
  const adminCount = users.filter(u => u.roleName === "admin" || u.roleName === "Admin").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={`${users.length}`} icon={Users} color="bg-blue-500"/>
        <StatCard label="Students" value={`${studentCount}`} icon={GraduationCap} color="bg-indigo-500"/>
        <StatCard label="Guides" value={`${guideCount}`} icon={UserCheck} color="bg-green-500"/>
        <StatCard label="Admins" value={`${adminCount}`} icon={Key} color="bg-amber-500"/>
      </div>
      <Card p={false}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">All Users</h3>
          <div className="flex gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"/>
              <input value={search} onChange={e => setSearch(e.target.value)} className="bg-muted border border-border rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-primary w-48" placeholder="Search users…"/>
            </div>
            <button className="text-xs border border-border rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted flex items-center gap-1.5"><Filter className="w-3.5 h-3.5"/>Filter</button>
            <button className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5"/>Add User</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>{["User", "Email", "Role", "Status", "Joined", "Actions"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.fullName} size="sm"/>
                      <span className="text-xs font-bold text-foreground">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={u.roleName === "admin" || u.roleName === "Admin" ? "info" : u.roleName === "hod" || u.roleName === "HOD" ? "purple" : u.roleName === "guide" || u.roleName === "Guide" ? "success" : "outline"}>
                      {u.roleName}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={u.isActive ? "success" : "danger"}>{u.isActive ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1">
                      <button className="p-1.5 text-muted-foreground hover:text-blue-600 transition-colors"><Edit2 className="w-3.5 h-3.5"/></button>
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <p className="text-sm text-muted-foreground text-center py-8">No users found</p>}
        </div>
      </Card>
    </div>
  );
}
