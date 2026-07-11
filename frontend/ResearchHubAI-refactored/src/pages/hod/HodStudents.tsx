import { useEffect, useState } from "react";
import { GraduationCap, Search, Users } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import ProgressBar from "../../components/common/ProgressBar";
import { hodService } from "../../services/HodService";
import { HodStudentSummary } from "../../types/Hod";

export default function HodStudents() {
  const [students, setStudents] = useState<HodStudentSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchStudents = async (term?: string) => {
    try {
      const data = await hodService.getStudents(term);
      setStudents(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents(search || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

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
        <StatCard label="Total Students" value={`${students.length}`} icon={GraduationCap} color="bg-blue-500" />
        <StatCard label="With Guide" value={`${students.filter(s => s.guideName).length}`} icon={Users} color="bg-green-500" />
        <StatCard label="Has Project" value={`${students.filter(s => s.projectTitle).length}`} icon={GraduationCap} color="bg-amber-500" />
        <StatCard label="Avg Progress" value={students.length ? `${Math.round(students.reduce((a, s) => a + s.completionPercentage, 0) / students.length)}%` : "0%"} icon={GraduationCap} color="bg-indigo-500" />
      </div>
      <Card p={false}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students by name, email, or enrollment..."
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground" />
        </div>
        <div className="flex flex-col">
          {students.map((s) => (
            <div key={s.userId} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
              <Avatar name={s.fullName} />
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div>
                  <p className="text-sm font-bold text-foreground truncate">{s.fullName}</p>
                  <p className="text-xs text-muted-foreground">{s.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Enrollment</p>
                  <p className="text-xs font-medium text-foreground">{s.enrollment}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Guide</p>
                  <p className="text-xs font-medium text-foreground">{s.guideName || "Not assigned"}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-muted-foreground">Progress</p>
                    <span className="text-xs font-bold">{s.completionPercentage}%</span>
                  </div>
                  <ProgressBar value={s.completionPercentage} />
                </div>
              </div>
              <Badge variant={s.projectStatus === "Completed" ? "success" : s.projectStatus === "InProgress" ? "warning" : "outline"}>
                {s.projectStatus || "No Project"}
              </Badge>
            </div>
          ))}
          {!students.length && <p className="text-sm text-muted-foreground text-center py-8">No students found</p>}
        </div>
      </Card>
    </div>
  );
}
