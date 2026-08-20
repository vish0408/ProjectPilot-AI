import { useEffect, useState } from "react";
import {
  BarChart2,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileText,
  GraduationCap
} from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Card from "../../components/common/Card";
import { guideService } from "../../services/GuideService";
import { GuideDashboardData, Meeting, Review } from "../../types/Guide";

function fmtDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function GuideReports() {
  const [dashboard, setDashboard] = useState<GuideDashboardData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [d, r, m] = await Promise.all([
          guideService.getDashboard(),
          guideService.getMyReviews(),
          guideService.getMyMeetings(),
        ]);
        setDashboard(d);
        setReviews(r);
        setMeetings(m);
      } catch (e) {
        console.error("Failed to load report data", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const students = dashboard?.assignedStudents ?? [];
  const totalChapters = students.reduce((a, s) => a + (s.totalChapters || 0), 0);
  const approvedChapters = students.reduce((a, s) => a + (s.approvedChapters || 0), 0);
  const avgProgress = students.length
    ? Math.round(students.reduce((a, s) => a + s.completionPercentage, 0) / students.length)
    : 0;
  const pendingReviews = dashboard?.pendingReviews ?? 0;
  const projectsUnderReview = dashboard?.projectsUnderReview ?? 0;
  const upcomingMeetings = dashboard?.upcomingMeetings ?? 0;

  const todayStr = fmtDate(new Date());
  const latestReviewDate = reviews.length
    ? fmtDate(new Date(Math.max(...reviews.map(r => new Date(r.createdAt).getTime()))))
    : "—";
  const latestMeetingDate = meetings.length
    ? fmtDate(new Date(Math.max(...meetings.map(m => new Date(m.scheduledAt).getTime()))))
    : "—";

  const reports = [
    { t: "Student Progress Report", d: `${students.length} assigned student${students.length === 1 ? "" : "s"}`, stat: `${avgProgress}% avg`, icon: GraduationCap, c: "bg-indigo-500", dt: todayStr },
    { t: "Review Activity Report", d: `${reviews.length} review${reviews.length === 1 ? "" : "s"} recorded`, stat: `${pendingReviews} pending`, icon: FileCheck, c: "bg-blue-500", dt: latestReviewDate },
    { t: "Chapter Approval Log", d: `${totalChapters} chapters · ${approvedChapters} approved`, stat: totalChapters ? `${Math.round((approvedChapters / totalChapters) * 100)}% approved` : "—", icon: CheckCircle, c: "bg-green-500", dt: todayStr },
    { t: "Meeting History", d: `${meetings.length} meeting${meetings.length === 1 ? "" : "s"}`, stat: `${upcomingMeetings} upcoming`, icon: Calendar, c: "bg-cyan-500", dt: latestMeetingDate },
    { t: "Pending Approvals", d: `${pendingReviews} review${pendingReviews === 1 ? "" : "s"} awaiting action`, stat: pendingReviews ? "Action needed" : "All clear", icon: Clock, c: "bg-amber-500", dt: latestReviewDate },
    { t: "Projects Under Review", d: `${projectsUnderReview} project${projectsUnderReview === 1 ? "" : "s"} in progress`, stat: `${students.length} total`, icon: BarChart2, c: "bg-purple-500", dt: todayStr },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Assigned Students" value={students.length.toString()} icon={GraduationCap} color="bg-indigo-500"/>
        <StatCard label="Pending Reviews" value={pendingReviews.toString()} icon={FileText} color="bg-blue-500"/>
        <StatCard label="Projects Under Review" value={projectsUnderReview.toString()} icon={BarChart2} color="bg-green-500"/>
        <StatCard label="Upcoming Meetings" value={upcomingMeetings.toString()} icon={Clock} color="bg-amber-500"/>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r,i)=>(
          <Card key={i}>
            <div className={`w-10 h-10 ${r.c} rounded-xl flex items-center justify-center mb-4`}><r.icon className="w-5 h-5 text-white"/></div>
            <h3 className="font-bold text-sm text-foreground mb-1">{r.t}</h3>
            <p className="text-xs text-muted-foreground mb-3">{r.d}</p>
            <p className="text-xs font-bold text-foreground mb-3">{r.stat}</p>
            <p className="text-xs text-muted-foreground mb-3">Updated: {r.dt}</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1"><Download className="w-3.5 h-3.5"/>PDF</button>
              <button className="flex-1 border border-border text-xs font-medium text-muted-foreground py-2 rounded-xl hover:bg-muted flex items-center justify-center gap-1"><Eye className="w-3.5 h-3.5"/>View</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
