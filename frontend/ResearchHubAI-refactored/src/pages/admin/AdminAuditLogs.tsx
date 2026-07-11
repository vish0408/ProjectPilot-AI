import { useState, useEffect } from "react";
import { Activity, Download, Filter, Server, ShieldCheck, Users } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import { adminService } from "../../services/AdminService";
import type { AuditLogResponse } from "../../types/Admin";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAuditLogs()
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const todayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString());

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Events" value={`${logs.length}`} icon={Activity} color="bg-blue-500"/>
        <StatCard label="Today" value={`${todayLogs.length}`} icon={ShieldCheck} color="bg-red-500"/>
        <StatCard label="Unique Users" value={`${new Set(logs.filter(l => l.userId).map(l => l.userId)).size}`} icon={Users} color="bg-green-500"/>
        <StatCard label="Entities" value={`${new Set(logs.map(l => l.entityName)).size}`} icon={Server} color="bg-indigo-500"/>
      </div>
      <Card p={false}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">Audit Log</h3>
          <div className="flex gap-2">
            <button className="text-xs border border-border rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />Filter
            </button>
            <button className="text-xs border border-border rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>{["Timestamp", "User", "Action", "Resource", "IP"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {logs.slice(0, 50).map((log) => (
                <tr key={log.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-xs font-semibold text-foreground">{log.userName}</td>
                  <td className="px-5 py-3">
                    <Badge variant={
                      log.action === "LOGIN_FAIL" ? "danger" :
                      log.action === "CREATE" ? "success" :
                      log.action === "DELETE" ? "danger" :
                      log.action === "UPDATE" ? "warning" : "outline"
                    }>{log.action}</Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{log.entityName}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!logs.length && <p className="text-sm text-muted-foreground text-center py-8">No audit logs found</p>}
        </div>
      </Card>
    </div>
  );
}
