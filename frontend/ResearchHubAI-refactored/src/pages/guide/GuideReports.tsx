import {
  BarChart2,
  Brain,
  Building,
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

export default function GuideReports() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Generated" value="32" icon={FileText} color="bg-indigo-500"/>
        <StatCard label="This Month" value="8" icon={BarChart2} color="bg-blue-500"/>
        <StatCard label="Exported" value="24" icon={Download} color="bg-green-500"/>
        <StatCard label="Scheduled" value="3" icon={Clock} color="bg-amber-500"/>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[{t:"Student Progress Report",d:"Individual progress for all students",icon:GraduationCap,c:"bg-indigo-500",dt:"Jul 7"},{t:"Review Activity Report",d:"Your review history and response times",icon:FileCheck,c:"bg-blue-500",dt:"Jul 5"},{t:"Chapter Approval Log",d:"All approved/rejected chapters",icon:CheckCircle,c:"bg-green-500",dt:"Jul 7"},{t:"Meeting History",d:"Past and upcoming meetings",icon:Calendar,c:"bg-cyan-500",dt:"Jul 6"},{t:"AI Usage Summary",d:"AI review assistant analytics",icon:Brain,c:"bg-purple-500",dt:"Jul 1"},{t:"Department Report",d:"Dept-wide research statistics",icon:Building,c:"bg-amber-500",dt:"Jun 30"}].map((r,i)=>(
          <Card key={i}>
            <div className={`w-10 h-10 ${r.c} rounded-xl flex items-center justify-center mb-4`}><r.icon className="w-5 h-5 text-white"/></div>
            <h3 className="font-bold text-sm text-foreground mb-1">{r.t}</h3>
            <p className="text-xs text-muted-foreground mb-3">{r.d}</p>
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
