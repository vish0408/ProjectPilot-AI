import { useState, useRef, useCallback, useEffect } from "react";
import {
  Brain, Send, Copy, Trash2, Clock, Gauge, Cpu, DollarSign,
  Loader2, Check, ChevronDown, Settings2, Sparkles,
} from "lucide-react";
import Card from "../../components/common/Card";
import { aiService } from "../../services/AIService";
import type {
  AIProviderInfo, AIUsage, AIChatHistoryEntry, AIStreamChunk,
} from "../../types/AI";
import { estimateCost } from "../../types/AI";

const LOCALSTORAGE_KEY = "ai-playground-history";

export default function AIPlayground() {
  const [providers, setProviders] = useState<AIProviderInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("OpenAI");
  const [model, setModel] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [prompt, setPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [streaming, setStreaming] = useState(true);
  const [output, setOutput] = useState("");
  const [usage, setUsage] = useState<AIUsage | null>(null);
  const [responseTimeMs, setResponseTimeMs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<AIChatHistoryEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) ?? "[]"); }
    catch { return []; }
  });
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    aiService.getProviders().then(setProviders).catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const currentProvider = providers.find(p => p.name === selectedProvider);
  const models: Record<string, string[]> = {
    OpenAI: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
    Anthropic: ["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"],
    Gemini: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"],
  };

  useEffect(() => {
    const m = models[selectedProvider];
    if (m && !m.includes(model)) setModel(m[0]);
  }, [selectedProvider]);

  const handleSend = useCallback(async () => {
    if (!prompt.trim()) return;
    setError("");
    setLoading(true);
    setOutput("");

    const startTime = performance.now();
    let accumulatedContent = "";
    let finalUsage: AIUsage | null = null;
    let finalMs = 0;

    if (streaming) {
      abortRef.current = new AbortController();
      try {
        for await (const chunk of aiService.streamChat(
          { messages: [{ role: "user", content: prompt }], systemPrompt: systemPrompt || undefined, options: { model, temperature, maxTokens } },
          selectedProvider,
          abortRef.current.signal,
        )) {
          accumulatedContent += chunk.content;
          setOutput(accumulatedContent);
          if (chunk.finishReason) break;
        }
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Stream failed");
      } finally {
        abortRef.current = null;
      }
      finalMs = Math.round(performance.now() - startTime);
      setResponseTimeMs(finalMs);
    } else {
      abortRef.current = new AbortController();
      try {
        const res = await aiService.sendChat(
          { messages: [{ role: "user", content: prompt }], systemPrompt: systemPrompt || undefined, options: { model, temperature, maxTokens } },
          selectedProvider,
        );
        accumulatedContent = res.content;
        finalUsage = res.usage;
        finalMs = res.responseTimeMs;
        setOutput(res.content);
        setUsage(res.usage);
        setResponseTimeMs(res.responseTimeMs);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Request failed");
      } finally {
        abortRef.current = null;
      }
    }

    if (accumulatedContent) {
      const entry: AIChatHistoryEntry = {
        id: crypto.randomUUID(),
        provider: selectedProvider,
        model,
        prompt,
        response: accumulatedContent,
        responseTimeMs: finalMs,
        usage: finalUsage,
        timestamp: Date.now(),
      };
      setHistory(prev => [entry, ...prev]);
    }

    setLoading(false);
  }, [prompt, systemPrompt, model, temperature, maxTokens, streaming, selectedProvider]);

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setOutput("");
    setUsage(null);
    setResponseTimeMs(0);
    setError("");
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(LOCALSTORAGE_KEY);
  };

  const cost = estimateCost(selectedProvider, usage);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI Playground</h2>
            <p className="text-xs text-muted-foreground">Test and experiment with AI providers</p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-xl border border-border hover:bg-muted/50 transition-colors"
        >
          <Settings2 className="w-4 h-4" />
          Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Provider</label>
                <select
                  value={selectedProvider}
                  onChange={e => setSelectedProvider(e.target.value)}
                  className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
                  disabled={loading}
                >
                  {providers.map(p => (
                    <option key={p.name} value={p.name} disabled={!p.isEnabled}>
                      {p.name} {!p.isEnabled ? "(not configured)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Model</label>
                <select
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
                  disabled={loading}
                >
                  {(models[selectedProvider] ?? []).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {showSettings && (
              <div className="mb-4 p-4 rounded-xl bg-muted/30 border border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                      System Prompt
                    </label>
                    <textarea
                      value={systemPrompt}
                      onChange={e => setSystemPrompt(e.target.value)}
                      placeholder="Optional system prompt..."
                      rows={2}
                      className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Temperature: {temperature.toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={temperature}
                        onChange={e => setTemperature(parseFloat(e.target.value))}
                        className="w-full accent-blue-600"
                        disabled={loading}
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                        <span>Precise</span>
                        <span>Creative</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Max Tokens
                      </label>
                      <input
                        type="number"
                        value={maxTokens}
                        onChange={e => setMaxTokens(Math.max(1, parseInt(e.target.value) || 1))}
                        min={1}
                        max={16384}
                        className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              rows={5}
              className="w-full bg-input-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary resize-none"
              disabled={loading}
              onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSend(); }}
            />

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={streaming}
                    onChange={e => setStreaming(e.target.checked)}
                    className="rounded border-border accent-blue-600"
                    disabled={loading}
                  />
                  <Sparkles className="w-3.5 h-3.5" />
                  Stream
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  disabled={loading && !output}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-muted/50 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {loading ? (
                  <button
                    onClick={handleStop}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!prompt.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-colors disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                )}
              </div>
            </div>
          </Card>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {(output || loading) && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold">Response</h3>
                {output && (
                  <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted/50 transition-colors">
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
              <div
                ref={outputRef}
                className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 rounded-xl p-4 min-h-[120px] whitespace-pre-wrap text-sm font-mono leading-relaxed"
              >
                {output || (loading && <span className="animate-pulse text-muted-foreground">Waiting for response...</span>)}
                {loading && streaming && <span className="inline-block w-2 h-4 bg-blue-600 ml-0.5 animate-pulse" />}
              </div>

              {(usage || responseTimeMs > 0) && (
                <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{responseTimeMs}ms</span>
                  </div>
                  {usage && (
                    <>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Gauge className="w-3.5 h-3.5" />
                        <span>{usage.promptTokens} prompt · {usage.completionTokens} completion</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>{usage.totalTokens} total</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-green-600 dark:text-green-400">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>${cost.toFixed(6)}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                History
              </h3>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-xs text-muted-foreground hover:text-red-500 transition-colors">
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto scrollbar-hide">
              {history.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">No history yet</p>
              )}
              {history.map(entry => (
                <div
                  key={entry.id}
                  className="p-2.5 rounded-xl bg-muted/30 border border-border hover:border-blue-300 cursor-pointer transition-colors"
                  onClick={() => {
                    setPrompt(entry.prompt);
                    setSelectedProvider(entry.provider);
                    setModel(entry.model);
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {entry.provider}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{entry.model}</span>
                  </div>
                  <p className="text-xs text-foreground line-clamp-2">{entry.prompt}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(entry.timestamp).toLocaleString()} · {entry.responseTimeMs}ms
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
