import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, GraduationCap, RefreshCw, Search, Users, X } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import AccountStatusBadge from "../../components/common/AccountStatusBadge";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import Pagination from "../../components/common/Pagination";
import ProgressBar from "../../components/common/ProgressBar";
import HodStudentViewDrawer from "../../components/hod/HodStudentViewDrawer";
import { hodService } from "../../services/HodService";
import type { HodStudentSummary } from "../../types/Hod";

const PAGE_SIZE = 10;

const statusVariant = (status?: string | null): "success" | "warning" | "danger" | "outline" | "info" => {
  switch (status) {
    case "Completed": return "success";
    case "InProgress": return "warning";
    case "OnHold": return "danger";
    case "NotStarted": return "info";
    default: return "outline";
  }
};

export default function HodStudents() {
  const [students, setStudents] = useState<HodStudentSummary[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterStatus, setFilterStatus] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewStudentId, setViewStudentId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchStudents = useCallback(async (page?: number, term?: string, status?: string, sort?: string) => {
    try {
      setLoading(true);
      setError(null);
      const query: Record<string, string | number> = {
        pageNumber: page ?? pageNumber,
        pageSize: PAGE_SIZE,
      };
      const s = sort ?? sortBy;
      if (s !== "createdAt") query.sortBy = s;
      const t = term ?? search;
      if (t) query.search = t;
      const st = status ?? filterStatus;
      if (st) query.filterStatus = st;
      const data = await hodService.getStudents(query);
      setStudents(data.items);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    }
    finally { setLoading(false); }
  }, [pageNumber, sortBy, search, filterStatus]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = (term: string) => {
    setSearch(term);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPageNumber(1);
      fetchStudents(1, term);
    }, 300);
  };

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const openView = (studentUserId: string) => {
    setViewStudentId(studentUserId);
    setViewOpen(true);
  };

  const totalWithGuide = students.filter(s => s.guideName).length;
  const totalWithProject = students.filter(s => s.projectTitle).length;
  const avgProgress = students.length
    ? Math.round(students.reduce((a, s) => a + s.completionPercentage, 0) / students.length)
    : 0;

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-center justify-between">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          <button onClick={() => setError(null)}><X className="w-4 h-4 text-red-500" /></button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={`${totalCount}`} icon={GraduationCap} color="bg-blue-500" />
        <StatCard label="With Guide" value={`${totalWithGuide}`} icon={Users} color="bg-green-500" />
        <StatCard label="Has Project" value={`${totalWithProject}`} icon={GraduationCap} color="bg-amber-500" />
        <StatCard label="Avg Progress" value={`${avgProgress}%`} icon={GraduationCap} color="bg-indigo-500" />
      </div>

      <SectionHead title="Students" desc="Manage PhD scholars in your department" />

      <Card>
        <div className="flex items-center gap-3 px-1 pb-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input value={search} onChange={e => handleSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchStudents(1)}
              placeholder="Search by name, email, enrollment, or research topic..."
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground min-w-0" />
            {search && <button onClick={() => { setSearch(""); setPageNumber(1); fetchStudents(1, ""); }}><X className="w-4 h-4 text-muted-foreground" /></button>}
          </div>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPageNumber(1); fetchStudents(1, undefined, e.target.value); }}
            className="bg-input-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary">
            <option value="">All Students</option>
            <option value="assigned">With Guide</option>
            <option value="unassigned">Without Guide</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPageNumber(1); fetchStudents(1, undefined, undefined, e.target.value); }}
            className="bg-input-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary">
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="enrollment">Enrollment</option>
            <option value="progress">Progress</option>
            <option value="createdAt">Created Date</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Student ID</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Student</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Guide</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Research Topic / Project</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Progress</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Status</th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.userId} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3 text-xs font-mono text-foreground font-semibold whitespace-nowrap">
                    {s.enrollment || s.employeeId || "—"}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2 min-w-0 max-w-[260px]">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {s.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground whitespace-nowrap truncate" title={s.fullName}>{s.fullName}</p>
                        <p className="text-[11px] text-muted-foreground truncate" title={s.email}>{s.email || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground max-w-[180px]">
                    <p className="truncate" title={s.guideName || "Not assigned"}>{s.guideName || "Not assigned"}</p>
                    {s.guideEmployeeId && (
                      <p className="text-[11px] text-muted-foreground truncate" title={s.guideEmployeeId}>{s.guideEmployeeId}</p>
                    )}
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground max-w-[220px]">
                    <p className="truncate" title={s.projectTitle || s.researchTopic || "—"}>{s.projectTitle || s.researchTopic || "—"}</p>
                    {s.projectStatus && <Badge variant={statusVariant(s.projectStatus)} className="mt-1">{s.projectStatus}</Badge>}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className="flex-1"><ProgressBar value={s.completionPercentage} /></div>
                      <span className="text-xs font-bold whitespace-nowrap">{s.completionPercentage}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <AccountStatusBadge status={s.accountStatus} />
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    <button onClick={() => openView(s.userId)}
                      className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950/40 hover:scale-105 transition-all flex items-center justify-center touch-target"
                      title="View details">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={7} className="py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Loading...
                    </div>
                  </td>
                </tr>
              )}
              {!loading && !students.length && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    {search || filterStatus ? "No students match your filters" : "No students found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          totalCount={totalCount}
          hasNextPage={pageNumber < totalPages}
          hasPreviousPage={pageNumber > 1}
          onPageChange={p => fetchStudents(p)}
          pageSize={PAGE_SIZE}
        />
      </Card>

      <HodStudentViewDrawer open={viewOpen} studentUserId={viewStudentId} onClose={() => { setViewOpen(false); setViewStudentId(null); }} />
    </div>
  );
}
