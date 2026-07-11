import {
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";

export default function StudentMeetings() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Upcoming" value="3" icon={Calendar} color="bg-blue-500"/>
        <StatCard label="This Month" value="8" icon={Activity} color="bg-indigo-500"/>
        <StatCard label="Pending Requests" value="1" icon={Clock} color="bg-amber-500"/>
        <StatCard label="Completed" value="24" icon={CheckCircle} color="bg-green-500"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionHead title="Request a Meeting"/>
          <div className="flex flex-col gap-3">
            <div><label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Meeting With</label><select className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"><option>Dr. Rajesh Mehta (Guide)</option><option>PhD Committee</option></select></div>
            <div><label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Subject</label><input className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary" placeholder="Chapter 3 Discussion"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Date</label><input type="date" className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"/></div>
              <div><label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Time</label><input type="time" className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"/></div>
            </div>
            <div><label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Agenda</label><textarea className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary resize-none" rows={3} placeholder="Brief agenda…"/></div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl">Request Meeting</button>
          </div>
        </Card>
        <Card>
          <SectionHead title="Upcoming Meetings"/>
          {[{w:"Dr. Rajesh Mehta",s:"Chapter 3 Review",d:"July 9, 2025",t:"10:00 AM",type:"Video"},{w:"PhD Committee",s:"Milestone Review",d:"July 15, 2025",t:"2:00 PM",type:"In-Person"},{w:"Dr. Priya Singh",s:"Co-guide Consultation",d:"July 22, 2025",t:"11:30 AM",type:"Video"}].map((m,i)=>(
            <div key={i} className={`border border-border rounded-xl p-4 ${i>0?"mt-3":""}`}>
              <div className="flex items-start justify-between mb-2"><div><p className="text-sm font-bold text-foreground">{m.s}</p><p className="text-xs text-muted-foreground">with {m.w}</p></div><Badge variant={m.type==="Video"?"info":"outline"}>{m.type}</Badge></div>
              <p className="text-xs text-muted-foreground mb-3">{m.d} · {m.t}</p>
              <div className="flex gap-2">
                {m.type==="Video"&&<button className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1"><Zap className="w-3 h-3"/>Join</button>}
                <button className="border border-border text-xs font-medium text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-muted">Notes</button>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
