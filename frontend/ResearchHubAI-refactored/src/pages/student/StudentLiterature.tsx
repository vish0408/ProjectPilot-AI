import { useState } from "react";
import {
  AlertCircle,
  Bookmark,
  Brain,
  Link,
  Search
} from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";

export default function StudentLiterature() {
  const [saved, setSaved] = useState<number[]>([0,2]);
  const PAPERS = [
    {t:"Transformer Architecture for Multi-Modal Learning",a:"Vaswani et al.",y:2023,c:1240,tags:["DL","NLP"]},
    {t:"Large Language Models Survey",a:"Zhao et al.",y:2023,c:890,tags:["LLM","Survey"]},
    {t:"Federated Learning in Healthcare",a:"McMahan et al.",y:2022,c:567,tags:["Privacy","ML"]},
    {t:"Graph Neural Networks Review",a:"Wu et al.",y:2022,c:432,tags:["GNN","DL"]},
    {t:"Diffusion Models in Computer Vision",a:"Ho et al.",y:2023,c:780,tags:["CV","GenAI"]},
  ];
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-white mb-3">Search Literature</h2>
        <div className="flex gap-3"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50"/><input className="w-full bg-white/15 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/50 outline-none focus:border-white/50 text-sm" placeholder="Search papers, authors…"/></div><button className="bg-white text-indigo-700 font-semibold px-5 py-2.5 rounded-xl text-sm">Search</button></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-3">
          {PAPERS.map((p,i)=>(
            <Card key={i}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1"><h4 className="font-bold text-sm text-foreground mb-1">{p.t}</h4><p className="text-xs text-muted-foreground mb-2">{p.a} · {p.y} · {p.c.toLocaleString()} citations</p><div className="flex gap-1.5 flex-wrap">{p.tags.map((t,j)=><Badge key={j} variant="outline">{t}</Badge>)}</div></div>
                <button onClick={()=>setSaved(s=>s.includes(i)?s.filter(x=>x!==i):[...s,i])} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${saved.includes(i)?"bg-amber-100 text-amber-600 dark:bg-amber-900/30":"hover:bg-muted text-muted-foreground"}`}><Bookmark className="w-4 h-4"/></button>
              </div>
              <div className="flex gap-4 mt-3 pt-3 border-t border-border/50">
                <button className="text-xs text-blue-600 font-medium flex items-center gap-1"><Brain className="w-3.5 h-3.5"/>AI Summary</button>
                <button className="text-xs text-muted-foreground flex items-center gap-1"><Link className="w-3.5 h-3.5"/>Cite (IEEE)</button>
              </div>
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <Card><SectionHead title="Saved Papers" action={<Badge variant="warning">{saved.length}</Badge>}/>{PAPERS.filter((_,i)=>saved.includes(i)).map((p,i)=><div key={i} className={`flex items-start gap-2 py-2 border-b border-border/50 last:border-0 ${i===0?"pt-0":""}`}><Bookmark className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5"/><div><p className="text-xs font-medium text-foreground leading-snug">{p.t}</p><p className="text-xs text-muted-foreground">{p.y}</p></div></div>)}</Card>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-4 text-white"><div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4"/><span className="font-semibold text-sm">AI Gap Analysis</span></div>{["No real-time edge inference studies","Limited multi-modal fusion","Rare disease datasets absent"].map((g,i)=><div key={i} className="flex items-start gap-2 text-xs text-blue-100 mt-2"><AlertCircle className="w-3.5 h-3.5 text-amber-300 flex-shrink-0 mt-0.5"/>{g}</div>)}</div>
        </div>
      </div>
    </div>
  );
}
