import { useState, useEffect } from "react";
import { ArchiveRestore, Clock, Database, HardDrive, Info, Loader2, RefreshCw, Wrench } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { adminService } from "../../services/AdminService";
import type { SystemSettingResponse } from "../../types/Admin";

export default function AdminBackupRestore() {
  const [settings, setSettings] = useState<SystemSettingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getSettings()
      .then((s) => setSettings(s ?? []))
      .catch(() => setSettings([]))
      .finally(() => setLoading(false));
  }, []);

  const backupSettings = settings.filter(s => /backup|retention|storage/i.test(s.key));
  const configured = backupSettings.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Last Backup" value="—" sub="No backup system configured" icon={HardDrive} color="bg-green-500" />
        <StatCard label="Backup Size" value="—" icon={Database} color="bg-blue-500" />
        <StatCard label="Retention" value={backupSettings.find(s => /retention/i.test(s.key))?.value || "—"} icon={Clock} color="bg-indigo-500" />
        <StatCard label="Next Scheduled" value="—" sub="Not scheduled" icon={RefreshCw} color="bg-amber-500" />
      </div>

      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-700 dark:text-blue-300">Backup &amp; Restore service is not configured on this deployment</p>
          <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
            No backup endpoints or history are available from the API. Configure a backup provider and retention policy before the manual backup
            controls can be enabled. No backup records will be shown until the service is available.
          </p>
        </div>
      </div>

      <Card>
        <SectionHead title="Backup Configuration" desc="System settings related to backup & retention" />
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Checking configuration...
          </div>
        ) : configured ? (
          <div className="flex flex-col gap-2">
            {backupSettings.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 border border-border rounded-xl">
                <div>
                  <p className="text-xs font-bold text-foreground font-mono">{s.key}</p>
                  <p className="text-[11px] text-muted-foreground">{s.description}</p>
                </div>
                <span className="text-xs font-mono text-muted-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Wrench className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground max-w-md">
              No backup-related system settings were found. Add backup settings (e.g. <span className="font-mono">Backup.RetentionDays</span>)
              from the System Settings page to track the backup policy here.
            </p>
          </div>
        )}
      </Card>

      <Card>
        <SectionHead title="Backup History" desc="No backup records available" />
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <ArchiveRestore className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            There are no backup records to display. This section will populate once a backup service is configured on the server.
          </p>
        </div>
      </Card>
    </div>
  );
}