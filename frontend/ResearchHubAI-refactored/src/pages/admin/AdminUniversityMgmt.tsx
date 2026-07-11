import { useState, useEffect } from "react";
import { Building, GraduationCap, Layers, Users, Plus, Edit, Trash2, Globe } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { adminService } from "../../services/AdminService";
import type { CollegeResponse } from "../../types/Admin";

export default function AdminUniversityMgmt() {
  const [colleges, setColleges] = useState<CollegeResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const data = await adminService.getColleges();
      setColleges(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this college?")) return;
    try { await adminService.deleteCollege(id); fetchData(); }
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
        <StatCard label="Total Colleges" value={`${colleges.length}`} icon={Building} color="bg-blue-600"/>
        <StatCard label="Total Departments" value={`${colleges.reduce((s, c) => s + c.departmentCount, 0)}`} icon={Layers} color="bg-indigo-500"/>
        <StatCard label="Active" value={`${colleges.filter(c => c.isActive).length}`} icon={Globe} color="bg-green-500"/>
      </div>
      <SectionHead title="Colleges" desc="Manage colleges and institutions"
        action={
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add College
          </button>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {colleges.map((c) => (
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
                <p className="text-sm font-bold text-foreground">{c.email}</p>
                <p className="text-xs text-muted-foreground">Email</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button className="flex-1 border border-border text-xs font-medium text-muted-foreground py-1.5 rounded-lg hover:bg-muted flex items-center justify-center gap-1">
                <Edit className="w-3.5 h-3.5" />Edit
              </button>
              <button onClick={() => handleDelete(c.id)} className="flex-1 border border-border text-xs font-medium text-red-500 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center gap-1">
                <Trash2 className="w-3.5 h-3.5" />Delete
              </button>
            </div>
          </Card>
        ))}
        {!colleges.length && (
          <Card><p className="text-sm text-muted-foreground text-center py-8">No colleges found</p></Card>
        )}
      </div>
    </div>
  );
}
