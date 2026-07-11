import {
  Activity,
  Download,
  Filter,
  Server,
  ShieldCheck,
  Users
} from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";

export default function AdminAuditLogs() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Events Today" value="1,248" icon={Activity} color="bg-blue-500"/>
        <StatCard label="Security Alerts" value="3" icon={ShieldCheck} color="bg-red-500"/>
        <StatCard label="User Actions" value="892" icon={Users} color="bg-green-500"/>
        <StatCard label="System Events" value="356" icon={Server} color="bg-indigo-500"/>
      </div>
      <Card p={false}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border"><h3 className="font-bold text-foreground">Audit Log</h3><div className="flex gap-2"><button className="text-xs border border-border rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted flex items-center gap-1.5"><Filter className="w-3.5 h-3.5"/>Filter</button><button className="text-xs border border-border rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted flex items-center gap-1.5"><Download className="w-3.5 h-3.5"/>Export</button></div></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm"><thead className="bg-muted/40"><tr>{["Timestamp","User","Action","Resource","IP","Status"].map(h=><th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>
              {[{ts:"2025-07-07 14:32:11",u:"Priya Sharma",a:"UPLOAD",r:"Chapter3_v2.pdf",ip:"10.0.1.42",s:"success"},{ts:"2025-07-07 14:28:05",u:"Dr. Rajesh Mehta",a:"APPROVE",r:"Chapter2_Review",ip:"10.0.1.18",s:"success"},{ts:"2025-07-07 14:15:33",u:"Unknown",a:"LOGIN_FAIL",r:"Auth Service",ip:"10.0.4.12",s:"failed"},{ts:"2025-07-07 13:55:20",u:"Mr. Arun Kumar",a:"DELETE_USER",r:"Inactive Account",ip:"10.0.0.5",s:"success"},{ts:"2025-07-07 13:42:09",u:"System",a:"BACKUP",r:"Database Full",ip:"Internal",s:"success"}].map((log,i)=>(
                <tr key={i} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{log.ts}</td>
                  <td className="px-5 py-3 text-xs font-semibold text-foreground">{log.u}</td>
                  <td className="px-5 py-3"><Badge variant={log.a==="LOGIN_FAIL"?"danger":log.a==="BACKUP"?"success":log.a==="DELETE_USER"?"warning":"outline"}>{log.a}</Badge></td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{log.r}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{log.ip}</td>
                  <td className="px-5 py-3"><Badge variant={log.s==="success"?"success":"danger"}>{log.s}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
