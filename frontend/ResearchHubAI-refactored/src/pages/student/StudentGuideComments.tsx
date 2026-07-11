import { useState } from "react";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  MessageCircle
} from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";

export default function StudentGuideComments() {
  const [replyIdx, setReplyIdx] = useState<number|null>(null);
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Comments" value="24" icon={MessageCircle} color="bg-blue-500"/>
        <StatCard label="Unread" value="2" icon={Bell} color="bg-amber-500"/>
        <StatCard label="Resolved" value="19" icon={CheckCircle} color="bg-green-500"/>
        <StatCard label="Action Required" value="3" icon={AlertCircle} color="bg-red-500"/>
      </div>
      <Card>
        <SectionHead title="Guide Feedback" desc="Comments from Dr. Rajesh Mehta"/>
        {[
          {ch:"Chapter 3 — Methodology",t:"Please add detail about evaluation metrics in Section 3.4. Baseline comparison needs 2023+ papers. Consider adding a confusion matrix.",d:"July 5, 2025",u:true,a:"Pending Response"},
          {ch:"Chapter 4 — Implementation",t:"Dataset description is excellent. Add preprocessing pipeline as a flowchart. Augmentation strategy needs literature justification.",d:"July 1, 2025",u:true,a:"Pending Response"},
          {ch:"Chapter 2 — Literature Review",t:"Comprehensive and well-structured. Approved. Please proceed with Chapter 3 revisions.",d:"June 25, 2025",u:false,a:"Approved"},
          {ch:"Chapter 1 — Introduction",t:"Very well written. Research motivation is clear. Minor: fix citation [12] format. Approved.",d:"June 10, 2025",u:false,a:"Approved"},
        ].map((c,i)=>(
          <div key={i} className={`border-2 rounded-xl p-4 ${c.u?"border-blue-200 dark:border-blue-800":"border-border"} ${i>0?"mt-3":""}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3"><Avatar name="Rajesh Mehta"/><div><p className="font-bold text-sm text-foreground">Dr. Rajesh Mehta</p><p className="text-xs text-muted-foreground">{c.d}</p></div></div>
              <div className="flex items-center gap-2"><Badge variant="outline">{c.ch.split("—")[0].trim()}</Badge><Badge variant={c.a==="Approved"?"success":c.u?"warning":"outline"}>{c.a}</Badge>{c.u&&<span className="w-2.5 h-2.5 bg-blue-500 rounded-full"/>}</div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{c.t}</p>
            {replyIdx===i?(
              <div className="flex gap-2"><input className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Type reply..."/><button onClick={()=>setReplyIdx(null)} className="bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-xl">Send</button><button onClick={()=>setReplyIdx(null)} className="border border-border text-xs text-muted-foreground px-3 py-2 rounded-xl hover:bg-muted">Cancel</button></div>
            ):<button onClick={()=>setReplyIdx(i)} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5"/>Reply</button>}
          </div>
        ))}
      </Card>
    </div>
  );
}
