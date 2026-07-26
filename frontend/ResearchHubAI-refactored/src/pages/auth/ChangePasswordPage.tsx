import { useState } from "react";
import { AlertCircle, CheckCircle, Eye, EyeOff, FlaskConical, Loader2, Lock } from "lucide-react";
import { authService } from "../../services/AuthService";

interface ChangePasswordPageProps {
  onSuccess: () => void;
}

function getStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["Weak", "Fair", "Good", "Strong", "Very Strong", "Excellent"];
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500", "bg-emerald-500"];
  return { score: Math.min(score, 5), label: labels[Math.min(score, 5)], color: colors[Math.min(score, 5)] };
}

export default function ChangePasswordPage({ onSuccess }: ChangePasswordPageProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = getStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword) { setError("Current password is required"); return; }
    if (newPassword.length < 8) { setError("New password must be at least 8 characters"); return; }
    if (newPassword !== confirmNewPassword) { setError("New passwords do not match"); return; }
    if (currentPassword === newPassword) { setError("New password must differ from current password"); return; }

    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword, confirmNewPassword);
      authService.clearRequiresPasswordChange();
      setSuccess("Password changed successfully!");
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-10 justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #2563EB 1px, transparent 1px), radial-gradient(circle at 80% 80%, #4F46E5 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-14"><div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"><FlaskConical className="w-5 h-5 text-white" /></div><span className="font-bold text-xl text-white">ResearchHub <span className="text-blue-400">AI</span></span></div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Change Your Password</h2>
          <p className="text-blue-200/70 text-base leading-relaxed mb-6">Your temporary password has expired. Please set a new secure password to continue.</p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <p className="text-white font-bold text-sm">Password Requirements</p>
            <ul className="text-blue-200/60 text-xs space-y-1.5">
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-400" /> At least 8 characters</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-400" /> At least one uppercase letter</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-400" /> At least one lowercase letter</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-400" /> At least one digit</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-400" /> At least one special character</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden"><div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center"><FlaskConical className="w-4 h-4 text-white" /></div><span className="font-bold text-foreground">ResearchHub AI</span></div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Set New Password</h1>
          <p className="text-muted-foreground text-sm mb-6 sm:mb-7">Enter your current password and choose a new one.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-input-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="Enter current password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-input-background border border-border rounded-xl pl-10 pr-10 py-2.5 text-base sm:text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="At least 8 characters"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 touch-target">
                  {showPwd ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength.score ? strength.color : "bg-slate-200 dark:bg-slate-700"} transition-colors`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{strength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full bg-input-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            {error && <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300"><AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}</div>}
            {success && <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl text-xs text-green-700 dark:text-green-300"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{success}</div>}

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 sm:py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed touch-target">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Changing...</> : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
