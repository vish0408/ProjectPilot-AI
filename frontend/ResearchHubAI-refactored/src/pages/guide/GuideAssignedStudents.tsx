import { useEffect, useState } from "react";
import {
  Award,
  Calendar,
  Eye,
  Filter,
  FlaskConical,
  GraduationCap,
  MessageCircle,
  Search,
  TrendingUp
} from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import ProgressBar from "../../components/common/ProgressBar";
import { guideService } from "../../services/GuideService";
import { GuideDashboardData, AssignedStudentSummary } from "../../types/Guide";

export default function GuideAssignedStudents() {
  const [data, setData] = useState<GuideDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const d = await guideService.getDashboard();
        setData(d);
      } catch (e) {
        console.error("Failed to load assigned students", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = data?.assignedStudents.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.researchTopic.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!data) {
    return <div className="text-center text-muted-foreground py-10">Failed to load students.</div>;
  }

  const activeCount = data.assignedStudents.filter(s => s.completionPercentage > 0 && s.completionPercentage < 100).length;
  const avgProgress = data.assignedStudents.length > 0 ? Math.round(data.assignedStudents.reduce((a, s) => a + s.completionPercentage, 0) / data.assignedStudents.length) : 0;
  const graduatingSoon = data.assignedStudents.filter(s => s.completionPercentage >= 90).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Assigned" value={data.totalAssignedStudents.toString()} icon={GraduationCap} color="bg-indigo-500"/>
        <StatCard label="Active" value={activeCount.toString()} change="+1 this month" icon={FlaskConical} color="bg-blue-500" trend="up"/>
        <StatCard label="Avg Progress" value={`${avgProgress}%`} icon={TrendingUp} color="bg-green-500"/>
        <StatCard label="Graduating Soon" value={graduatingSoon.toString()} sub="Near 100% completion" icon={Award} color="bg-amber-500"/>
      </div>
      <Card p={false}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">All Assigned Students</h3>
          <div className="flex gap-2">
            <div className="relative hidden sm:block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"/><input className="bg-muted border border-border rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-primary w-44" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
            <button className="text-xs border border-border rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted flex items-center gap-1.5"><Filter className="w-3.5 h-3.5"/>Filter</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>{["Student","Research Topic","Year","Progress","Status","Actions"].map(h=><th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((s,i)=>(
                <tr key={i} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5"><div className="flex items-center gap-3"><Avatar name={s.fullName} size="sm"/><div><p className="text-xs font-bold text-foreground">{s.fullName}</p><p className="text-xs text-muted-foreground">{s.department}</p></div></div></td>
                  <td className="px-5 py-3.5"><p className="text-xs text-muted-foreground max-w-[160px] truncate">{s.researchTopic}</p></td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{s.enrollment}</td>
                  <td className="px-5 py-3.5 min-w-[120px]"><div className="flex items-center gap-2"><ProgressBar value={s.completionPercentage} color={s.completionPercentage>70?"bg-green-500":s.completionPercentage>40?"bg-blue-500":"bg-amber-500"} h="h-1.5"/><span className="text-xs font-bold w-8">{s.completionPercentage}%</span></div></td>
                  <td className="px-5 py-3.5"><Badge variant={s.completionPercentage>70?"success":s.completionPercentage>40?"warning":"danger"}>{s.projectStatus||"active"}</Badge></td>
                  <td className="px-5 py-3.5"><div className="flex gap-1">{[Eye,MessageCircle,Calendar].map((Icon,j)=><button key={j} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center"><Icon className="w-3.5 h-3.5 text-muted-foreground"/></button>)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
