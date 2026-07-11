import {
  Clock,
  FileText,
  Sparkles,
  TrendingUp
} from "lucide-react";
import {
  Bar,
  BarChart as RechartsBar,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import StatCard from "../../components/cards/StatCard";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import {
  DEPT_DATA,
  MONTHLY_DATA
} from "../../utils/mockData";
export default function AdminAnalytics() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Completion Rate" value="68%" change="+8% YoY" icon={TrendingUp} color="bg-green-500" trend="up"/>
        <StatCard label="Avg Duration" value="3.2 yrs" sub="Target: 3 years" icon={Clock} color="bg-blue-500"/>
        <StatCard label="Reports Generated" value="248" icon={FileText} color="bg-indigo-500"/>
        <StatCard label="AI Utilization" value="94%" sub="High adoption" icon={Sparkles} color="bg-cyan-500"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionHead title="Monthly Activity"/>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MONTHLY_DATA}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/><XAxis dataKey="month" tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"12px",fontSize:12}}/><Legend/><Line type="monotone" dataKey="submissions" stroke="#2563EB" strokeWidth={2.5} dot={{r:3}} name="Submissions"/><Line type="monotone" dataKey="approvals" stroke="#22C55E" strokeWidth={2.5} dot={{r:3}} name="Approvals"/><Line type="monotone" dataKey="meetings" stroke="#F59E0B" strokeWidth={2.5} dot={{r:3}} name="Meetings"/></LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionHead title="Department Performance"/>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsBar data={DEPT_DATA} barSize={14}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/><XAxis dataKey="name" tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"12px",fontSize:12}}/><Legend/><Bar dataKey="students" fill="#2563EB" radius={[5,5,0,0]} name="Enrolled"/><Bar dataKey="completed" fill="#22C55E" radius={[5,5,0,0]} name="Completed"/></RechartsBar>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
