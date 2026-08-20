import { useEffect, useState } from "react";
import { CheckCircle, Eye, RefreshCw, Search, UserCheck, Users, X, XCircle } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import AccountStatusBadge from "../../components/common/AccountStatusBadge";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import HodGuideViewDrawer from "../../components/hod/HodGuideViewDrawer";
import { hodService } from "../../services/HodService";
import type { HodGuideSummary } from "../../types/Hod";

export default function HodGuides() {
  const [guides, setGuides] = useState<HodGuideSummary[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewGuideId, setViewGuideId] = useState<string | null>(null);

  const fetchGuides = async (term?: string, status?: string) => {
    try {
      setLoading(true);
      setError(null);
      let data = await hodService.getGuides();
      if (term) {
        const t = term.toLowerCase();
        data = data.filter(g =>
          g.fullName.toLowerCase().includes(t) ||
          g.email.toLowerCase().includes(t) ||
          (g.employeeId || "").toLowerCase().includes(t) ||
          (g.specialization || "").toLowerCase().includes(t) ||
          (g.departmentName || "").toLowerCase().includes(t));
      }
      if (status === "available") data = data.filter(g => g.isAvailable);
      else if (status === "busy") data = data.filter(g => !g.isAvailable);
      else if (status === "inactive") data = data.filter(g => !g.isActive);
      setGuides(data);
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGuides(); }, []);

  const openView = (guideUserId: string) => {
    setViewGuideId(guideUserId);
    setViewOpen(true);
  };

  const totalStudents = guides.reduce((a, g) => a + g.assignedStudents, 0);

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-center justify-between">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          <button onClick={() => setError(null)}><X className="w-4 h-4 text-red-500" /></button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Guides" value={`${guides.length}`} icon={Users} color="bg-blue-500" />
        <StatCard label="Available" value={`${guides.filter(g => g.isAvailable).length}`} icon={CheckCircle} color="bg-green-500" />
        <StatCard label="Unavailable" value={`${guides.filter(g => !g.isAvailable).length}`} icon={XCircle} color="bg-red-500" />
        <StatCard label="Total Students" value={`${totalStudents}`} icon={UserCheck} color="bg-amber-500" />
      </div>

      <SectionHead title="Guides" desc="Research guides in your department" />

      <Card>
        <div className="flex items-center gap-3 px-1 pb-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input value={search} onChange={e => { setSearch(e.target.value); fetchGuides(e.target.value || undefined, filterStatus); }}
              placeholder="Search by name, email, employee ID, or specialization..."
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground min-w-0" />
            {search && <button onClick={() => { setSearch(""); fetchGuides(); }}><X className="w-4 h-4 text-muted-foreground" /></button>}
          </div>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); fetchGuides(search || undefined, e.target.value); }}
            className="bg-input-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary">
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[980px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Guide</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Employee ID</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Designation</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Department</th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Assigned Scholars</th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Active Projects</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Status</th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guides.map((g) => (
                <tr key={g.userId} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {g.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground whitespace-nowrap">{g.fullName}</p>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[180px]" title={g.email}>{g.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs font-mono text-foreground font-semibold whitespace-nowrap">{g.employeeId || "—"}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground max-w-[160px]">
                    <p className="truncate" title={g.designation || "—"}>{g.designation || "—"}</p>
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground max-w-[200px]">
                    <p className="truncate" title={g.departmentName || g.department || "—"}>{g.departmentName || g.department || "—"}</p>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">{g.assignedStudents}</span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">{g.activeProjects}</span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex flex-col items-start gap-1">
                      <Badge variant={g.isAvailable ? "success" : "danger"}>{g.isAvailable ? "Available" : "Busy"}</Badge>
                      <AccountStatusBadge status={g.accountStatus} />
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    <button onClick={() => openView(g.userId)}
                      className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-600 hover:bg-green-100 dark:hover:bg-green-950/40 hover:scale-105 transition-all flex items-center justify-center touch-target"
                      title="View details">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={8} className="py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Loading...
                    </div>
                  </td>
                </tr>
              )}
              {!loading && !guides.length && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                    {search || filterStatus ? "No guides match your filters" : "No guides found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <HodGuideViewDrawer open={viewOpen} guideUserId={viewGuideId} onClose={() => { setViewOpen(false); setViewGuideId(null); }} />
    </div>
  );
}
