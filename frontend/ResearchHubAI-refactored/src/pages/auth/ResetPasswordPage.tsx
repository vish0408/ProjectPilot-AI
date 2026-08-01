import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Eye, EyeOff, FlaskConical, Loader2, Lock, RefreshCw } from "lucide-react";
import { authService } from "../../services/AuthService";

interface ResetPasswordPageProps {
  token: string;
  email: string;
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

function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-10 justify-between relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #2563EB 1px, transparent 1px), radial-gradient(circle at 80% 80%, #4F46E5 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="relative">
        <div className="flex items-center gap-2.5 mb-14"><div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"><FlaskConical className="w-5 h-5 text-white" /></div><span className="font-bold text-xl text-white">ResearchHub <span className="text-blue-400">AI</span></span></div>
        <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Reset Your Password</h2>
        <p className="text-blue-200/70 text-base leading-relaxed">Choose a new password for your account.</p>
      </div>
    </div>
  );
}

function MobileBranding() {
  return (
    <div className="flex items-center gap-2.5 mb-8 lg:hidden"><div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center"><FlaskConical className="w-4 h-4 text-white" /></div><span className="font-bold text-foreground">ResearchHub AI</span></div>
  );
}

export default function ResetPasswordPage({ token, email, onSuccess }: ResetPasswordPageProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  useEffect(() => {
    if (!token) {
      setTokenError("This password reset link is invalid.");
      setValidating(false);
      return;
    }

    authService.validatePasswordResetToken(token)
      .then((result) => {
        if (result.valid) {
          setTokenValid(true);
        } else if (result.expired) {
          setTokenExpired(true);
          setTokenError("This password reset link has expired.");
        } else {
          setTokenError("This password reset link is invalid.");
        }
      })
      .catch(() => {
        setTokenError("This password reset link is invalid.");
      })
      .finally(() => {
        setValidating(false);
      });
  }, [token]);

  const strength = getStrength(newPassword);

  const handleResend = async () => {
    setResending(true);
    setTokenError("");
    setResendSuccess("");
    try {
      await authService.resendPasswordReset(token);
      setResendSuccess("A new password reset link has been sent to your email.");
    } catch (err) {
      setTokenError(err instanceof Error ? err.message : "Failed to resend password reset link");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (newPassword !== confirmNewPassword) { setError("Passwords do not match"); return; }

    if (!token || !email) { setError("Invalid reset link. Please request a new one."); return; }

    setLoading(true);
    try {
      await authService.resetPassword(token, email, newPassword, confirmNewPassword);
      authService.clearRequiresPasswordChange();
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <LeftPanel />

      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-sm">
          <MobileBranding />

          {validating && (
            <>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-6 sm:mb-7">Validating your reset link...</h1>
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            </>
          )}

          {!validating && !tokenValid && !tokenExpired && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2 text-center">Invalid Link</h1>
              <p className="text-muted-foreground text-sm mb-6 text-center">{tokenError}</p>
              <a href="/login" className="text-sm text-blue-600 hover:underline text-center block py-2 touch-target">Back to Login</a>
            </>
          )}

          {!validating && tokenExpired && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2 text-center">Reset Link Expired</h1>
              <p className="text-muted-foreground text-sm mb-6 text-center">{tokenError}</p>
              {!resendSuccess ? (
                <div className="flex flex-col gap-3">
                  <button onClick={handleResend} disabled={resending} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 sm:py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed touch-target">
                    {resending ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Sending...</> : <><RefreshCw className="w-4 h-4 inline mr-2" />Send New Reset Link</>}
                  </button>
                  <a href="/login" className="text-sm text-blue-600 hover:underline text-center block py-2 touch-target">Back to Login</a>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl text-xs text-green-700 dark:text-green-300 text-left"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{resendSuccess}</div>
              )}
            </>
          )}

          {!validating && tokenValid && (
            <>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">New Password</h1>
              <p className="text-muted-foreground text-sm mb-6 sm:mb-7">Enter your new password below.</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Resetting...</> : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
