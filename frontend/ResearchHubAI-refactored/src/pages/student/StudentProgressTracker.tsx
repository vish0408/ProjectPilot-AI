import {
  Award,
  CheckSquare,
  Clock,
  TrendingUp
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import ProgressBar from "../../components/common/ProgressBar";
import SectionHead from "../../components/common/SectionHead";
import { CHAPTERS, MONTHLY_DATA } from "../../utils/mockData";

export default function StudentProgressTracker() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Overall Progress" value="78%" change="+3% this month" icon={TrendingUp} color="bg-blue-500" trend="up"/>
        <StatCard label="Tasks Completed" value="24/31" icon={CheckSquare} color="bg-green-500"/>
        <StatCard label="Days Remaining" value="287" icon={Clock} color="bg-amber-500"/>
        <StatCard label="Guide Approvals" value="6/8" icon={Award} color="bg-indigo-500"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionHead title="Monthly Progress"/>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY_DATA}>
              <defs><linearGradient id="pg1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/><stop offset="95%" stopColor="#2563EB" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="month" tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"12px",fontSize:12}}/>
              <Area type="monotone" dataKey="submissions" stroke="#2563EB" strokeWidth={2.5} fill="url(#pg1)" name="Progress"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionHead title="Chapter Completion"/>
          {CHAPTERS.map((c,i)=>(
            <div key={i} className={i>0?"mt-3":""}>
              <div className="flex items-center justify-between mb-1"><span className="text-xs font-semibold text-foreground">{c.ch.split("—")[0].trim()}</span><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{c.p}%</span><Badge variant={c.status==="approved"?"success":c.status==="review"?"warning":c.status==="draft"?"default":"outline"}>{c.status}</Badge></div></div>
              <ProgressBar value={c.p} color={c.p===100?"bg-green-500":c.p>50?"bg-blue-500":c.p>0?"bg-amber-500":"bg-muted"}/>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
