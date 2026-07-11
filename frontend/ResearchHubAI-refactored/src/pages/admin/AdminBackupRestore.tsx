import { useState } from "react";
import {
  Clock,
  Database,
  HardDrive,
  RefreshCw
} from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";

export default function AdminBackupRestore() {
  const [running, setRunning] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Last Backup" value="6h ago" sub="Jul 7, 08:00 AM" icon={HardDrive} color="bg-green-500"/>
        <StatCard label="Backup Size" value="48.2 GB" icon={Database} color="bg-blue-500"/>
        <StatCard label="Retention" value="90 days" icon={Clock} color="bg-indigo-500"/>
        <StatCard label="Next Scheduled" value="2:00 AM" sub="Daily automatic" icon={RefreshCw} color="bg-amber-500"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionHead title="Manual Backup"/>
          <div className="flex flex-col gap-4">
            <div><label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Backup Type</label><select className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary text-foreground"><option>Full Backup</option><option>Incremental</option><option>Database Only</option></select></div>
            <div><label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Destination</label><select className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary text-foreground"><option>Primary Cloud (AWS S3)</option><option>Secondary Cloud (GCS)</option></select></div>
            <button onClick={()=>{setRunning(true);setTimeout(()=>setRunning(false),3000);}} className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${running?"bg-muted text-muted-foreground cursor-not-allowed":"bg-blue-600 hover:bg-blue-700 text-white"}`}>
              {running?<><RefreshCw className="w-4 h-4 animate-spin"/>Running…</>:<><HardDrive className="w-4 h-4"/>Start Backup Now</>}
            </button>
          </div>
        </Card>
        <Card>
          <SectionHead title="Backup History"/>
          {[{n:"Full Backup",d:"Jul 7, 08:00 AM",sz:"48.2 GB",s:"success"},{n:"Incremental",d:"Jul 6, 08:00 AM",sz:"1.2 GB",s:"success"},{n:"Full Backup",d:"Jul 6, 02:00 AM",sz:"47.9 GB",s:"success"},{n:"Incremental",d:"Jul 5, 08:00 AM",sz:"0.9 GB",s:"failed"}].map((b,i)=>(
            <div key={i} className={`flex items-center justify-between p-3 border border-border rounded-xl hover:bg-muted/30 ${i>0?"mt-2":""}`}>
              <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-lg flex items-center justify-center ${b.s==="success"?"bg-green-100 dark:bg-green-900/30":"bg-red-100 dark:bg-red-900/30"}`}><HardDrive className={`w-4 h-4 ${b.s==="success"?"text-green-600":"text-red-600"}`}/></div><div><p className="text-xs font-bold text-foreground">{b.n}</p><p className="text-xs text-muted-foreground">{b.d} · {b.sz}</p></div></div>
              <Badge variant={b.s==="success"?"success":"danger"}>{b.s}</Badge>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
