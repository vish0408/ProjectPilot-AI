import {
  AlertCircle,
  CheckCircle,
  Download,
  Edit2,
  Eye,
  FlaskConical,
  GraduationCap,
  Plus,
  Search,
  Trash2
} from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import ProgressBar from "../../components/common/ProgressBar";
import { STUDENT_LIST } from "../../utils/mockData";

export default function AdminStudentManagement() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Students" value="248" icon={GraduationCap} color="bg-blue-500"/>
        <StatCard label="Active Research" value="164" icon={FlaskConical} color="bg-indigo-500"/>
        <StatCard label="Completed" value="82" icon={CheckCircle} color="bg-green-500"/>
        <StatCard label="Unassigned" value="4" sub="Need guide assignment" icon={AlertCircle} color="bg-amber-500"/>
      </div>
      <Card p={false}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">Student Directory</h3>
          <div className="flex gap-2">
            <div className="relative hidden sm:block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"/><input className="bg-muted border border-border rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-primary w-44" placeholder="Search…"/></div>
            <button className="text-xs border border-border rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted flex items-center gap-1.5"><Download className="w-3.5 h-3.5"/>Export</button>
            <button className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5"/>Add</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>{["Student","Research Topic","Guide","Dept","Progress","Status","Actions"].map(h=><th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>
              {STUDENT_LIST.map((s,i)=>(
                <tr key={i} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5"><div className="flex items-center gap-3"><Avatar name={s.name} size="sm"/><div><p className="text-xs font-bold text-foreground">{s.name}</p><p className="text-xs text-muted-foreground">{s.yr} Year</p></div></div></td>
                  <td className="px-5 py-3.5 max-w-[140px]"><p className="text-xs text-muted-foreground truncate">{s.topic}</p></td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{s.guide}</td>
                  <td className="px-5 py-3.5"><Badge variant="outline">{s.dept}</Badge></td>
                  <td className="px-5 py-3.5 min-w-[100px]"><div className="flex items-center gap-2"><ProgressBar value={s.progress} color={s.progress>70?"bg-green-500":s.progress>40?"bg-blue-500":"bg-amber-500"} h="h-1.5"/><span className="text-xs font-bold w-7">{s.progress}%</span></div></td>
                  <td className="px-5 py-3.5"><Badge variant={s.status==="active"?"success":s.status==="review"?"warning":"danger"}>{s.status}</Badge></td>
                  <td className="px-5 py-3.5"><div className="flex gap-1">{[Eye,Edit2,Trash2].map((Icon,j)=><button key={j} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center"><Icon className={`w-3.5 h-3.5 ${j===2?"text-red-500":"text-muted-foreground"}`}/></button>)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
