import { useState, useEffect } from "react";
import { Plus, Check, Trash2, Edit, Layers } from "lucide-react";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import Badge from "../../components/common/Badge";
import { adminService } from "../../services/AdminService";
import type { SemesterResponse } from "../../types/Admin";

export default function AdminSemesters() {
  const [items, setItems] = useState<SemesterResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const data = await adminService.getSemesters();
      setItems(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this semester?")) return;
    try { await adminService.deleteSemester(id); fetchData(); }
    catch {}
  };

  const handleSetCurrent = async (id: string) => {
    try { await adminService.setCurrentSemester(id); fetchData(); }
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
      <SectionHead title="Semesters" desc="Manage semesters"
        action={
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Semester
          </button>
        }
      />
      <Card>
        <div className="flex flex-col">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <Layers className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1">
                <p className="text-sm font-bold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.academicYearName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                </p>
              </div>
              {item.isCurrent && <Badge variant="success">Current</Badge>}
              <div className="flex items-center gap-2">
                {!item.isCurrent && (
                  <button onClick={() => handleSetCurrent(item.id)} className="p-1.5 text-muted-foreground hover:text-green-600 transition-colors" title="Set as current">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button className="p-1.5 text-muted-foreground hover:text-blue-600 transition-colors" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {!items.length && <p className="text-sm text-muted-foreground text-center py-8">No semesters found</p>}
        </div>
      </Card>
    </div>
  );
}
