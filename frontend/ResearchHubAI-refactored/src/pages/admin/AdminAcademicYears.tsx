import { useState, useEffect } from "react";
import { Plus, Check, Trash2, Edit, Calendar } from "lucide-react";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import Badge from "../../components/common/Badge";
import { adminService } from "../../services/AdminService";
import type { AcademicYearResponse } from "../../types/Admin";

export default function AdminAcademicYears() {
  const [items, setItems] = useState<AcademicYearResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const data = await adminService.getAcademicYears();
      setItems(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this academic year?")) return;
    try { await adminService.deleteAcademicYear(id); fetchData(); }
    catch {}
  };

  const handleSetCurrent = async (id: string) => {
    try { await adminService.setCurrentAcademicYear(id); fetchData(); }
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
      <SectionHead title="Academic Years" desc="Manage academic years"
        action={
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Year
          </button>
        }
      />
      <Card>
        <div className="flex flex-col">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{item.name}</p>
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
          {!items.length && <p className="text-sm text-muted-foreground text-center py-8">No academic years found</p>}
        </div>
      </Card>
    </div>
  );
}
