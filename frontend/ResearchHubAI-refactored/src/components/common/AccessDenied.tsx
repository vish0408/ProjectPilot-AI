import {
  LayoutDashboard,
  Mail,
  Shield
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function AccessDenied({ page }: { page:string }) {
  const { setScreen } = useApp();
  return (
    <div className="flex-1 flex items-center justify-center p-8 min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-950/40 rounded-3xl flex items-center justify-center mx-auto mb-5"><Shield className="w-10 h-10 text-red-500"/></div>
        <div className="text-5xl font-black text-red-500 mb-3">403</div>
        <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-sm text-muted-foreground mb-1">You do not have permission to access <strong className="text-foreground">"{page}"</strong>.</p>
        <p className="text-sm text-muted-foreground mb-7">This area is restricted based on your role. Contact your administrator if you believe this is an error.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={()=>setScreen("dashboard")} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"><LayoutDashboard className="w-4 h-4"/>Back to Dashboard</button>
          <button className="border border-border text-muted-foreground text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-muted transition-colors flex items-center gap-2"><Mail className="w-4 h-4"/>Contact Admin</button>
        </div>
      </div>
    </div>
  );
}
