import { useState } from "react";
import {
  AlertCircle,
  Eye,
  FlaskConical,
  GraduationCap,
  Lock,
  Mail,
  Shield,
  Star,
  UserCheck
} from "lucide-react";

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onForgotPassword?: () => void;
}

export default function LoginPage({ onLogin, onForgotPassword }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-10 justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle at 20% 20%, #2563EB 1px, transparent 1px), radial-gradient(circle at 80% 80%, #4F46E5 1px, transparent 1px)",backgroundSize:"60px 60px"}}/>
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-14"><div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"><FlaskConical className="w-5 h-5 text-white"/></div><span className="font-bold text-xl text-white">ResearchHub <span className="text-blue-400">AI</span></span></div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Enterprise Research Management — Role-Based Access</h2>
          <p className="text-blue-200/70 text-base leading-relaxed mb-10">Three distinct intelligent experiences — automatically assigned based on your institutional role.</p>
          <div className="grid grid-cols-1 gap-4">
            {[{role:"Student",desc:"Personal thesis management, AI assistant, progress tracking",icon:GraduationCap,c:"from-blue-600/30 to-blue-700/20"},{role:"Research Guide",desc:"Student supervision, chapter reviews, approval workflows",icon:UserCheck,c:"from-indigo-600/30 to-indigo-700/20"},{role:"College Admin",desc:"Full platform control, analytics, user & system management",icon:Shield,c:"from-slate-600/40 to-slate-700/30"}].map((r,i)=>(
              <div key={i} className={`flex items-center gap-3 bg-gradient-to-r ${r.c} border border-white/10 rounded-xl px-4 py-3.5`}>
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0"><r.icon className="w-4 h-4 text-white"/></div>
                <div><p className="text-white font-bold text-sm">{r.role}</p><p className="text-blue-200/60 text-xs">{r.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex gap-1">{Array(5).fill(0).map((_,i)=><Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400"/>)}</div>
          <p className="text-white/80 text-sm">"The best research management platform for universities!"</p>
          <p className="text-blue-300/60 text-xs ml-auto whitespace-nowrap">— PhD Scholar, IIT</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden"><div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center"><FlaskConical className="w-4 h-4 text-white"/></div><span className="font-bold text-foreground">ResearchHub AI</span></div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back</h1>
          <p className="text-muted-foreground text-sm mb-7">Sign in — system redirects to your role dashboard automatically</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div><label className="block text-sm font-semibold text-foreground mb-1.5">Institutional Email</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/><input value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-input-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" placeholder="you@university.edu"/></div>
            </div>
            <div><div className="flex items-center justify-between mb-1.5"><label className="block text-sm font-semibold text-foreground">Password</label><button type="button" onClick={onForgotPassword} className="text-xs text-blue-600 hover:underline">Forgot?</button></div>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/><input type={showPwd?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-input-background border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" placeholder="••••••••"/><button type="button" onClick={()=>setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2"><Eye className="w-4 h-4 text-muted-foreground"/></button></div>
            </div>
            {error&&<div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300"><AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5"/>{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? "Signing in..." : "Sign In"}</button>
          </form>


        </div>
      </div>
    </div>
  );
}
