import {
  Download,
  Eye,
  History
} from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { CHAPTERS } from "../../utils/mockData";

export default function StudentChapterVersions() {
  return (
    <div className="flex flex-col gap-5">
      <Card>
        <SectionHead title="Version History" desc="All chapter versions" action={<Badge variant="default">23 versions</Badge>}/>
        {CHAPTERS.map((c,i)=>(
          <div key={i} className={`border border-border rounded-xl overflow-hidden ${i>0?"mt-3":""}`}>
            <div className="flex items-center justify-between px-4 py-3 bg-muted/40">
              <div className="flex items-center gap-3"><div className="w-7 h-7 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-xs font-bold text-red-600">PDF</div><span className="text-sm font-bold text-foreground">{c.ch}</span></div>
              <div className="flex items-center gap-2"><Badge variant="outline">{c.version}</Badge><Badge variant={c.status==="approved"?"success":c.status==="review"?"warning":c.status==="draft"?"default":"outline"}>{c.status}</Badge></div>
            </div>
            {c.date!=="—"&&<div className="px-4 py-2.5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{c.date} · {c.size}</span>
              <div className="flex gap-1">{[Eye,Download,History].map((Icon,j)=><button key={j} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center"><Icon className="w-3.5 h-3.5 text-muted-foreground"/></button>)}</div>
            </div>}
          </div>
        ))}
      </Card>
    </div>
  );
}
