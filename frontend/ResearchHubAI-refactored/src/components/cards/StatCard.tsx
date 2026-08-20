import {
  TrendingUp
} from "lucide-react";

export default function StatCard({ label, value, change, sub, icon: Icon, color, trend }: { label:string; value:string; change?:string; sub?:string; icon:any; color:string; trend?:"up"|"down" }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}><Icon className="w-5 h-5 text-white"/></div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
        {change && <p className={`text-xs mt-1 flex items-center gap-1 ${trend==="down"?"text-red-600":"text-green-600 dark:text-green-400"}`}><TrendingUp className={`w-3 h-3 ${trend==="down"?"rotate-180":""}`}/>{change}</p>}
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
