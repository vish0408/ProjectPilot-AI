import { useState, useEffect } from "react";
import { Shield, Download, Trash2, Plus, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import { adminService } from "../../services/AdminService";
import type { BackupRecordResponse } from "../../types/Admin";

export default function AdminBackupRestore() {
  const [backups, setBackups] = useState<BackupRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBackups = () => {
    adminService.getBackupHistory()
      .then(setBackups)
      .catch((e) => { if (e instanceof Error) setError(e.message); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBackups(); }, []);

  const handleCreateBackup = async () => {
    setCreating(true);
    setError(null);
    try {
      await adminService.createBackup();
      await fetchBackups();
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBackup = async (id: string) => {
    if (!window.confirm("Delete this backup permanently?")) return;
    try {
      await adminService.deleteBackup(id);
      setBackups(backups.filter((b) => b.id !== id));
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    }
  };

  const statusColors: Record<string, string> = {
    Completed: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    Failed: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    InProgress: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    Pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  };

  const latestCompleted = backups.filter((b) => b.status === "Completed");
  const totalSize = latestCompleted.reduce((sum, b) => sum + b.fileSizeBytes, 0);
  const totalSizeDisplay = totalSize >= 1073741824
    ? `${(totalSize / 1073741824).toFixed(1)} GB`
    : totalSize >= 1048576
      ? `${(totalSize / 1048576).toFixed(1)} MB`
      : `${(totalSize / 1024).toFixed(1)} KB`;

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Backups" value={`${backups.length}`} icon={Shield} color="bg-blue-500" />
        <StatCard label="Completed" value={`${latestCompleted.length}`} icon={CheckCircle} color="bg-green-500" />
        <StatCard label="Failed" value={`${backups.filter((b) => b.status === "Failed").length}`} icon={XCircle} color="bg-red-500" />
        <StatCard label="Total Size" value={totalSizeDisplay || "0 B"} icon={Download} color="bg-indigo-500" />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <SectionHead title="Backup History" />
          <button onClick={handleCreateBackup} disabled={creating}
            className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-xl transition-colors">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {creating ? "Creating..." : "Create Backup"}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold text-foreground">No backups yet</p>
            <p className="text-xs mt-1">Click "Create Backup" to create your first database backup</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-semibold text-muted-foreground text-xs">File Name</th>
                  <th className="text-left py-3 px-2 font-semibold text-muted-foreground text-xs">Size</th>
                  <th className="text-left py-3 px-2 font-semibold text-muted-foreground text-xs">Status</th>
                  <th className="text-left py-3 px-2 font-semibold text-muted-foreground text-xs">Created By</th>
                  <th className="text-left py-3 px-2 font-semibold text-muted-foreground text-xs">Date</th>
                  <th className="text-right py-3 px-2 font-semibold text-muted-foreground text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b) => (
                  <tr key={b.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2 text-xs font-medium text-foreground">{b.fileName}</td>
                    <td className="py-3 px-2 text-xs text-muted-foreground">{b.fileSizeDisplay}</td>
                    <td className="py-3 px-2">
                      <Badge className={statusColors[b.status] || ""}>{b.status}</Badge>
                    </td>
                    <td className="py-3 px-2 text-xs text-muted-foreground">{b.createdByUserName}</td>
                    <td className="py-3 px-2 text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {b.status === "Completed" && (
                          <button className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-muted-foreground hover:text-blue-600 transition-colors"
                            title="Download">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => handleDeleteBackup(b.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-colors"
                          title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
