import { Edit2 } from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { useApp } from "../../context/AppContext";

const roleLabels: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Administrator",
  collegeadmin: "College Admin",
  hod: "HOD",
  guide: "Research Guide",
  student: "PhD Student",
};

export default function AdminProfile() {
  const { user } = useApp();
  const roleLabel = roleLabels[user?.role ?? ""] ?? "Administrator";
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center text-2xl font-bold">{user?.avatar}</div>
          <div className="flex-1"><h2 className="text-2xl font-bold">{user?.name}</h2><p className="text-slate-300">{user?.designation}</p><p className="text-slate-400 text-sm">{user?.institution}</p><div className="flex gap-2 mt-3"><Badge className="bg-red-600/80 text-white border-0">{roleLabel}</Badge><Badge className="bg-white/10 text-white border-0">Full Access</Badge></div></div>
          <button className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2"><Edit2 className="w-4 h-4"/>Edit</button>
        </div>
      </div>
      <Card>
        <SectionHead title="Account Details"/>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[{l:"Name",v:user?.name},{l:"Email",v:user?.email},{l:"Role",v:roleLabel},{l:"Department",v:user?.dept || "—"},{l:"Institution",v:user?.institution || "—"}].map((f,i)=><div key={i}><label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{f.l}</label><p className="text-sm font-medium text-foreground mt-1">{f.v}</p></div>)}</div>
      </Card>
    </div>
  );
}
