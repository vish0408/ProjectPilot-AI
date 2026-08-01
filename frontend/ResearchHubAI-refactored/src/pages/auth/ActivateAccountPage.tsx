import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Eye, EyeOff, FlaskConical, Loader2, Lock, RefreshCw } from "lucide-react";
import { authService } from "../../services/AuthService";

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

export default function ActivateAccountPage() {
  const [token, setToken] = useState("");
  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [expired, setExpired] = useState(false);
  const [used, setUsed] = useState(false);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const strength = getStrength(password);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      setError("Invalid activation link. No token provided.");
      setValidating(false);
      return;
    }
    setToken(t);
    validateToken(t);
  }, []);

  async function validateToken(t: string) {
    setValidating(true);
    setError("");
    try {
      const result = await authService.validateActivationToken(t);
      if (result.valid) {
        setValid(true);
        setFullName(result.fullName ?? "");
      } else if (result.expired) {
        setExpired(true);
      } else if (result.used) {
        setUsed(true);
      } else {
        setError("This invitation link is invalid or has already been used.");
      }
    } catch {
      setError("Failed to validate activation link. Please try again.");
    } finally {
      setValidating(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }

    setLoading(true);
    try {
      await authService.activateAccount(token, password, confirmPassword);
      setSuccess("Account activated successfully! Redirecting to login...");

      authService.clearTokens();
      localStorage.clear();
      sessionStorage.clear();

      setTimeout(() => window.location.replace("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate account");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setSuccess("");
    try {
      await authService.resendActivation(token);
      setSuccess("A new invitation has been sent to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend invitation");
    } finally {
      setResending(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex bg-background">
        <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-10 justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #2563EB 1px, transparent 1px), radial-gradient(circle at 80% 80%, #4F46E5 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          <div className="relative"><div className="flex items-center gap-2.5 mb-14"><div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"><FlaskConical className="w-5 h-5 text-white" /></div><span className="font-bold text-xl text-white">ResearchHub <span className="text-blue-400">AI</span></span></div></div>
        </div>
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-muted-foreground">Validating your activation link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen flex bg-background">
        <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-10 justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #2563EB 1px, transparent 1px), radial-gradient(circle at 80% 80%, #4F46E5 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          <div className="relative"><div className="flex items-center gap-2.5 mb-14"><div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"><FlaskConical className="w-5 h-5 text-white" /></div><span className="font-bold text-xl text-white">ResearchHub <span className="text-blue-400">AI</span></span></div></div>
        </div>
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-10">
          <div className="w-full max-w-sm text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Invitation Link Expired</h1>
            <p className="text-muted-foreground text-sm mb-6">This invitation link has expired or is no longer valid.</p>
            {!success ? (
              <div className="flex flex-col gap-3">
                <button onClick={handleResend} disabled={resending} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 sm:py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed touch-target">
                  {resending ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Sending...</> : <><RefreshCw className="w-4 h-4 inline mr-2" />Resend Invitation</>}
                </button>
                <a href="/login" className="text-sm text-blue-600 hover:underline py-2 block">Back to Login</a>
              </div>
            ) : (
              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl text-xs text-green-700 dark:text-green-300 text-left"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{success}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (used) {
    return (
      <div className="min-h-screen flex bg-background">
        <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-10 justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #2563EB 1px, transparent 1px), radial-gradient(circle at 80% 80%, #4F46E5 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          <div className="relative"><div className="flex items-center gap-2.5 mb-14"><div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"><FlaskConical className="w-5 h-5 text-white" /></div><span className="font-bold text-xl text-white">ResearchHub <span className="text-blue-400">AI</span></span></div></div>
        </div>
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-10">
          <div className="w-full max-w-sm text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Already Activated</h1>
            <p className="text-muted-foreground text-sm mb-6">This account has already been activated. Please log in.</p>
            <a href="/login" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 sm:py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/25 text-center block touch-target">Go to Login</a>
          </div>
        </div>
      </div>
    );
  }

  if (!valid && error) {
    return (
      <div className="min-h-screen flex bg-background">
        <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-10 justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #2563EB 1px, transparent 1px), radial-gradient(circle at 80% 80%, #4F46E5 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          <div className="relative"><div className="flex items-center gap-2.5 mb-14"><div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"><FlaskConical className="w-5 h-5 text-white" /></div><span className="font-bold text-xl text-white">ResearchHub <span className="text-blue-400">AI</span></span></div></div>
        </div>
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-10">
          <div className="w-full max-w-sm text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Invalid Link</h1>
            <p className="text-muted-foreground text-sm mb-6">{error}</p>
            <a href="/login" className="text-sm text-blue-600 hover:underline py-2 block">Back to Login</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-10 justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #2563EB 1px, transparent 1px), radial-gradient(circle at 80% 80%, #4F46E5 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-14"><div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"><FlaskConical className="w-5 h-5 text-white" /></div><span className="font-bold text-xl text-white">ResearchHub <span className="text-blue-400">AI</span></span></div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Activate Your Account</h2>
          <p className="text-blue-200/70 text-base leading-relaxed">Welcome{fullName ? `, ${fullName}` : ""}! Set your password to activate your ResearchHub AI account.</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden"><div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center"><FlaskConical className="w-4 h-4 text-white" /></div><span className="font-bold text-foreground">ResearchHub AI</span></div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Set Your Password</h1>
          <p className="text-muted-foreground text-sm mb-6 sm:mb-7">Choose a password to activate your account.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-input-background border border-border rounded-xl pl-10 pr-10 py-2.5 text-base sm:text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="At least 8 characters"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 touch-target">
                  {showPwd ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
              {password && (
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
              <label className="block text-sm font-semibold text-foreground mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-input-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            {error && <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300"><AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}</div>}
            {success && <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl text-xs text-green-700 dark:text-green-300"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{success}</div>}

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 sm:py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed touch-target">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Activating...</> : "Activate Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
