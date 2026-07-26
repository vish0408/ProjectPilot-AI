import {
  Bell,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun
} from "lucide-react";
import Avatar from "../components/common/Avatar";
import { useApp } from "../context/AppContext";
import { Role } from "../types/Role";
import { STUDENT_NAV } from "../utils/navigation";

export default function Topbar({ nav, onMenu }: { nav: typeof STUDENT_NAV; onMenu:()=>void }) {
  const { user, screen, setScreen, theme, setTheme, logout } = useApp();
  const label = nav.find(n=>n.id===screen)?.label || "Dashboard";
  const rc: Record<Role,string> = { student:"text-blue-600", guide:"text-indigo-600", collegeadmin:"text-slate-600", hod:"text-cyan-600", superadmin:"text-red-600" };
  const rl: Record<Role,string> = { student:"PhD Student", guide:"Research Guide", collegeadmin:"College Admin", hod:"HOD", superadmin:"Super Admin" };
  return (
    <header className="h-14 md:h-16 bg-card border-b border-border flex items-center justify-between px-3 sm:px-5 gap-2 md:gap-3 flex-shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1 md:flex-none">
        <button onClick={onMenu} className="lg:hidden w-9 h-9 rounded-xl hover:bg-muted flex items-center justify-center flex-shrink-0 transition-colors touch-target"><Menu className="w-5 h-5"/></button>
        <div className="min-w-0"><h1 className="text-sm font-bold text-foreground leading-none truncate">{label}</h1><p className={`text-[10px] md:text-xs font-semibold mt-0.5 truncate ${rc[user?.role||"student"]}`}>{rl[user?.role||"student"]}</p></div>
      </div>
      <div className="hidden md:block flex-1 max-w-xs mx-2 lg:mx-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"/><input className="w-full bg-muted border border-border rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" placeholder="Search..."/></div>
      </div>
      <div className="flex items-center gap-0.5 md:gap-1.5 flex-shrink-0">
        <button onClick={()=>setTheme(theme==="light"?"dark":"light")} className="w-9 h-9 rounded-xl hover:bg-muted flex items-center justify-center transition-colors touch-target">
          {theme==="dark"?<Sun className="w-4 h-4 text-muted-foreground"/>:<Moon className="w-4 h-4 text-muted-foreground"/>}
        </button>
        <button onClick={()=>setScreen("notifications")} className="relative w-9 h-9 rounded-xl hover:bg-muted flex items-center justify-center transition-colors touch-target">
          <Bell className="w-4 h-4 text-muted-foreground"/><span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"/>
        </button>
        <div className="hidden sm:block w-px h-6 bg-border mx-0.5 md:mx-1"/>
        <button onClick={()=>setScreen("profile")} className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-muted cursor-pointer transition-colors touch-target">
          <Avatar name={user?.name||"U"} size="sm"/>
          <div className="hidden sm:block max-w-[100px]"><p className="text-xs font-bold text-foreground leading-none truncate">{user?.name}</p><p className={`text-[10px] ${rc[user?.role||"student"]} leading-none mt-0.5 truncate`}>{rl[user?.role||"student"]}</p></div>
        </button>
        <button onClick={logout} className="w-9 h-9 rounded-xl hover:bg-muted flex items-center justify-center transition-colors touch-target" title="Sign Out"><LogOut className="w-4 h-4 text-muted-foreground"/></button>
      </div>
    </header>
  );
}
