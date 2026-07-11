import {
  AlertCircle,
  Clock,
  Edit2,
  Eye,
  GraduationCap,
  Plus,
  Star,
  Trash2,
  UserCheck
} from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";

export default function AdminGuideManagement() {
  const GUIDES = [
    {name:"Dr. Rajesh Mehta",dept:"CS",students:4,approved:48,avg:"1.8d",rating:4.8},
    {name:"Dr. Priya Singh",dept:"EC",students:3,approved:32,avg:"2.1d",rating:4.5},
    {name:"Dr. K. Rao",dept:"CS",students:2,approved:19,avg:"3.2d",rating:4.2},
    {name:"Dr. P. Kumar",dept:"ME",students:3,approved:27,avg:"1.5d",rating:4.9},
  ];
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Guides" value="32" icon={UserCheck} color="bg-indigo-500"/>
        <StatCard label="Avg Students/Guide" value="7.8" icon={GraduationCap} color="bg-blue-500"/>
        <StatCard label="Avg Response" value="2.1d" sub="Target: <3 days" icon={Clock} color="bg-green-500"/>
        <StatCard label="Overloaded" value="2" sub=">10 students" icon={AlertCircle} color="bg-amber-500"/>
      </div>
      <Card p={false}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border"><h3 className="font-bold text-foreground">Guide Directory</h3><button className="bg-indigo-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5"/>Add Guide</button></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>{["Guide","Dept","Students","Approvals","Avg Response","Rating","Actions"].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>
              {GUIDES.map((g,i)=>(
                <tr key={i} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3.5"><div className="flex items-center gap-3"><Avatar name={g.name} size="sm"/><span className="text-xs font-bold text-foreground">{g.name}</span></div></td>
                  <td className="px-4 py-3.5"><Badge variant="outline">{g.dept}</Badge></td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{g.students}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{g.approved}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{g.avg}</td>
                  <td className="px-4 py-3.5"><div className="flex items-center gap-1 text-xs font-bold text-amber-600"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400"/>{g.rating}</div></td>
                  <td className="px-4 py-3.5"><div className="flex gap-1">{[Eye,Edit2,Trash2].map((Icon,j)=><button key={j} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center"><Icon className={`w-3.5 h-3.5 ${j===2?"text-red-500":"text-muted-foreground"}`}/></button>)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
