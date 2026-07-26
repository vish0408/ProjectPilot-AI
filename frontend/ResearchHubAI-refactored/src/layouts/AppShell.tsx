import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AdminLayout from "./AdminLayout";
import GuideLayout from "./GuideLayout";
import HodLayout from "./HodLayout";
import StudentLayout from "./StudentLayout";
import { CurrentUser } from "../types/User";
import { SUPER_ADMIN_NAV, COLLEGE_ADMIN_NAV, GUIDE_NAV, HOD_NAV, STUDENT_NAV } from "../utils/navigation";

export default function AppShell({ user }: { user:CurrentUser }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = user.role==="student" ? STUDENT_NAV : user.role==="guide" ? GUIDE_NAV : user.role==="hod" ? HOD_NAV : user.role==="superadmin" ? SUPER_ADMIN_NAV : user.role==="collegeadmin" ? COLLEGE_ADMIN_NAV : COLLEGE_ADMIN_NAV;

  return (
    <div className="flex h-screen overflow-hidden bg-background w-full">
      {mobileOpen&&(
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={()=>setMobileOpen(false)}/>
          <div className="relative z-10 h-full w-[280px] animate-in slide-in-from-left duration-300">
            <Sidebar nav={nav} collapsed={false} setCollapsed={()=>{}}/>
          </div>
        </div>
      )}
      <div className="hidden lg:flex h-full flex-shrink-0"><Sidebar nav={nav} collapsed={collapsed} setCollapsed={setCollapsed}/></div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
        <Topbar nav={nav} onMenu={()=>setMobileOpen(true)}/>
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 scrollbar-thin">
          {user.role==="student" ? <StudentLayout/> : user.role==="guide" ? <GuideLayout/> : user.role==="hod" ? <HodLayout/> : user.role==="superadmin" ? <AdminLayout/> : user.role==="collegeadmin" ? <AdminLayout/> : <AdminLayout/>}
        </main>
      </div>
      <style>{`body{font-family:'Inter',system-ui,sans-serif;overflow:hidden;margin:0;width:100%;}`}</style>
    </div>
  );
}
