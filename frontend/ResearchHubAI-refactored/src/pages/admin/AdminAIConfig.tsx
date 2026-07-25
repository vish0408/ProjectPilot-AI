import { useState, useEffect } from "react";
import {
  Brain, Check, Cpu, Database, Zap, X as XIcon
} from "lucide-react";
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { adminService } from "../../services/AdminService";
import { aiService } from "../../services/AIService";
import type { AdminDashboardResponse } from "../../types/Admin";
import type { AIProviderInfo } from "../../types/AI";

export default function AdminAIConfig() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [providers, setProviders] = useState<AIProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getDashboard().catch(() => null),
      aiService.getProviders().catch(() => []),
    ]).then(([d, p]) => {
      setData(d);
      setProviders(p);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={`${data?.totalUsers || 0}`} icon={Brain} color="bg-blue-500"/>
        <StatCard label="Students" value={`${data?.totalStudents || 0}`} icon={Zap} color="bg-green-500"/>
        <StatCard label="Departments" value={`${data?.totalDepartments || 0}`} icon={Cpu} color="bg-indigo-500"/>
        <StatCard label="Colleges" value={`${data?.totalColleges || 0}`} icon={Database} color="bg-amber-500"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionHead title="AI Provider Status"/>
          <p className="text-sm text-muted-foreground mb-4">Configure API keys in appsettings.json → AI:Providers section on the server.</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {providers.length === 0 ? (
              <p className="text-xs text-muted-foreground col-span-2 text-center py-4">No AI providers configured</p>
            ) : providers.map(m => (
              <div key={m.name} className={`border-2 rounded-xl p-3.5 ${m.isEnabled ? "border-green-200 dark:border-green-800" : "border-border"}`}>
                <div className="flex items-center justify-between mb-1"><p className="font-bold text-sm text-foreground">{m.name}</p>
                  {m.isEnabled ? <Check className="w-4 h-4 text-green-500" /> : <XIcon className="w-4 h-4 text-red-400" />}
                </div>
                <p className="text-xs text-muted-foreground">{m.model || "No model configured"}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant={m.isEnabled ? "success" : "danger"}>{m.isEnabled ? "Enabled" : "Disabled"}</Badge>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">The system will auto-failover to the next enabled provider if one is unavailable.</p>
        </Card>
        <Card>
          <SectionHead title="System Activity"/>
          {data?.monthlyActivity?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                <XAxis dataKey="month" tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"12px",fontSize:12}}/>
                <Line type="monotone" dataKey="submissions" stroke="#2563EB" strokeWidth={2.5} dot={{r:4,fill:"#2563EB"}} name="Activity"/>
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No activity data yet</p>
          )}
        </Card>
      </div>
    </div>
  );
}
