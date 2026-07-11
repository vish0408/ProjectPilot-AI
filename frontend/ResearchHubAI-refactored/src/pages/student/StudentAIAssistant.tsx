import {
  useState,
  useRef,
  useEffect
} from "react";
import {
  Brain,
  Copy,
  Cpu,
  Mic,
  Plus,
  RefreshCw,
  Send
} from "lucide-react";
import Avatar from "../../components/common/Avatar";
import Card from "../../components/common/Card";
import { AI_PROMPTS } from "../../utils/mockData";
import { Msg } from "../../types/Common";
export default function StudentAIAssistant() {
  const [msgs, setMsgs] = useState<Msg[]>([{role:"assistant",text:"Hello! I can help you write abstracts, find literature gaps, generate citations, improve writing, and more. What would you like to work on?",time:"10:00 AM"}]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const send = () => {
    if(!input.trim()) return;
    const q = input;
    setMsgs(p=>[...p,{role:"user",text:q,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}]);
    setInput(""); setTyping(true);
    setTimeout(()=>{
      setTyping(false);
      setMsgs(p=>[...p,{role:"assistant",text:`**Response to:** "${q}"\n\nBased on your PhD research in Deep Learning for Medical Imaging:\n\n**Key Findings:**\n1. Current state-of-the-art achieves ~94% accuracy on APTOS benchmark\n2. Your attention-based architecture shows strong promise for interpretability\n3. Consider adding ablation studies to validate each model component\n\n**IEEE Citations:**\n[1] A. Vaswani et al., "Attention Is All You Need," NeurIPS, 2017.\n[2] M. Tan, Q. Le, "EfficientNet: Rethinking Model Scaling," ICML, 2019.\n\nWould you like me to generate a full section or expand on any point?`,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}]);
    },1800);
  };
  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[msgs,typing]);
  const fmt = (text:string) => text.split("\n").map((line,i)=>{
    if(line.startsWith("**")&&line.endsWith("**")) return <p key={i} className="font-bold text-foreground">{line.slice(2,-2)}</p>;
    if(line.match(/^\*\*.*?\*\*/)) return <p key={i}>{line.split(/(\*\*.*?\*\*)/).map((part,j)=>part.startsWith("**")?<strong key={j}>{part.slice(2,-2)}</strong>:part)}</p>;
    if(line.match(/^\d\./)||line.startsWith("- ")) return <p key={i} className="ml-3 text-sm">{line}</p>;
    return line?<p key={i} className="text-sm leading-relaxed">{line}</p>:<br key={i}/>;
  });
  return (
    <div className="flex h-[calc(100vh-9rem)] gap-5">
      <div className="hidden xl:flex flex-col w-52 flex-shrink-0 gap-4">
        <Card>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 mb-3"><Plus className="w-4 h-4"/>New Chat</button>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Quick Prompts</p>
          {AI_PROMPTS.map((p,i)=><button key={i} onClick={()=>setInput(p)} className="block w-full text-left text-xs px-2.5 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">{p}</button>)}
        </Card>
        <Card><p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Model</p><div className="bg-muted rounded-xl p-2.5"><div className="flex items-center gap-2 text-xs font-semibold text-foreground"><Cpu className="w-3.5 h-3.5 text-blue-500"/>GPT-4 Turbo</div><p className="text-xs text-muted-foreground mt-0.5">Research-optimized</p></div></Card>
      </div>
      <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"><Brain className="w-5 h-5 text-white"/></div>
          <div><p className="font-bold text-sm text-foreground">AI Research Assistant</p><p className="text-xs text-muted-foreground flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"/>Online · GPT-4 Turbo</p></div>
          <div className="ml-auto flex gap-1">{[Copy,RefreshCw].map((Icon,i)=><button key={i} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><Icon className="w-3.5 h-3.5 text-muted-foreground"/></button>)}</div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 scrollbar-hide">
          {msgs.map((m,i)=>(
            <div key={i} className={`flex gap-3 ${m.role==="user"?"flex-row-reverse":""}`}>
              {m.role==="assistant"?<div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0"><Brain className="w-4 h-4 text-white"/></div>:<Avatar name="Priya Sharma" size="sm"/>}
              <div className={`max-w-[78%] flex flex-col gap-1 ${m.role==="user"?"items-end":"items-start"}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm ${m.role==="user"?"bg-blue-600 text-white rounded-tr-sm":"bg-muted text-foreground rounded-tl-sm"}`}>{fmt(m.text)}</div>
                <span className="text-xs text-muted-foreground">{m.time}</span>
              </div>
            </div>
          ))}
          {typing&&<div className="flex gap-3"><div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"><Brain className="w-4 h-4 text-white"/></div><div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-1">{[0,1,2].map(j=><div key={j} className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay:`${j*0.15}s`}}/>)}</div></div>}
          <div ref={endRef}/>
        </div>
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about your research..." className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm pr-10 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"/>
              <button className="absolute right-3 top-1/2 -translate-y-1/2"><Mic className="w-4 h-4 text-muted-foreground"/></button>
            </div>
            <button onClick={send} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl"><Send className="w-4 h-4"/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
