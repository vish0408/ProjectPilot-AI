import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  FileCheck,
  GraduationCap
} from "lucide-react";
import {
  Bar,
  BarChart as RechartsBar,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import StatCard from "../../components/cards/StatCard";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import ProgressBar from "../../components/common/ProgressBar";
import SectionHead from "../../components/common/SectionHead";
import { useApp } from "../../context/AppContext";
import { guideService } from "../../services/GuideService";
import { GuideDashboardData } from "../../types/Guide";

export default function GuideDashboard() {
  const { user, setScreen } = useApp();
  const [data, setData] = useState<GuideDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const d = await guideService.getDashboard();
        setData(d);
      } catch (e) {
        console.error("Failed to load dashboard", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!data) {
    return <div className="text-center text-muted-foreground py-10">Failed to load dashboard data.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-12 translate-x-12"/>
        <div className="relative">
          <p className="text-indigo-100 text-sm mb-1">Welcome, {user?.name} 👋</p>
          <h2 className="text-xl font-bold mb-0.5">{user?.designation}</h2>
          <p className="text-indigo-100 text-sm mb-4">{user?.dept} · {user?.institution}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[{v:data.totalAssignedStudents.toString(),l:"Assigned Students"},{v:data.pendingReviews.toString(),l:"Pending Approvals"},{v:data.projectsUnderReview.toString(),l:"Reviews Due"},{v:data.upcomingMeetings.toString(),l:"Meetings Today"}].map((s,i)=>(
              <div key={i} className="bg-white/15 rounded-xl px-4 py-3"><p className="text-2xl font-bold text-white">{s.v}</p><p className="text-indigo-100 text-xs">{s.l}</p></div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Students" value={data.totalAssignedStudents.toString()} sub="Assigned to you" icon={GraduationCap} color="bg-indigo-500"/>
        <StatCard label="Pending Reviews" value={data.pendingReviews.toString()} change="Awaiting action" icon={FileCheck} color="bg-amber-500" trend="down"/>
        <StatCard label="Under Review" value={data.projectsUnderReview.toString()} change="In progress" icon={CheckCircle} color="bg-green-500" trend="up"/>
        <StatCard label="Upcoming" value={data.upcomingMeetings.toString()} sub="Scheduled meetings" icon={Clock} color="bg-blue-500"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionHead title="Student Progress" desc="All assigned students" action={<button className="text-xs text-blue-600 font-semibold hover:underline">View All</button>}/>
          <div className="flex flex-col gap-3">
            {data.assignedStudents.map((s,i)=>(
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors border border-border">
                <Avatar name={s.fullName}/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1"><p className="text-sm font-bold text-foreground">{s.fullName}</p><Badge variant={s.completionPercentage>70?"success":s.completionPercentage>40?"warning":"danger"}>{s.completionPercentage>70?"active":"review"}</Badge></div>
                  <p className="text-xs text-muted-foreground truncate mb-1.5">{s.researchTopic}</p>
                  <div className="flex items-center gap-2"><ProgressBar value={s.completionPercentage} color={s.completionPercentage>70?"bg-green-500":s.completionPercentage>40?"bg-blue-500":"bg-amber-500"} h="h-1.5"/><span className="text-xs font-bold w-8">{s.completionPercentage}%</span></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHead title="Pending Approvals" action={data.pendingReviewList.length>0?<Badge variant="danger">{data.pendingReviewList.length} pending</Badge>:undefined}/>
          <div className="flex flex-col gap-3">
            {data.pendingReviewList.length===0&&<p className="text-xs text-muted-foreground text-center py-6">No pending approvals</p>}
            {data.pendingReviewList.map((r,i)=>(
              <div key={i} className="border border-border rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2"><Avatar name={r.studentName} size="sm"/><div><p className="text-xs font-bold text-foreground">{r.studentName}</p><p className="text-xs text-muted-foreground">{r.projectTitle}</p></div></div>
                  <Badge variant={r.type==="Chapter"?"default":"info"}>{r.type}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{r.submittedAt?new Date(r.submittedAt).toLocaleDateString():""}</span>
                  <div className="flex gap-1.5">
                    <button className="bg-green-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-green-700">Approve</button>
                    <button className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-amber-600">Revise</button>
                    <button className="border border-border text-xs font-medium text-muted-foreground px-2.5 py-1.5 rounded-lg hover:bg-muted">View</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SectionHead title="Pending Thesis Reviews" action={data.pendingThesisReviews.length>0?<Badge variant="info">{data.pendingThesisReviews.length} pending</Badge>:undefined}/>
        <div className="flex flex-col gap-3">
          {data.pendingThesisReviews.length===0&&<p className="text-xs text-muted-foreground text-center py-6">No thesis documents to review</p>}
          {data.pendingThesisReviews.map((d,i)=>(
            <div key={d.documentId} className="border border-border rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2"><Avatar name={d.studentName} size="sm"/><div><p className="text-xs font-bold text-foreground">{d.studentName}</p><p className="text-xs text-muted-foreground truncate max-w-48">{d.fileName}</p></div></div>
                <Badge variant={!d.reviewStatus?"warning":d.reviewStatus==="Approved"?"success":d.reviewStatus==="Rejected"?"danger":"default"}>{d.reviewStatus||"Pending"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{d.projectTitle} · v{d.version} · {new Date(d.uploadedAt).toLocaleDateString()}</span>
                <div className="flex gap-1.5">
                  <button onClick={()=>setScreen("thesis-reviews")} className="bg-green-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-green-700">Approve</button>
                  <button onClick={()=>setScreen("thesis-reviews")} className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-amber-600">Revise</button>
                  <button onClick={()=>setScreen("thesis-reviews")} className="border border-border text-xs font-medium text-muted-foreground px-2.5 py-1.5 rounded-lg hover:bg-muted">View</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <SectionHead title="Student Performance"/>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsBar data={data.assignedStudents} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="fullName" tick={{fontSize:10,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false} tickFormatter={n=>n.split(" ")[0]}/>
              <YAxis tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false} domain={[0,100]}/>
              <Tooltip contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"12px",fontSize:12}} formatter={v=>[`${v}%`,"Progress"]}/>
              <Bar dataKey="completionPercentage" radius={[6,6,0,0]}>{data.assignedStudents.map((s,i)=><Cell key={i} fill={s.completionPercentage>70?"#22C55E":s.completionPercentage>40?"#2563EB":"#F59E0B"}/>)}</Bar>
            </RechartsBar>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionHead title="AI Recommendations" action={<Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0">AI</Badge>}/>
          {[{t:`${data.assignedStudents[0]?.fullName||"A student"} — schedule a progress check-in`,c:"Tip"},{t:`${data.totalAssignedStudents} students under your guidance — keep up the momentum`,c:"Alert"},{t:`${data.pendingReviews} pending review${data.pendingReviews!==1?"s":""} — proactive intervention recommended`,c:"Warning"}].map((r,i)=>(
            <div key={i} className={`p-3 rounded-xl border text-xs ${i>0?"mt-2":""} ${r.c==="Alert"?"border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20":r.c==="Warning"?"border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20":"border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20"}`}>
              <p className={`font-bold mb-0.5 ${r.c==="Alert"?"text-red-700 dark:text-red-300":r.c==="Warning"?"text-amber-700 dark:text-amber-300":"text-blue-700 dark:text-blue-300"}`}>{r.c}</p>
              <p className="text-muted-foreground">{r.t}</p>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
