import {
  Building,
  Plus,
  Telescope,
  TrendingUp
} from "lucide-react";

import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import ProgressBar from "../../components/common/ProgressBar";
import SectionHead from "../../components/common/SectionHead";

export default function AdminResearchTopics() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Active Topics" value="164" icon={Telescope} color="bg-blue-500"/>
        <StatCard label="Departments" value="8" icon={Building} color="bg-indigo-500"/>
        <StatCard label="Trending Area" value="AI/ML" icon={TrendingUp} color="bg-green-500"/>
        <StatCard label="New This Year" value="42" icon={Plus} color="bg-amber-500"/>
      </div>
      <Card>
        <SectionHead title="Research Areas" action={<button className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5"/>Add Topic</button>}/>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[{a:"Artificial Intelligence & ML",c:48,d:"CS",t:"+12"},{a:"Computer Vision",c:32,d:"CS",t:"+8"},{a:"Wireless Communication",c:24,d:"EC",t:"+3"},{a:"IoT & Embedded Systems",c:19,d:"EC",t:"+5"},{a:"Structural Analysis",c:15,d:"CE",t:"+1"},{a:"Robotics & Automation",c:26,d:"ME",t:"+7"}].map((t,i)=>(
            <div key={i} className="border border-border rounded-xl p-4 hover:bg-muted/30">
              <div className="flex items-center justify-between mb-2"><Badge variant="outline">{t.d}</Badge><span className="text-xs text-green-600 font-semibold">{t.t} this year</span></div>
              <p className="font-bold text-sm text-foreground mb-1">{t.a}</p>
              <p className="text-xs text-muted-foreground mb-2">{t.c} active projects</p>
              <ProgressBar value={(t.c/48)*100} color="bg-blue-500" h="h-1.5"/>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
