import {
  Building,
  Edit2,
  Eye,
  GraduationCap,
  TrendingUp,
  UserCheck
} from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import ProgressBar from "../../components/common/ProgressBar";

export default function AdminDepartmentMgmt() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Departments" value="8" icon={Building} color="bg-blue-500"/>
        <StatCard label="Total Guides" value="32" icon={UserCheck} color="bg-indigo-500"/>
        <StatCard label="Total Students" value="248" icon={GraduationCap} color="bg-green-500"/>
        <StatCard label="Avg Completion" value="68%" icon={TrendingUp} color="bg-amber-500"/>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[{name:"Computer Science",code:"CS",s:42,g:8,c:78,hod:"Prof. K. Venkatesh"},{name:"Electronics & Comm.",code:"EC",s:31,g:6,c:61,hod:"Prof. M. Sharma"},{name:"Mechanical Eng.",code:"ME",s:27,g:5,c:56,hod:"Prof. R. Nair"},{name:"Civil Engineering",code:"CE",s:18,g:3,c:67,hod:"Prof. S. Gupta"},{name:"Chemical Eng.",code:"CH",s:14,g:3,c:57,hod:"Prof. A. Verma"},{name:"Electrical Eng.",code:"EE",s:22,g:4,c:72,hod:"Prof. P. Patel"}].map((d,i)=>(
          <Card key={i}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xs font-bold">{d.code}</div><div><p className="font-bold text-sm text-foreground">{d.name}</p><p className="text-xs text-muted-foreground">HOD: {d.hod}</p></div></div>
              <Badge variant="success">active</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">{[{v:d.s,l:"Students"},{v:d.g,l:"Guides"},{v:`${d.c}%`,l:"Completion"}].map((s,j)=><div key={j} className="bg-muted/60 rounded-xl p-2 text-center"><p className="text-sm font-bold text-foreground">{s.v}</p><p className="text-xs text-muted-foreground">{s.l}</p></div>)}</div>
            <ProgressBar value={d.c} color={d.c>70?"bg-green-500":"bg-blue-500"}/>
            <div className="flex gap-1.5 mt-3"><button className="flex-1 border border-border text-xs font-medium text-muted-foreground py-1.5 rounded-lg hover:bg-muted flex items-center justify-center gap-1"><Eye className="w-3.5 h-3.5"/>View</button><button className="flex-1 border border-border text-xs font-medium text-muted-foreground py-1.5 rounded-lg hover:bg-muted flex items-center justify-center gap-1"><Edit2 className="w-3.5 h-3.5"/>Edit</button></div>
          </Card>
        ))}
      </div>
    </div>
  );
}
