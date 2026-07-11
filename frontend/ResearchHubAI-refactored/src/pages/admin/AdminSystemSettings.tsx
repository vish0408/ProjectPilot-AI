import {
  Moon,
  Sun
} from "lucide-react";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { useApp } from "../../context/AppContext";
export default function AdminSystemSettings() {
  const { theme, setTheme } = useApp();
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionHead title="University Configuration"/>
          <div className="flex flex-col gap-4">
            {[{l:"University Name",v:"Indian Institute of Technology Bombay"},{l:"Domain",v:"iitb.ac.in"},{l:"Admin Email",v:"admin@iitb.ac.in"}].map((f,i)=>(
              <div key={i}><label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">{f.l}</label><input defaultValue={f.v} className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary text-foreground"/></div>
            ))}
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl">Save Settings</button>
          </div>
        </Card>
        <Card>
          <SectionHead title="Platform Settings"/>
          <div className="flex flex-col gap-4">
            <div><label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Theme</label>
              <div className="flex gap-2">{(["light","dark"] as const).map(t=>(
                <button key={t} onClick={()=>setTheme(t)} className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold border rounded-xl transition-all ${theme===t?"border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/30":"border-border text-muted-foreground hover:bg-muted"}`}>
                  {t==="light"?<Sun className="w-4 h-4"/>:<Moon className="w-4 h-4"/>}{t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}</div>
            </div>
            {[{l:"Max Upload Size (MB)",v:"100"},{l:"Session Timeout (min)",v:"60"},{l:"Max Students per Guide",v:"12"}].map((f,i)=>(
              <div key={i}><label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">{f.l}</label><input type="number" defaultValue={f.v} className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary text-foreground"/></div>
            ))}
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl">Save Platform Settings</button>
          </div>
        </Card>
      </div>
    </div>
  );
}
