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
import { PIE_DATA, STUDENT_LIST } from "../../utils/mockData";

export default function GuideResearchProgress() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionHead title="Student Progress Distribution"/>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsBar data={STUDENT_LIST} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="name" tick={{fontSize:9,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false} tickFormatter={n=>n.split(" ")[0]}/>
              <YAxis tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false} domain={[0,100]}/>
              <Tooltip contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"12px",fontSize:12}} formatter={v=>[`${v}%`,"Progress"]}/>
              <Bar dataKey="progress" radius={[6,6,0,0]}>{STUDENT_LIST.map((s,i)=><Cell key={i} fill={s.progress>70?"#22C55E":s.progress>40?"#2563EB":"#F59E0B"}/>)}</Bar>
            </RechartsBar>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionHead title="Status Breakdown"/>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">{PIE_DATA.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie>
              <Tooltip contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"12px",fontSize:12}}/>
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">{PIE_DATA.map((d,i)=><div key={i} className="flex items-center justify-between text-xs"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:d.color}}/><span className="text-muted-foreground">{d.name}</span></div><span className="font-bold text-foreground">{d.value}%</span></div>)}</div>
        </Card>
      </div>
    </div>
  );
}
