import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Edit, GraduationCap } from "lucide-react";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import Badge from "../../components/common/Badge";
import Avatar from "../../components/common/Avatar";
import StatCard from "../../components/cards/StatCard";
import { adminService } from "../../services/AdminService";
import type { FacultyResponse } from "../../types/Admin";

export default function AdminFaculties() {
  const [items, setItems] = useState<FacultyResponse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async (term?: string) => {
    try {
      const data = await adminService.getFaculties();
      setItems(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = items.filter(i =>
    !search || i.fullName.toLowerCase().includes(search.toLowerCase()) ||
    i.departmentName.toLowerCase().includes(search.toLowerCase()) ||
    i.designation.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this faculty member?")) return;
    try { await adminService.deleteFaculty(id); fetchData(); }
    catch {}
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Faculty" value={`${items.length}`} icon={GraduationCap} color="bg-purple-500" />
      </div>
      <SectionHead title="Faculty Members" desc="Manage faculty"
        action={
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Faculty
          </button>
        }
      />
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
                <button className="p-1.5 text-muted-foreground hover:text-blue-600 transition-colors" title="Edit">
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
      </Card>
    </div>
  );
}
