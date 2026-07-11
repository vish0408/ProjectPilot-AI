import {
  Brain,
  Check,
  Cpu,
  Database,
  Zap
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import ProgressBar from "../../components/common/ProgressBar";
import SectionHead from "../../components/common/SectionHead";
import { MONTHLY_DATA } from "../../utils/mockData";
export default function AdminAIConfig() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="AI Queries (Month)" value="4,820" change="+34%" icon={Brain} color="bg-blue-500" trend="up"/>
        <StatCard label="Avg Response" value="1.2s" icon={Zap} color="bg-green-500"/>
        <StatCard label="Models Active" value="2" icon={Cpu} color="bg-indigo-500"/>
        <StatCard label="Token Usage" value="2.4M" sub="Budget: 5M" icon={Database} color="bg-amber-500"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionHead title="AI Model Configuration"/>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[{name:"GPT-4 Turbo",provider:"OpenAI",tag:"Primary",active:true,cost:"$0.03/1K"},{name:"Claude 3.5 Sonnet",provider:"Anthropic",tag:"Secondary",active:true,cost:"$0.015/1K"},{name:"Gemini Pro",provider:"Google",tag:"Experimental",active:false,cost:"$0.001/1K"},{name:"DeepSeek R1",provider:"DeepSeek",tag:"Research",active:false,cost:"$0.002/1K"}].map((m,i)=>(
              <div key={i} className={`border-2 rounded-xl p-3.5 cursor-pointer transition-all ${m.active?"border-blue-500 bg-blue-50 dark:bg-blue-950/20":"border-border hover:border-blue-300"}`}>
                <div className="flex items-center justify-between mb-1"><p className="font-bold text-sm text-foreground">{m.name}</p>{m.active&&<div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white"/></div>}</div>
                <p className="text-xs text-muted-foreground">{m.provider}</p>
                <div className="flex items-center justify-between mt-2"><Badge variant={m.tag==="Primary"?"default":"info"}>{m.tag}</Badge><span className="text-xs font-semibold text-muted-foreground">{m.cost}</span></div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <div><label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">OpenAI API Key</label><div className="flex gap-2"><input type="password" defaultValue="sk-••••••••••••••••" className="flex-1 bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm font-mono outline-none focus:border-primary"/><button className="border border-border rounded-xl px-3 text-sm text-muted-foreground hover:bg-muted">Show</button></div></div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl">Save AI Configuration</button>
          </div>
        </Card>
        <Card>
          <SectionHead title="AI Usage Analytics"/>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MONTHLY_DATA}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/><XAxis dataKey="month" tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"12px",fontSize:12}}/><Line type="monotone" dataKey="students" stroke="#2563EB" strokeWidth={2.5} dot={{r:4,fill:"#2563EB"}} name="Queries"/></LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">Token Budget</p>
            <ProgressBar value={48} color="bg-blue-600"/>
            <p className="text-xs text-muted-foreground mt-1.5">2.4M / 5M tokens used (48%)</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
