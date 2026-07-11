import {
  Calendar,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingUp
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
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { MILESTONES } from "../../utils/mockData";

export default function StudentResearchTimeline() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Done" value="3 / 8" icon={CheckCircle} color="bg-green-500"/>
        <StatCard label="In Progress" value="1" icon={RefreshCw} color="bg-blue-500"/>
        <StatCard label="Pending" value="4" icon={Clock} color="bg-amber-500"/>
        <StatCard label="Overall" value="78%" change="+3% this month" icon={TrendingUp} color="bg-indigo-500" trend="up"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionHead title="Research Milestones"/>
          <div className="flex flex-col">
            {MILESTONES.map((m,i)=>(
              <div key={i} className="flex gap-4 pb-5 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 ${m.status==="completed"?"border-green-500 bg-green-50 dark:bg-green-900/30":m.status==="in-progress"?"border-blue-500 bg-blue-50 dark:bg-blue-900/30":"border-border bg-muted"}`}>
                    {m.status==="completed"?<CheckCircle className="w-4 h-4 text-green-600"/>:m.status==="in-progress"?<RefreshCw className="w-4 h-4 text-blue-600 animate-spin"/>:<Clock className="w-4 h-4 text-muted-foreground"/>}
                  </div>
                  {i<MILESTONES.length-1&&<div className={`w-0.5 flex-1 mt-1 ${m.status==="completed"?"bg-green-200 dark:bg-green-900/50":"bg-border"}`}/>}
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-bold text-sm text-foreground">{m.title}</span>
                    <Badge variant={m.status==="completed"?"success":m.status==="in-progress"?"default":"outline"}>{m.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Calendar className="w-3 h-3"/>{m.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionHead title="Phase Progress"/>
          <ResponsiveContainer width="100%" height={280}>
            <RechartsBar data={[{n:"Literature",v:100},{n:"Methodology",v:80},{n:"Data",v:65},{n:"Analysis",v:40},{n:"Writing",v:25}]} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false}/>
              <XAxis type="number" domain={[0,100]} tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
              <YAxis type="category" dataKey="n" tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false} width={75}/>
              <Tooltip contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"12px",fontSize:12}} formatter={v=>[`${v}%`]}/>
              <Bar dataKey="v" radius={6}>{[0,1,2,3,4].map(i=><Cell key={i} fill={["#22C55E","#2563EB","#06B6D4","#4F46E5","#F59E0B"][i]}/>)}</Bar>
            </RechartsBar>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
