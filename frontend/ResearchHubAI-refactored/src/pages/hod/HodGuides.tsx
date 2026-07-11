import { useEffect, useState } from "react";
import { CheckCircle, UserCheck, Users, XCircle } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { hodService } from "../../services/HodService";
import { HodGuideSummary } from "../../types/Hod";

export default function HodGuides() {
  const [guides, setGuides] = useState<HodGuideSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hodService.getGuides()
      .then(setGuides)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        <StatCard label="Total Guides" value={`${guides.length}`} icon={Users} color="bg-blue-500" />
        <StatCard label="Available" value={`${guides.filter(g => g.isAvailable).length}`} icon={CheckCircle} color="bg-green-500" />
        <StatCard label="Unavailable" value={`${guides.filter(g => !g.isAvailable).length}`} icon={XCircle} color="bg-red-500" />
        <StatCard label="Total Students" value={`${guides.reduce((a, g) => a + g.assignedStudents, 0)}`} icon={UserCheck} color="bg-amber-500" />
      </div>
      <Card p={false}>
        <div className="px-5 py-4 border-b border-border">
          <SectionHead title="All Guides" />
        </div>
        <div className="flex flex-col">
          {guides.map((g) => (
            <div key={g.userId} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
              <Avatar name={g.fullName} />
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div>
                  <p className="text-sm font-bold text-foreground">{g.fullName}</p>
                  <p className="text-xs text-muted-foreground">{g.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="text-xs font-medium text-foreground">{g.department}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Specialization</p>
                  <p className="text-xs font-medium text-foreground">{g.specialization || "-"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{g.assignedStudents}</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{g.completedProjects}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </div>
              <Badge variant={g.isAvailable ? "success" : "danger"}>{g.isAvailable ? "Available" : "Busy"}</Badge>
            </div>
          ))}
          {!guides.length && <p className="text-sm text-muted-foreground text-center py-8">No guides found</p>}
        </div>
      </Card>
    </div>
  );
}
