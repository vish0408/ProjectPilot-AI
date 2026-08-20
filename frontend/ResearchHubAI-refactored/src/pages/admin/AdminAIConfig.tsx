import { useState, useEffect } from "react";
import { Brain, Check, Cpu, Database, Loader2, X } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { adminService } from "../../services/AdminService";
import { aiService } from "../../services/AIService";
import type { AIProviderInfo } from "../../types/AI";
import type { SystemSettingResponse } from "../../types/Admin";

export default function AdminAIConfig() {
  const [providers, setProviders] = useState<AIProviderInfo[]>([]);
  const [settings, setSettings] = useState<SystemSettingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([
        aiService.getProviders().catch(() => [] as AIProviderInfo[]),
        adminService.getSettings().catch(() => [] as SystemSettingResponse[]),
      ]);
      setProviders(p ?? []);
      setSettings(s ?? []);
    } catch { /* handled per-call */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const aiSettings = settings.filter(s => /ai|model|openai|anthropic|gemini|deepseek|llm|token/i.test(s.key));

  const handleUpdate = async (s: SystemSettingResponse, value: string) => {
    setSavingId(s.id);
    try {
      await adminService.updateSetting(s.id, { value, description: s.description, isActive: s.isActive });
      setSettings(prev => prev.map(i => i.id === s.id ? { ...i, value } : i));
      setSuccess("Setting updated.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) { if (e instanceof Error) setError(e.message); }
    finally { setSavingId(null); }
  };

  const enabled = providers.filter(p => p.isEnabled).length;

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-center justify-between">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          <button onClick={() => setError(null)}><X className="w-4 h-4 text-red-500" /></button>
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 flex items-center justify-between">
          <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><p className="text-xs text-green-700 dark:text-green-300">{success}</p></div>
          <button onClick={() => setSuccess(null)}><X className="w-4 h-4 text-green-500" /></button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Models Configured" value={`${providers.length}`} icon={Cpu} color="bg-blue-500" />
        <StatCard label="Enabled" value={`${enabled}`} icon={Check} color="bg-green-500" />
        <StatCard label="AI Settings" value={`${aiSettings.length}`} icon={Database} color="bg-indigo-500" />
        <StatCard label="Default Model" value={providers.find(p => p.isEnabled)?.model || "—"} icon={Brain} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionHead title="Configured AI Providers" desc="Enabled providers from the server configuration" />
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading providers...
            </div>
          ) : providers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No AI providers configured on this deployment.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {providers.map((p) => (
                <div key={p.name} className={`border-2 rounded-xl p-3.5 ${p.isEnabled ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-border"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-sm text-foreground">{p.name}</p>
                    {p.isEnabled && <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">{p.model || "default model"}</p>
                  <div className="mt-2">
                    <Badge variant={p.isEnabled ? "success" : "danger"}>{p.isEnabled ? "Enabled" : "Not Enabled"}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionHead title="AI System Settings" desc="Configuration keys managed via System Settings" />
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading settings...
            </div>
          ) : aiSettings.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Brain className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground max-w-xs">
                No AI-related configuration keys are present in System Settings. Add settings such as <span className="font-mono">OpenAI.ApiKey</span> or <span className="font-mono">AI.DefaultModel</span>.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {aiSettings.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground font-mono truncate">{s.key}</p>
                    <p className="text-[10px] text-muted-foreground">{s.description}</p>
                  </div>
                  <input
                    defaultValue={s.value}
                    className="flex-1 bg-input-background border border-border rounded-xl px-3 py-2 text-sm font-mono outline-none focus:border-primary"
                    onKeyDown={(e) => e.key === "Enter" && handleUpdate(s, (e.target as HTMLInputElement).value)}
                    onBlur={(e) => { if (e.target.value !== s.value) handleUpdate(s, e.target.value); }}
                    placeholder="value"
                    aria-label={s.key}
                  />
                  {savingId === s.id && <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />}
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground mt-1">Press Enter or blur to save a changed value.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
