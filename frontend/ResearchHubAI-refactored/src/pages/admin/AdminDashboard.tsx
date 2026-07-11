import {
  BarChart2,
  Brain,
  Building,
  CheckCircle,
  Clock,
  FlaskConical,
  GraduationCap,
  MonitorDot,
  Plus,
  UserCheck
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartsBar,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
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
import { useApp } from "../../context/AppContext";
import {
  DEPT_DATA,
  MONTHLY_DATA,
  PIE_DATA
} from "../../utils/mockData";
export default function AdminDashboard() {
  const { user } = useApp();
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:"radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",backgroundSize:"40px 40px"}}/>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div><p className="text-slate-300 text-sm mb-0.5">System Administrator</p><h2 className="text-xl font-bold">{user?.institution} — ResearchHub AI</h2><p className="text-slate-300 text-sm mt-0.5">5 new registrations · 1 system alert · Services operational</p></div>
          <div className="flex gap-2"><button className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2"><Plus className="w-4 h-4"/>Add User</button><button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2"><BarChart2 className="w-4 h-4"/>Analytics</button></div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value="248" change="+12 this month" icon={GraduationCap} color="bg-blue-500" trend="up"/>
        <StatCard label="Research Guides" value="32" sub="8 departments" icon={UserCheck} color="bg-indigo-500"/>
        <StatCard label="Departments" value="8" sub="All active" icon={Building} color="bg-cyan-500"/>
        <StatCard label="Completed Research" value="82" change="+3 this month" icon={CheckCircle} color="bg-green-500" trend="up"/>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Projects" value="164" change="+5 this week" icon={FlaskConical} color="bg-violet-500" trend="up"/>
        <StatCard label="Pending Approvals" value="28" sub="Across all guides" icon={Clock} color="bg-amber-500"/>
        <StatCard label="AI Queries (Month)" value="4,820" change="+34%" icon={Brain} color="bg-teal-500" trend="up"/>
        <StatCard label="System Health" value="99.2%" sub="All services up" icon={MonitorDot} color="bg-green-600"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <SectionHead title="University Research Activity" desc="Monthly trends"/>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY_DATA}>
              <defs>
                <linearGradient id="adB" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/><stop offset="95%" stopColor="#2563EB" stopOpacity={0}/></linearGradient>
                <linearGradient id="adG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22C55E" stopOpacity={0.15}/><stop offset="95%" stopColor="#22C55E" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="month" tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"12px",fontSize:12}}/>
              <Legend/>
              <Area type="monotone" dataKey="submissions" stroke="#2563EB" strokeWidth={2.5} fill="url(#adB)" name="Submissions"/>
              <Area type="monotone" dataKey="approvals" stroke="#22C55E" strokeWidth={2.5} fill="url(#adG)" name="Approvals"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionHead title="Research Status"/>
          <ResponsiveContainer width="100%" height={170}>
            <RechartsPieChart><Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={72} paddingAngle={3} dataKey="value">{PIE_DATA.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"12px",fontSize:12}}/></RechartsPieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">{PIE_DATA.map((d,i)=><div key={i} className="flex items-center justify-between text-xs"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:d.color}}/><span className="text-muted-foreground">{d.name}</span></div><span className="font-bold text-foreground">{d.value}%</span></div>)}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <SectionHead title="System Health"/>
          {[{l:"API Server",p:99.9,s:"Operational"},{l:"AI Models",p:99.7,s:"Operational"},{l:"File Storage",p:100,s:"Operational"},{l:"Email Service",p:87.2,s:"Degraded"},{l:"Database",p:99.5,s:"Operational"}].map((s,i)=>(
            <div key={i} className={i>0?"mt-3":""}>
              <div className="flex items-center justify-between mb-1"><span className="text-sm text-foreground">{s.l}</span><Badge variant={s.s==="Operational"?"success":"warning"}>{s.s}</Badge></div>
              <ProgressBar value={s.p} color={s.p>95?"bg-green-500":"bg-amber-500"}/>
            </div>
          ))}
        </Card>
        <Card className="lg:col-span-2">
          <SectionHead title="Department Comparison"/>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsBar data={DEPT_DATA} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="name" tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"12px",fontSize:12}}/>
              <Legend/>
              <Bar dataKey="students" fill="#2563EB" radius={[5,5,0,0]} name="Enrolled"/>
              <Bar dataKey="completed" fill="#22C55E" radius={[5,5,0,0]} name="Completed"/>
            </RechartsBar>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
