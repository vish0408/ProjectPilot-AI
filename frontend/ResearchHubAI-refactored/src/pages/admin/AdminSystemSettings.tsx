import { useState, useEffect } from "react";
import { Moon, Sun, Save, Loader2, Check } from "lucide-react";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { useApp } from "../../context/AppContext";
import { adminService } from "../../services/AdminService";
import type { SystemSettingResponse } from "../../types/Admin";

export default function AdminSystemSettings() {
  const { theme, setTheme } = useApp();
  const [settings, setSettings] = useState<SystemSettingResponse[]>([]);
  const [dirtyValues, setDirtyValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService.getSettings()
      .then(setSettings)
      .catch(() => setError("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (id: string) => {
    const value = dirtyValues[id];
    if (value === undefined) return;
    setSaving(id);
    setError("");
    try {
      await adminService.updateSetting(id, { value, description: "", isActive: true });
      setSaved(id);
      setTimeout(() => setSaved(null), 2000);
    } catch {
      setError("Failed to save setting");
    } finally {
      setSaving(null);
    }
  };

  const grouped = settings.reduce<Record<string, SystemSettingResponse[]>>((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {Object.entries(grouped).length === 0 ? (
          <Card>
            <p className="text-sm text-muted-foreground text-center py-8">No system settings available.</p>
          </Card>
        ) : (
          Object.entries(grouped).map(([group, items]) => (
            <Card key={group}>
              <SectionHead title={group} desc="Configure system settings" />
              <div className="flex flex-col gap-4 mt-2">
                {items.map((s) => (
                  <div key={s.id}>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                      {s.description || s.key}
                    </label>
                    <div className="flex gap-2">
                      <input
                        defaultValue={s.value}
                        onChange={e => setDirtyValues(prev => ({ ...prev, [s.id]: e.target.value }))}
                        className="flex-1 bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary text-foreground"
                        placeholder={s.key}
                      />
                      <button
                        onClick={() => handleSave(s.id)}
                        disabled={saving === s.id || !dirtyValues[s.id]}
                        className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl flex items-center gap-1.5 text-sm font-semibold transition-colors"
                      >
                        {saving === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : saved === s.id ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
        <Card>
          <SectionHead title="Platform Settings" />
          <div className="flex flex-col gap-4 mt-2">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Theme</label>
              <div className="flex gap-2">
                {(["light", "dark"] as const).map(t => (
                  <button key={t} onClick={() => setTheme(t)}
                    className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold border rounded-xl transition-all ${
                      theme === t
                        ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/30"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}>
                    {t === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
