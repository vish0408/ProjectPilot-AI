import {
  AlertCircle,
  Check,
  CheckCircle,
  Edit2,
  Key,
  Settings,
  Shield,
  X
} from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Card from "../../components/common/Card";

export default function AdminRolesPermissions() {
  const ROLES = [
    {role:"Student",users:248,allow:["Upload Thesis","View Own Research","Chat with AI","Request Meetings","Download Reports"],deny:["View Others' Data","Approve Thesis","Manage Users","System Settings"]},
    {role:"Research Guide",users:32,allow:["View Assigned Students","Review Chapters","Approve/Reject","Schedule Meetings","AI Review Tools"],deny:["Department Mgmt","User Management","System Configuration"]},
    {role:"HOD",users:8,allow:["Department Dashboard","View All Students","Guide Management","Department Reports"],deny:["University Mgmt","Global User Mgmt","System Configuration"]},
    {role:"Administrator",users:4,allow:["Full System Access","User Management","AI Configuration","Backup & Restore","Audit Logs"],deny:[]},
  ];
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Roles" value="6" icon={Key} color="bg-blue-500"/>
        <StatCard label="Permission Groups" value="24" icon={Shield} color="bg-indigo-500"/>
        <StatCard label="Custom Rules" value="12" icon={Settings} color="bg-green-500"/>
        <StatCard label="Access Denied (Today)" value="3" icon={AlertCircle} color="bg-amber-500"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {ROLES.map((r,i)=>(
          <Card key={i}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center"><Shield className="w-4 h-4 text-white"/></div><div><p className="font-bold text-foreground">{r.role}</p><p className="text-xs text-muted-foreground">{r.users} users</p></div></div>
              <button className="border border-border text-xs font-medium text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-muted flex items-center gap-1"><Edit2 className="w-3 h-3"/>Edit</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><p className="text-xs font-bold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/>Allowed</p>{r.allow.slice(0,4).map((p,j)=><div key={j} className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5"><Check className="w-3 h-3 text-green-500 flex-shrink-0"/>{p}</div>)}</div>
              {r.deny.length>0&&<div><p className="text-xs font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1"><X className="w-3.5 h-3.5"/>Restricted</p>{r.deny.slice(0,4).map((p,j)=><div key={j} className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5"><X className="w-3 h-3 text-red-500 flex-shrink-0"/>{p}</div>)}</div>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
