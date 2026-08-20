import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart as RechartsBar,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { guideService } from "../../services/GuideService";
import { GuideDashboardData } from "../../types/Guide";

export default function GuideResearchProgress() {
  const [data, setData] = useState<GuideDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const d = await guideService.getDashboard();
        setData(d);
      } catch (e) {
        console.error("Failed to load progress data", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const students = data?.assignedStudents ?? [];

  const barData = useMemo(() =>
    students.map(s => ({ name: s.fullName, progress: Math.round(s.completionPercentage) })),
    [students]
  );

  const pieData = useMemo(() => {
    const buckets = {
      Completed: students.filter(s => s.projectStatus === "Completed").length,
      "In Progress": students.filter(s => s.projectStatus === "InProgress").length,
      "Under Review": students.filter(s => s.projectStatus === "OnHold").length,
      "Not Started": students.filter(s => !s.projectStatus || s.projectStatus === "NotStarted").length,
    };
    const colors: Record<string, string> = {
      Completed: "#22C55E",
      "In Progress": "#2563EB",
      "Under Review": "#F59E0B",
      "Not Started": "#EF4444",
    };
    const total = students.length || 1;
    return (Object.entries(buckets) as [string, number][]).map(([name, value]) => ({
      name,
      value: Math.round((value / total) * 100),
      count: value,
      color: colors[name],
    }));
  }, [students]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionHead title="Student Progress Distribution"/>
          {barData.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-10">No assigned students yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <RechartsBar data={barData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                <XAxis dataKey="name" tick={{fontSize:9,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false} tickFormatter={n=>n.split(" ")[0]}/>
                <YAxis tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false} domain={[0,100]}/>
                <Tooltip contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"12px",fontSize:12}} formatter={v=>[`${v}%`,"Progress"]}/>
                <Bar dataKey="progress" radius={[6,6,0,0]}>{barData.map((s,i)=><Cell key={i} fill={s.progress>70?"#22C55E":s.progress>40?"#2563EB":"#F59E0B"}/>)}</Bar>
              </RechartsBar>
            </ResponsiveContainer>
          )}
        </Card>
        <Card>
          <SectionHead title="Status Breakdown"/>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">{pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie>
              <Tooltip contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"12px",fontSize:12}} formatter={(v, name) => {
                const entry = pieData.find(p => p.name === name);
                return [`${v}% (${entry?.count ?? 0} student${(entry?.count ?? 0) === 1 ? "" : "s"})`, name as string];
              }}/>
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">{pieData.map((d,i)=><div key={i} className="flex items-center justify-between text-xs"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:d.color}}/><span className="text-muted-foreground">{d.name}</span></div><span className="font-bold text-foreground">{d.value}% ({d.count})</span></div>)}</div>
        </Card>
      </div>
    </div>
  );
}
