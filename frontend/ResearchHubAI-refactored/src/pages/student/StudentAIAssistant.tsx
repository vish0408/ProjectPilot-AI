import { useState, useRef, useEffect } from "react";
import { Brain, Copy, Plus, RefreshCw, Send, Sparkles } from "lucide-react";
import { AIService } from "../../services/AIService";
import type { AIMessage } from "../../types/AI";

const aiService = new AIService();
const QUICK_PROMPTS = [
  "Generate research abstract", "Find research gaps", "Suggest objectives",
  "Write methodology section", "Fix grammar & style", "Generate IEEE citations",
];

export default function StudentAIAssistant() {
  const [msgs, setMsgs] = useState<{ role: string; text: string }[]>([
    { role: "assistant", text: "Hello! I'm your AI Research Assistant. How can I help with your research?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const q = input;
    setInput("");

    const userMsg = { role: "user" as const, text: q };
    setMsgs(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await aiService.sendChat({
        messages: [{ role: "user", content: q }],
      });
      setMsgs(prev => [...prev, { role: "assistant", text: response.content }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not reach AI service";
      setMsgs(prev => [...prev, { role: "assistant", text: `Error: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] gap-5">
      <div className="hidden xl:flex flex-col w-52 flex-shrink-0 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 mb-3"><Plus className="w-4 h-4"/>New Chat</button>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Quick Prompts</p>
          <div className="space-y-1">
            {QUICK_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => setInput(p)}
                className="block w-full text-left text-xs px-2.5 py-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 transition-colors">
                <Sparkles size={12} className="inline mr-1.5 text-indigo-400" />{p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900 dark:text-gray-100">AI Research Assistant</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />Online
            </p>
          </div>
          <div className="ml-auto flex gap-1">
            {[Copy, RefreshCw].map((Icon, i) => (
              <button key={i} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-gray-500" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {msgs.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${m.role === "assistant" ? "bg-gradient-to-br from-indigo-500 to-purple-600" : "bg-gray-200 dark:bg-gray-700"}`}>
                <Brain className={`w-4 h-4 ${m.role === "assistant" ? "text-white" : "text-gray-600 dark:text-gray-300"}`} />
              </div>
              <div className={`max-w-[78%] flex flex-col gap-1 ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm"}`}>
                  {m.text.split("\n").map((line, j) => (
                    line ? <p key={j}>{line}</p> : <br key={j} />
                  ))}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 flex items-center gap-1">
                {[0, 1, 2].map(j => (
                  <div key={j} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${j * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask about your research..."
              className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
            <button onClick={send} disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-xl transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
