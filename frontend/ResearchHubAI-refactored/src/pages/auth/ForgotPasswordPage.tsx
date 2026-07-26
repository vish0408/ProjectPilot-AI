import { useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle, FlaskConical, Loader2, Mail } from "lucide-react";
import { authService } from "../../services/AuthService";

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
  onResetLink: (token: string, email: string) => void;
}

export default function ForgotPasswordPage({ onBackToLogin, onResetLink }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) { setError("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Invalid email format"); return; }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess("If an account with that email exists, a password reset link has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
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
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Forgot Your Password?</h2>
          <p className="text-blue-200/70 text-base leading-relaxed">Enter your registered email address and we will send you a password reset link.</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden"><div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center"><FlaskConical className="w-4 h-4 text-white" /></div><span className="font-bold text-foreground">ResearchHub AI</span></div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Reset Password</h1>
          <p className="text-muted-foreground text-sm mb-6 sm:mb-7">Enter your email to receive a reset link.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-input-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="you@university.edu"
                />
              </div>
            </div>

            {error && <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300"><AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}</div>}
            {success && <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl text-xs text-green-700 dark:text-green-300"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{success}</div>}

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 sm:py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed touch-target">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Sending...</> : "Send Reset Link"}
            </button>

            <button type="button" onClick={onBackToLogin} className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 touch-target">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
