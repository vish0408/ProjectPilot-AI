import {
  TrendingUp
} from "lucide-react";

export default function StatCard({ label, value, change, sub, icon: Icon, color, trend }: { label:string; value:string; change?:string; sub?:string; icon:any; color:string; trend?:"up"|"down" }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4 hover:shadow-md transition-shadow h-full">
      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}><Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white"/></div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-0.5 sm:mb-1 truncate">{label}</p>
        <p className="text-xl sm:text-2xl font-bold text-foreground leading-none truncate">{value}</p>
        {change && <p className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 flex items-center gap-1 ${trend==="down"?"text-red-600":"text-green-600 dark:text-green-400"}`}><TrendingUp className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${trend==="down"?"rotate-180":""}`}/>{change}</p>}
        {sub && <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}
