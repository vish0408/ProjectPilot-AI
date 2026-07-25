import { useState, useEffect } from "react";
import { Clock, FileText, Sparkles, TrendingUp } from "lucide-react";
import { Bar, BarChart as RechartsBar, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import StatCard from "../../components/cards/StatCard";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { adminService } from "../../services/AdminService";
import type { AdminDashboardResponse } from "../../types/Admin";



export default function AdminAnalytics() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminService.getDashboard()
      .then(setData)
      .catch((e) => { if (e instanceof Error) setError(e.message); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 mb-4">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={`${data?.totalUsers || 0}`} icon={TrendingUp} color="bg-green-500"/>
        <StatCard label="Students" value={`${data?.totalStudents || 0}`} icon={Clock} color="bg-blue-500"/>
        <StatCard label="Departments" value={`${data?.totalDepartments || 0}`} icon={FileText} color="bg-indigo-500"/>
        <StatCard label="Colleges" value={`${data?.totalColleges || 0}`} icon={Sparkles} color="bg-cyan-500"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionHead title="Monthly Activity"/>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data?.monthlyActivity ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="month" tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"12px",fontSize:12}}/>
              <Legend/>
              <Line type="monotone" dataKey="submissions" stroke="#2563EB" strokeWidth={2.5} dot={{r:3}} name="Submissions"/>
              <Line type="monotone" dataKey="approvals" stroke="#22C55E" strokeWidth={2.5} dot={{r:3}} name="Approvals"/>
              <Line type="monotone" dataKey="meetings" stroke="#F59E0B" strokeWidth={2.5} dot={{r:3}} name="Meetings"/>
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionHead title="Department Performance"/>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsBar data={data?.departmentStats ?? []} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="name" tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"12px",fontSize:12}}/>
              <Legend/>
              <Bar dataKey="students" fill="#2563EB" radius={[5,5,0,0]} name="Enrolled"/>
              <Bar dataKey="completed" fill="#22C55E" radius={[5,5,0,0]} name="Completed"/>
            </RechartsBar>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
