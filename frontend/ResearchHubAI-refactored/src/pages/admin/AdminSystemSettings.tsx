import { useState, useEffect } from "react";
import { Moon, Sun, Save } from "lucide-react";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { useApp } from "../../context/AppContext";
import { adminService } from "../../services/AdminService";
import type { SystemSettingResponse } from "../../types/Admin";

export default function AdminSystemSettings() {
  const { theme, setTheme } = useApp();
  const [settings, setSettings] = useState<SystemSettingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getSettings()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const grouped = settings.reduce<Record<string, SystemSettingResponse[]>>((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {Object.entries(grouped).map(([group, items]) => (
          <Card key={group}>
            <SectionHead title={group} desc="Configure system settings" />
            <div className="flex flex-col gap-4 mt-2">
              {items.map((s) => (
                <div key={s.id}>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    {s.description || s.key}
                  </label>
                  <input
                    defaultValue={s.value}
                    className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary text-foreground"
                    placeholder={s.key}
                  />
                </div>
              ))}
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Settings
              </button>
            </div>
          </Card>
        ))}
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
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Save Settings
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
