import { useState } from "react";
import {
  Moon,
  Sun
} from "lucide-react";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { useApp } from "../../context/AppContext";

import { Role } from "../../types/Role";
export default function SettingsShared({ role }: { role:Role }) {
  const { theme, setTheme } = useApp();
  const [tab, setTab] = useState("appearance");
  return (
    <div className="flex gap-6">
      <div className="w-44 flex-shrink-0"><Card>
        {["appearance","notifications","security"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${tab===t?"bg-blue-50 dark:bg-blue-950/50 text-blue-600":"text-muted-foreground hover:bg-muted"}`}>{t}</button>
        ))}
      </Card></div>
      <div className="flex-1">
        {tab==="appearance"&&<Card>
          <SectionHead title="Appearance"/>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-semibold text-foreground">Theme</p><p className="text-xs text-muted-foreground">Light or dark interface</p></div>
            <div className="flex gap-2">{(["light","dark"] as const).map(t=>(
              <button key={t} onClick={()=>setTheme(t)} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border rounded-xl transition-all ${theme===t?"bg-blue-600 text-white border-blue-600":"border-border text-muted-foreground hover:bg-muted"}`}>
                {t==="light"?<Sun className="w-3.5 h-3.5"/>:<Moon className="w-3.5 h-3.5"/>}{t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}</div>
          </div>
        </Card>}
        {tab==="security"&&<Card><SectionHead title="Security & Password"/>
          <div className="flex flex-col gap-4">
            {["Current Password","New Password","Confirm New Password"].map((l,i)=>(
              <div key={i}><label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">{l}</label><input type="password" className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-all" placeholder="••••••••"/></div>
            ))}
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors">Update Password</button>
          </div>
        </Card>}
        {tab==="notifications"&&<Card><SectionHead title="Notification Preferences"/>
          {[{l:"Email Notifications",d:"Receive updates via email",v:true},{l:"In-App Alerts",d:"Browser notifications",v:true},{l:"SMS Alerts",d:"Important alerts via SMS",v:false},{l:"Meeting Reminders",d:"30 min before meetings",v:true}].map((p,i)=>(
            <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div><p className="text-sm font-semibold text-foreground">{p.l}</p><p className="text-xs text-muted-foreground">{p.d}</p></div>
              <div className={`w-10 h-5 rounded-full relative cursor-pointer ${p.v?"bg-blue-600":"bg-muted"}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm ${p.v?"right-0.5":"left-0.5"}`}/></div>
            </div>
          ))}
        </Card>}
      </div>
    </div>
  );
}
