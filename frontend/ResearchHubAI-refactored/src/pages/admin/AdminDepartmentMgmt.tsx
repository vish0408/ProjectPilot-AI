import { useState, useEffect } from "react";
import { Building, Edit2, Eye, GraduationCap, TrendingUp, UserCheck, Plus, Trash2 } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import ProgressBar from "../../components/common/ProgressBar";
import SectionHead from "../../components/common/SectionHead";
import { adminService } from "../../services/AdminService";
import type { DepartmentResponse } from "../../types/Admin";

export default function AdminDepartmentMgmt() {
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const data = await adminService.getDepartments();
      setDepartments(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this department?")) return;
    try { await adminService.deleteDepartment(id); fetchData(); }
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
        <StatCard label="Departments" value={`${departments.length}`} icon={Building} color="bg-blue-500"/>
        <StatCard label="Total Faculty" value={`${departments.reduce((s, d) => s + d.facultyCount, 0)}`} icon={UserCheck} color="bg-indigo-500"/>
      </div>
      <SectionHead title="Departments" desc="Manage departments across colleges"
        action={
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Department
          </button>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((d) => (
          <Card key={d.id}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xs font-bold">{d.departmentCode}</div>
                <div>
                  <p className="font-bold text-sm text-foreground">{d.departmentName}</p>
                  <p className="text-xs text-muted-foreground">{d.collegeName}</p>
                </div>
              </div>
              <Badge variant={d.isActive ? "success" : "danger"}>{d.isActive ? "active" : "inactive"}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{d.description}</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-muted/60 rounded-xl p-2 text-center">
                <p className="text-sm font-bold text-foreground">{d.facultyCount}</p>
                <p className="text-xs text-muted-foreground">Faculty</p>
              </div>
              <div className="bg-muted/60 rounded-xl p-2 text-center">
                <p className="text-sm font-bold text-foreground">{d.departmentCode}</p>
                <p className="text-xs text-muted-foreground">Code</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button className="flex-1 border border-border text-xs font-medium text-muted-foreground py-1.5 rounded-lg hover:bg-muted flex items-center justify-center gap-1">
                <Eye className="w-3.5 h-3.5" />View
              </button>
              <button className="flex-1 border border-border text-xs font-medium text-muted-foreground py-1.5 rounded-lg hover:bg-muted flex items-center justify-center gap-1">
                <Edit2 className="w-3.5 h-3.5" />Edit
              </button>
              <button onClick={() => handleDelete(d.id)} className="px-2 border border-border text-xs font-medium text-red-500 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
        {!departments.length && (
          <Card><p className="text-sm text-muted-foreground text-center py-8">No departments found</p></Card>
        )}
      </div>
    </div>
  );
}
