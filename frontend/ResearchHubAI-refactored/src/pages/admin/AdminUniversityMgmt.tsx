import {
  Building,
  GraduationCap,
  Layers,
  Users
} from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";

export default function AdminUniversityMgmt() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Institution" value="1" sub="IIT Bombay" icon={Building} color="bg-blue-600"/>
        <StatCard label="Departments" value="8" icon={Layers} color="bg-indigo-500"/>
        <StatCard label="Total Faculty" value="186" icon={Users} color="bg-green-500"/>
        <StatCard label="PhD Students" value="248" icon={GraduationCap} color="bg-amber-500"/>
      </div>
      <Card>
        <SectionHead title="Institution Profile"/>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-4"><Building className="w-8 h-8 text-white"/></div>
            <h3 className="text-lg font-bold text-foreground mb-1">Indian Institute of Technology Bombay</h3>
            <p className="text-sm text-muted-foreground mb-1">Powai, Mumbai, Maharashtra 400076</p>
            <div className="flex flex-wrap gap-2 mt-3">{["NIRF Top 5","QS Ranked","NAAC A++","UGC Recognized"].map((b,i)=><Badge key={i} variant="success">{b}</Badge>)}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">{[{v:"1958",l:"Established"},{v:"8",l:"Departments"},{v:"248",l:"PhD Students"},{v:"186",l:"Faculty"},{v:"82",l:"PhDs Awarded"},{v:"99.2%",l:"System Uptime"}].map((s,i)=><div key={i} className="bg-muted/60 rounded-xl p-3 text-center"><p className="text-xl font-bold text-blue-600">{s.v}</p><p className="text-xs text-muted-foreground">{s.l}</p></div>)}</div>
        </div>
      </Card>
    </div>
  );
}
