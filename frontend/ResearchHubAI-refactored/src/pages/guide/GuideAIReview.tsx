import { useState, useRef, useEffect } from "react";
import { Brain, Plus, Send } from "lucide-react";
import Avatar from "../../components/common/Avatar";
import Card from "../../components/common/Card";
import { aiService } from "../../services/AIService";
import type { Msg } from "../../types/Common";
export default function GuideAIReview() {
  const [msgs, setMsgs] = useState<Msg[]>([{role:"assistant",text:"Hello! I can help you review student submissions faster — summarize chapters, flag issues, check for plagiarism patterns, and generate feedback. Which student's chapter would you like me to analyze?",time:"10:00 AM"}]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const send = async () => {
    if(!input.trim()) return;
    const q = input;
    setMsgs(p=>[...p,{role:"user",text:q,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}]);
    setInput(""); setTyping(true); setError(null);
    try {
      const res = await aiService.sendChat({
        messages: [{ role: "user", content: q }],
        systemPrompt: "You are an expert academic thesis reviewer. Analyze student research proposals and thesis chapters. Provide constructive feedback covering: strengths, weaknesses, methodology, citations, writing quality, and specific improvement suggestions. Be thorough and specific.",
      });
      setMsgs(p=>[...p,{role:"assistant",text:res.content,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to get AI response";
      setError(msg);
      setMsgs(p=>[...p,{role:"assistant",text:`I'm sorry, I encountered an error: ${msg}. Please check your AI configuration in the Admin settings.`,time:""}]);
    } finally { setTyping(false); }
  };
  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[msgs,typing]);
  const fmt = (t:string) => t.split("\n").map((line,i)=>{
    if(line.startsWith("**")&&line.endsWith("**")) return <p key={i} className="font-bold text-foreground">{line.slice(2,-2)}</p>;
    if(line.match(/^\*\*.*?\*\*/)) return <p key={i}>{line.split(/(\*\*.*?\*\*)/).map((part,j)=>part.startsWith("**")?<strong key={j}>{part.slice(2,-2)}</strong>:part)}</p>;
    if(line.startsWith("- ")) return <p key={i} className="ml-3 text-sm">• {line.slice(2)}</p>;
    return line?<p key={i} className="text-sm leading-relaxed">{line}</p>:<br key={i}/>;
  });
  return (
    <div className="flex h-[calc(100vh-9rem)] gap-5">
      <div className="hidden xl:flex flex-col w-52 flex-shrink-0 gap-4">
        <Card><button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 mb-3"><Plus className="w-4 h-4"/>New Review</button>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Quick Actions</p>
          {["Analyze chapter quality","Check for plagiarism","Generate feedback","Summarize for committee","Suggest improvements"].map((p,i)=><button key={i} onClick={()=>setInput(p)} className="block w-full text-left text-xs px-2.5 py-2 rounded-lg text-muted-foreground hover:bg-muted">{p}</button>)}
        </Card>
      </div>
      <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center"><Brain className="w-5 h-5 text-white"/></div>
          <div><p className="font-bold text-sm text-foreground">AI Review Assistant</p><p className="text-xs text-muted-foreground">Specialized for academic thesis review</p></div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 scrollbar-hide">
          {msgs.map((m,i)=>(
            <div key={i} className={`flex gap-3 ${m.role==="user"?"flex-row-reverse":""}`}>
              {m.role==="assistant"?<div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0"><Brain className="w-4 h-4 text-white"/></div>:<Avatar name="Guide" size="sm"/>}
              <div className={`max-w-[78%] flex flex-col gap-1 ${m.role==="user"?"items-end":"items-start"}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm ${m.role==="user"?"bg-indigo-600 text-white rounded-tr-sm":"bg-muted text-foreground rounded-tl-sm"}`}>{fmt(m.text)}</div>
                <span className="text-xs text-muted-foreground">{m.time}</span>
              </div>
            </div>
          ))}
          {typing&&<div className="flex gap-3"><div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center"><Brain className="w-4 h-4 text-white"/></div><div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-1">{[0,1,2].map(j=><div key={j} className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay:`${j*0.15}s`}}/>)}</div></div>}
          <div ref={endRef}/>
        </div>
        {error&&<div className="px-4 py-2 bg-red-50 dark:bg-red-950 border-t border-red-200 dark:border-red-800"><p className="text-xs text-red-600 dark:text-red-400">{error}</p></div>}
        <div className="p-4 border-t border-border"><div className="flex gap-2"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Analyze chapter, generate feedback..." className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"/><button onClick={send} disabled={typing} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl"><Send className="w-4 h-4"/></button></div></div>
      </div>
    </div>
  );
}