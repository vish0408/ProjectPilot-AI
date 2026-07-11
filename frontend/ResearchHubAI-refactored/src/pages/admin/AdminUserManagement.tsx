import {
  Clock,
  Edit2,
  Filter,
  GraduationCap,
  Key,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users
} from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";

import { STUDENT_LIST } from "../../utils/mockData";
export default function AdminUserManagement() {
  const ALL_USERS = [
    ...STUDENT_LIST.map(s=>({name:s.name,email:`${s.name.split(" ")[0].toLowerCase()}@iitb.ac.in`,role:"student",dept:s.dept,status:"active"})),
    {name:"Dr. Rajesh Mehta",email:"r.mehta@iitb.ac.in",role:"guide",dept:"CS",status:"active"},
    {name:"Dr. Priya Singh",email:"p.singh@iitb.ac.in",role:"guide",dept:"EC",status:"active"},
    {name:"Prof. K. Venkatesh",email:"k.venkatesh@iitb.ac.in",role:"hod",dept:"CS",status:"active"},
    {name:"Mr. Arun Kumar",email:"a.kumar@iitb.ac.in",role:"admin",dept:"Admin",status:"active"},
  ];
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Users" value="284" change="+24 this month" icon={Users} color="bg-blue-500" trend="up"/>
        <StatCard label="Students" value="248" icon={GraduationCap} color="bg-indigo-500"/>
        <StatCard label="Guides" value="32" icon={UserCheck} color="bg-green-500"/>
        <StatCard label="Pending" value="5" sub="Awaiting activation" icon={Clock} color="bg-amber-500"/>
      </div>
      <Card p={false}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">All Users</h3>
          <div className="flex gap-2">
            <div className="relative hidden sm:block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"/><input className="bg-muted border border-border rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-primary w-48" placeholder="Search users…"/></div>
            <button className="text-xs border border-border rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted flex items-center gap-1.5"><Filter className="w-3.5 h-3.5"/>Filter</button>
            <button className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5"/>Add User</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>{["User","Email","Role","Dept","Status","Actions"].map(h=><th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>
              {ALL_USERS.map((u,i)=>(
                <tr key={i} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5"><div className="flex items-center gap-3"><Avatar name={u.name} size="sm"/><span className="text-xs font-bold text-foreground">{u.name}</span></div></td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3.5"><Badge variant={u.role==="admin"?"danger":u.role==="guide"?"purple":u.role==="hod"?"warning":"default"}>{u.role}</Badge></td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{u.dept}</td>
                  <td className="px-5 py-3.5"><Badge variant="success">{u.status}</Badge></td>
                  <td className="px-5 py-3.5"><div className="flex gap-1">{[Edit2,Key,Trash2].map((Icon,j)=><button key={j} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center"><Icon className={`w-3.5 h-3.5 ${j===2?"text-red-500":"text-muted-foreground"}`}/></button>)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between"><p className="text-xs text-muted-foreground">Showing 12 of 284 users</p><div className="flex gap-1">{[1,2,3,"…",24].map((p,i)=><button key={i} className={`w-8 h-8 rounded-lg text-xs font-medium ${p===1?"bg-blue-600 text-white":"border border-border text-muted-foreground hover:bg-muted"}`}>{p}</button>)}</div></div>
      </Card>
    </div>
  );
}
